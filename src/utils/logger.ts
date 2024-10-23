import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Logs to console
    // Add file transport if needed
    // new transports.File({ filename: 'combined.log' })
  ],
});

export const logInfo = (message: string) => {
  logger.info(message);
};

export const logError = (message: string, err: any) => {
  logger.error(message, err);
};

export const logDebug = (message: string) => {
  logger.debug(message);
};
