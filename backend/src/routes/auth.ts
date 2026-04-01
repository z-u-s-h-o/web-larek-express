import express from 'express';
import {
  login, getCurrentUser, register, logout, refreshAccessToken,
} from '../controllers/auth';
import { validateLogin } from '../middleware/validators/login';
import { validateRegister } from '../middleware/validators/register';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
