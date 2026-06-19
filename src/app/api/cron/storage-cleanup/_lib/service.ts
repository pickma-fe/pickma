import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import type { Logger } from '@/app/api/_lib/logger';

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
  parentPath: string,
  logger: Logger
): Promise<StorageFile[]> {
  const files: StorageFile[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(parentPath, { limit: LIST_LIMIT, offset });

    if (error) {
      logger.error('STORAGE_CLEANUP_LIST_FAILED', {
        bucket: BUCKET,
        parentPath,
        message: error.message,
      });
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

      if (item.id === null) {
        const nested = await listAllFiles(supabase, fullPath, logger);
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

export async function runStorageCleanup(
  logger: Logger
): Promise<{ deletedCount: number }> {
  const supabase = createServiceRoleClient();

  const dbPaths = new Set<string>();
  let dbOffset = 0;

  while (true) {
    const { data, error: dbError } = await supabase
      .from('seller_application_documents')
      .select('storage_path')
      .range(dbOffset, dbOffset + DB_PAGE_SIZE - 1);

    if (dbError) {
      logger.error('STORAGE_CLEANUP_DB_QUERY_FAILED', {
        message: dbError.message,
      });
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    if (!data || data.length === 0) break;

    for (const row of data) dbPaths.add(row.storage_path);

    if (data.length < DB_PAGE_SIZE) break;
    dbOffset += DB_PAGE_SIZE;
  }

  const allFiles = await listAllFiles(supabase, '', logger);

  const orphanPaths = allFiles
    .filter(
      (f) =>
        f.createdAt !== null &&
        !dbPaths.has(f.path) &&
        daysSince(f.createdAt) > ORPHAN_DAYS
    )
    .map((f) => f.path);

  if (orphanPaths.length === 0) {
    logger.info('STORAGE_CLEANUP_COMPLETED', { deletedCount: 0 });
    return { deletedCount: 0 };
  }

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(orphanPaths);

  if (removeError) {
    logger.error('STORAGE_CLEANUP_REMOVE_FAILED', {
      bucket: BUCKET,
      count: orphanPaths.length,
      message: removeError.message,
    });
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  logger.info('STORAGE_CLEANUP_COMPLETED', {
    deletedCount: orphanPaths.length,
  });
  return { deletedCount: orphanPaths.length };
}
