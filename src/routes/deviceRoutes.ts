import { Router } from 'express';
import { DeviceService } from '../services/deviceService';
import { User } from '../entities/User';
import AppDataSource from '../config/ormconfig';
import { Device } from '../entities/Device';
import { logError, logInfo } from '../utils/logger';

const router = Router();

/**
 * Step 1:-
 * Add Device information
 */
router.post('/', async (req, res) => {
  const { name, isAvailable, userId, rentedAt } = req.body;

  const deviceRepository = AppDataSource.getRepository(Device);

  // Fetch the user based on userId
  const userRepository = AppDataSource.getRepository(User);
  let user = null;

  if (userId) {
    user = await userRepository.findOne({ where: { id: userId } });
  }

  const device = deviceRepository.create({
    name,
    isAvailable,
    user,
    rentedAt
  });

  try {
    await deviceRepository.save(device);
    logInfo('Device is created successfully');
    res.status(201).json({
      status: true,
      message: 'devicd added successfully.',
      data: device
    });
  } catch (error) {
    logError('Error during inserting device info', error);
    res.status(500).json({ status: false, message: 'Error adding device', error });
  }
});
/**
 * Fetch available device data
 */
router.get('/fetch/available/devices', async (_req, res) => {
  try {
    const devices = await DeviceService.getAvailableDevices();
    logInfo('Availabe Devices are fetched successfully');
    res.status(200).json({
      status: true,
      message: 'successfully fetched.',
      data: devices
    });
  } catch (error) {
    logError('Error during fetching device info', error);
    res.status(500).json({ status: false, message: 'failed to load availabe devices',error: error.message });
  }
});
/**
 * Allocate device to user.
 */
router.post('/allot', async (req, res) => {
  try {
    const { deviceId, userId } = req.body;
    const device = await DeviceService.allotDeviceToUser(deviceId, userId);
    logInfo('Devices Allocation is successfully');
    res.status(200).json({
      status: true,
      message: 'device allocated successfully.',
      data: device
    });
  } catch (error) {
    logError('Error during allocating device', error);
    res.status(400).json({ status: false, message: 'device allocation is failed', error: error.message });
  }
});
/**
 * Return device
 */
router.post('/return', async (req, res) => {
  try {
    const { deviceId } = req.body;
    const device = await DeviceService.returnDevice(deviceId);
    logInfo('Devices returned successfully');
    res.status(200).json({
      status: true,
      message: 'device return successfully.',
      data: device
    });
  } catch (error) {
    logError('Error during device return', error);
    res.status(400).json({ status: false, error: error.message, message: 'Device return failed' });
  }
});
/**
 * API to show rented device to user and how many days it rented.
 */
router.get('/:userId/rented-devices', async (req, res) => {
  try {
    const { userId } = req.params;
    const devices = await DeviceService.getUserRentedDevices(parseInt(userId, 10));
    logInfo('Rented device details fetched successfully');
    res.status(200).json({
      status: true,
      message: 'Device rent details fetched successfully.',
      data: devices
    });
  } catch (error) {
    logError('Error while fetching device rented details', error);
    res.status(500).json({ status: false, error: error.message, message: 'Failed to rent device' });
  }
});
/**
 * Api code to remind user that device is rented to (her/him) more then 5 days.
 * later we can connect this code with worker or cron which will run automate this.
 */
router.get('/rented-devices/reminder', async (req, res) => {
  try {
    const devices = await DeviceService.rentaldeviceReminder();
    logInfo('Rented device reminder is successsful');
    res.status(200).json({
      status: true,
      message: 'successfully fetched overdue devices',
      data: devices
    });
  } catch (error) {
    logError('Error while sending rented device reminder', error);
    res.status(500).json({ status: false, error: error.message, message: 'Failed to fetched overdue devices' });
  }
});
export default router;
