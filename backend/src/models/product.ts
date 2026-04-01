import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

const {
  UPLOAD_PATH = 'image',
} = process.env;

interface IImage {
  fileName: string;
  originalName: string;
}

interface IProduct {
    title: string;
    image: IImage;
    category: string;
    description?: string;
    price: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
  },
  image: {
    type: {
      fileName: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

// триггер после удаления — для очистки связанных с документом файлов
productSchema.post('findOneAndDelete', async (doc) => {
  if (doc && doc.image && doc.image.fileName) {
    try {
      const filePath = path.join(process.cwd(), 'public', UPLOAD_PATH, doc.image.fileName);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      } else {
        throw new Error(`Файл не найден при удалении: ${filePath}`);
      }
    } catch (error) {
      throw new Error(`Ошибка при удалении файла: ${error}`);
    }
  }
});

export default mongoose.model<IProduct>('product', productSchema);
