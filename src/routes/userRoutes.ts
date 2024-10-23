import { Router } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../config/ormconfig';
import { logError, logInfo } from '../utils/logger';

const router = Router();
/**
 * Create Users
 */
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({ name, email });

    try {
        await userRepository.save(user);
        logInfo('User is created successfully');
        res.status(201).json({
            status: true,
            message: 'user successfully created.',
            data: user
        });
    } catch (error) {
        logError('Error during inserting user info', error);
        res.status(500).json({ status: false, message: 'Error adding user', error: error.message });
    }
});
/**
 * List users
 */
router.get('/', async (req, res) => {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.status(200).json({
        status: true,
        message: 'successfully fetched.',
        data: users
    });
});
export default router;
