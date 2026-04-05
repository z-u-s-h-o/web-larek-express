import express from 'express';
import uploadSingleFile from '../middleware/file';
import handleFileUpload from '../controllers/upload';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', auth, uploadSingleFile, handleFileUpload);

export default router;
