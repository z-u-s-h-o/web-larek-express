import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const renameAsync = promisify(fs.rename);

const {
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;

const TEMP_BASE_DIR = path.join(process.cwd(), UPLOAD_PATH_TEMP);
const FINAL_BASE_DIR = path.join(process.cwd(), 'public', UPLOAD_PATH);

if (!fs.existsSync(TEMP_BASE_DIR)) {
  fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
}
if (!fs.existsSync(FINAL_BASE_DIR)) {
  fs.mkdirSync(FINAL_BASE_DIR, { recursive: true });
}

const moveFileFromTemp = async (
  tempPath: string,
  finalPath: string,
): Promise<void> => {
  const absoluteTempPath = path.join(TEMP_BASE_DIR, tempPath);
  const absoluteFinalPath = path.join(FINAL_BASE_DIR, finalPath);

  try {
    await renameAsync(absoluteTempPath, absoluteFinalPath);
  } catch (error) {
    throw new Error('Ошибка при перемещении файла');
  }
};

export default moveFileFromTemp;
