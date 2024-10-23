import { LessThanOrEqual } from 'typeorm';
import AppDataSource from '../config/ormconfig';
import { Device } from '../entities/Device';
import { User } from '../entities/User';
import { sendEmailToQueue } from '../queue/emailQueue';

export class DeviceService {
  static async getAvailableDevices() {
    return AppDataSource.getRepository(Device).find({
      where: { isAvailable: true },
    });
  }

  static async allotDeviceToUser(deviceId: number, userId: number) {
    const deviceRepository = AppDataSource.getRepository(Device);
    const userRepository = AppDataSource.getRepository(User);

    const device = await deviceRepository.findOne({ where: { id: deviceId } });
    if (!device || !device.isAvailable) {
      throw new Error('Device is not available');
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    device.isAvailable = false;
    device.user = user;
    device.rentedAt = new Date();
    await deviceRepository.save(device);

    sendEmailToQueue(user.email, 'allotment');

    return device;
  }

  static async returnDevice(deviceId: number) {
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOne({ where: { id: deviceId } });

    if (!device || device.isAvailable) {
      throw new Error('Device is not rented');
    }

    const userEmail = device.user?.email;
    device.isAvailable = true;
    device.user = null;
    device.rentedAt = null;
    await deviceRepository.save(device);

    if (userEmail) {
      sendEmailToQueue(userEmail, 'return');
    }

    return device;
  }

  static async getUserRentedDevices(userId: number) {
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    try {
      // Find the user by ID, along with their rented devices
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }
      const rentedDevices = await AppDataSource.getRepository(Device).find({
        where: { isAvailable: false },
      });

      // Calculate the number of days each device has been rented
      const rentedDevicesWithDays = rentedDevices.map((device) => {
        const rentedAt = device.rentedAt!;
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - rentedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: device.id,
          name: device.name,
          rentedAt: device.rentedAt,
          rentedDays: diffDays,
        };
      });
      return rentedDevicesWithDays;
    } catch (error) {
      console.error('Error fetching rented devices:', error);
      return ({ data: { error: 'Internal server error' } });
    }
  }
  static async rentaldeviceReminder(){
    try {
      const device = await AppDataSource.getRepository(Device).findOne({ where: { isAvailable: false } });
  
      if (!device) {
        throw new Error('All devices are free');
      }
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const overdueDevices = await AppDataSource.getRepository(Device).find({
        where: {
          rentedAt: LessThanOrEqual(fiveDaysAgo),
          isAvailable: false,
        },
        relations: ['user'], 
      });
      const result = [];
      for (const device of overdueDevices) {
        console.warn(`\nEmail will be send here to user ${device.user?.email} for renting device more then 5 days\n`);
        result.push({
          userId: device.user?.id,
          userName: device.user?.name,
          userEmail: device.user?.email,
          deviceId: device.id,
          deviceName: device.name,
          rentedAt: device.rentedAt,
        });
      }
      return result;
    } catch (error) {
      console.error('Error fetching overdue devices:', error);
      throw new error('Error fetching overdue devices');
    }
  }
}
