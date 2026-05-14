INSERT INTO storage.buckets (id, name, public) VALUES
  ('seller-application-documents', 'seller-application-documents', false),
  ('store-images', 'store-images', true),
  ('product-images', 'product-images', true),
  ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;
