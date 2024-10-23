import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import AppDataSource  from './config/ormconfig';
import deviceRoutes from './routes/deviceRoutes';
import userRoutes from './routes/userRoutes';
import { consumeEmailQueue } from './queue/emailQueue';
import { logInfo, logError } from './utils/logger';

const port = process.env.PORT;
const app = express();
app.use(bodyParser.json());
app.use('/devices', deviceRoutes);
app.use('/users', userRoutes);

AppDataSource.initialize()
  .then(() => {
    logInfo('Data Source has been initialized!');
    app.listen(port, () => {
      logInfo(`Server is running on port ${port}`);
      consumeEmailQueue();
    });
  })
  .catch((err) => {
    logError('Error during Data Source initialization', err);
  });
