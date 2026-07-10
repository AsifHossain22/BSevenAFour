import { Request, Response, Router } from 'express';
import { userController } from './user.controller';
const router = Router();

// RegisterUser
router.post('/register', userController.registerUser);

export const userRoutes = router;
