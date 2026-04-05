import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../temp/uploads');

// функция для очистки файлов старше 1 часа
const cleanupOldFiles = async () => {
  try {
    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const files = await fs.promises.readdir(tempDir);

    const cleanupPromises = files.map(async (filename) => {
      try {
        const filePath = path.join(tempDir, filename);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtime.getTime() > oneHour) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        throw new Error(`Ошибка при очистке старых файлов: ${error}`);
      }
    });

    await Promise.all(cleanupPromises);
  } catch (error) {
    throw new Error(`Ошибка при очистке старых файлов: ${error}`);
  }
};

// Запускаем cron каждые 30 минут
const job = new CronJob('0 */30 * * * *', cleanupOldFiles);
job.start();

export default cleanupOldFiles;
