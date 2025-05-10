import express from 'express';
const router = express.Router();
import userRoutes from './user-routes.js';

// All of these routes are prefixed with '/api'
router.use('/users', userRoutes);

export default router;
