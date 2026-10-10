import amqp from "amqplib";

const DOMAIN_EVENT_EXCHANGE = "bookbuddy.domain";
const DOMAIN_EVENT_DLX = "bookbuddy.domain.dlx";
const DOMAIN_EVENTS_DLQ = "domain_events_dlq";

const RABBIT_URL = process.env.RABBITMQ_URL ?? "amqp://user:password@localhost:5672";

async function assertTopology() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(DOMAIN_EVENT_EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(DOMAIN_EVENT_DLX, "topic", { durable: true });

  await channel.assertQueue(DOMAIN_EVENTS_DLQ, { durable: true });
  await channel.bindQueue(DOMAIN_EVENTS_DLQ, DOMAIN_EVENT_DLX, "#");

  console.log(
    `RabbitMQ topology OK: ${DOMAIN_EVENT_EXCHANGE}, ${DOMAIN_EVENT_DLX}, ${DOMAIN_EVENTS_DLQ}`,
  );

  await channel.close();
  await connection.close();
}

try {
  await assertTopology();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("RabbitMQ topology init failed:", message);
  process.exit(1);
}
