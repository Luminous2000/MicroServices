const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("connected to Rabbitmq");
  } catch (error) {
    console.log("error:", error);
  }
}

async function subscribeToQueue(queueName, callback) {
  try {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.consume(queueName, (message) => {
      callback(message.content.toString());
      channel.ack(message);
    });
  } catch (error) {
    console.error("Error subscribing to queue:", error);
  }
}

async function publishToQueue(queueName, data) {
  try {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data));
  } catch (error) {
    console.error("Error publishing to queue:", error);
  }
}

module.exports = {
  subscribeToQueue,
  publishToQueue,
  connect,
};
