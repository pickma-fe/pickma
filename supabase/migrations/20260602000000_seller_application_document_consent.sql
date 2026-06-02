ALTER TABLE seller_applications
  ADD COLUMN IF NOT EXISTS document_consent_agreed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS document_consent_agreed_at timestamptz;

CREATE OR REPLACE FUNCTION create_seller_application(
  p_user_id                   uuid,
  p_business_number           text,
  p_company_name              text,
  p_representative_name       text,
  p_business_address          text,
  p_business_type             text,
  p_business_category         text,
  p_documents                 jsonb,
  p_document_consent_agreed   boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application_id uuid;
  v_doc            jsonb;
BEGIN
  IF p_document_consent_agreed IS NOT TRUE THEN
    RAISE EXCEPTION 'DOCUMENT_CONSENT_REQUIRED';
  END IF;

  IF jsonb_typeof(p_documents) <> 'array'
     OR jsonb_array_length(p_documents) <> 3 THEN
    RAISE EXCEPTION 'INVALID_APPLICATION_DOCUMENTS';
  END IF;

  IF (
    SELECT COUNT(DISTINCT (elem->>'type')::seller_application_document_type)
    FROM jsonb_array_elements(p_documents) AS elem
  ) <> 3 THEN
    RAISE EXCEPTION 'INVALID_APPLICATION_DOCUMENTS';
  END IF;

  INSERT INTO seller_applications (
    user_id, status, business_number, company_name, representative_name,
    business_address, business_type, business_category,
    document_consent_agreed, document_consent_agreed_at
  ) VALUES (
    p_user_id, 'pending', p_business_number, p_company_name, p_representative_name,
    p_business_address, p_business_type, p_business_category,
    p_document_consent_agreed, now()
  )
  RETURNING id INTO v_application_id;

  FOR v_doc IN SELECT * FROM jsonb_array_elements(p_documents)
  LOOP
    INSERT INTO seller_application_documents (
      application_id, type, storage_path, original_file_name, content_type, size
    ) VALUES (
      v_application_id,
      (v_doc->>'type')::seller_application_document_type,
      v_doc->>'storage_path',
      v_doc->>'original_file_name',
      v_doc->>'content_type',
      (v_doc->>'size')::bigint
    );
  END LOOP;

  RETURN v_application_id;
END;
$$;

DROP FUNCTION IF EXISTS create_seller_application(uuid, text, text, text, text, text, text, jsonb);
REVOKE EXECUTE ON FUNCTION create_seller_application(uuid, text, text, text, text, text, text, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_seller_application(uuid, text, text, text, text, text, text, jsonb, boolean) TO service_role;
