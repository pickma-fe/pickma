import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

const BUCKET = 'seller-application-documents';
const ORPHAN_DAYS = 30;
const LIST_LIMIT = 100;
const DB_PAGE_SIZE = 1000;

interface StorageFile {
  path: string;
  createdAt: string | null;
}

async function listAllFiles(
  supabase: ReturnType<typeof createServiceRoleClient>,
  parentPath: string
): Promise<StorageFile[]> {
  const files: StorageFile[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(parentPath, { limit: LIST_LIMIT, offset });

    if (error) {
      // TODO: logger 추가 후 error 원본 로깅
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

      if (item.id === null) {
        const nested = await listAllFiles(supabase, fullPath);
        files.push(...nested);
      } else {
        files.push({
          path: fullPath,
          createdAt: item.created_at ?? null,
        });
      }
    }

    if (data.length < LIST_LIMIT) break;
    offset += LIST_LIMIT;
  }

  return files;
}

function daysSince(isoString: string): number {
  const ms = Date.now() - new Date(isoString).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export async function runStorageCleanup(): Promise<{ deletedCount: number }> {
  const supabase = createServiceRoleClient();

  const dbPaths = new Set<string>();
  let dbOffset = 0;

  while (true) {
    const { data, error: dbError } = await supabase
      .from('seller_application_documents')
      .select('storage_path')
      .range(dbOffset, dbOffset + DB_PAGE_SIZE - 1);

    if (dbError) {
      // TODO: logger 추가 후 dbError 원본 로깅
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    if (!data || data.length === 0) break;

    for (const row of data) dbPaths.add(row.storage_path);

    if (data.length < DB_PAGE_SIZE) break;
    dbOffset += DB_PAGE_SIZE;
  }

  const allFiles = await listAllFiles(supabase, '');

  const orphanPaths = allFiles
    .filter(
      (f) =>
        f.createdAt !== null &&
        !dbPaths.has(f.path) &&
        daysSince(f.createdAt) > ORPHAN_DAYS
    )
    .map((f) => f.path);

  if (orphanPaths.length === 0) {
    return { deletedCount: 0 };
  }

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(orphanPaths);

  if (removeError) {
    // TODO: logger 추가 후 removeError 원본 로깅
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return { deletedCount: orphanPaths.length };
}
