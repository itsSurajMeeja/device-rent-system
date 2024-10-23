import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Device } from '../entities/Device';
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: true,
  entities: [User, Device],
  migrations: ["src/migrations/**/*.ts"],
});
export default AppDataSource;