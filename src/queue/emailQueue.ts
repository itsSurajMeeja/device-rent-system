import 'dotenv/config';
import amqplib from 'amqplib';

const QUEUE_NAME = 'send-acknowledge-email';
const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

/**
 * Function to connect to RabbitMQ and create a channel
 */
async function connectToRabbitMQ() {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Connected to RabbitMQ`);

    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    process.exit(1);
  }
}

export async function sendEmailToQueue(email: string, type: 'allotment' | 'return') {
  const channel = await connectToRabbitMQ();
  const message = JSON.stringify({ email, type });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
  console.log(`Sent message to queue: ${message}`);
}

// Consume messages from the queue and process emails
export async function consumeEmailQueue() {
  const channel = await connectToRabbitMQ();

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const { email, type } = JSON.parse(msg.content.toString());

      try {
        const subject = type === 'allotment' ? 'Device Allotted' : 'Device Returned';
        const text =
          type === 'allotment'
            ? 'Your device has been allotted successfully.'
            : 'Your device has been returned successfully.';
        console.warn(`\nEmail sent to ${email} with subject: device ${subject}\n`);
        channel.ack(msg);
      } catch (error) {
        console.error('Failed to send email:', error);
        channel.nack(msg, false, true); // Requeue the message for retry.
      }
    }
  });
}
