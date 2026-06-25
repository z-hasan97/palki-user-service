import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PalkiLoggerService } from '@palki/logger';
import { KafkaConsumerService, KafkaProducerService } from '@palki/messaging';
import { MessageSignerService } from '@palki/messaging';
import { UserConsumer } from './consumers/user.consumer';
import { ChangePasswordConsumer } from './consumers/change-password.consumer';
import { ClientConsumer } from './consumers/client.consumer';
import { AgentConsumer } from './consumers/agent.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PalkiLoggerService));
  await app.init();
  const logger = app.get(PalkiLoggerService);
  const consumer = app.get(KafkaConsumerService);
  const producer = app.get(KafkaProducerService);
  const signer = app.get(MessageSignerService);
  const handlers: Record<string, any> = {
    'user.get-profile': app.get(UserConsumer), 'user.update-profile': app.get(UserConsumer),
    'user.change-password': app.get(ChangePasswordConsumer),
    'client.create': app.get(ClientConsumer), 'client.findAll': app.get(ClientConsumer),
    'client.findOne': app.get(ClientConsumer), 'client.update': app.get(ClientConsumer),
    'client.delete': app.get(ClientConsumer),
    'agent.create': app.get(AgentConsumer),
    'agent.findAll': app.get(AgentConsumer),
    'agent.findOne': app.get(AgentConsumer),
    'agent.update': app.get(AgentConsumer),
    'agent.delete': app.get(AgentConsumer),
  };

  async function handleAndReply(topic: string, payload: any, handler: any) {
    try {
      const result = await handler.handle(payload.payload || payload);
      const env = signer.sign({ status: 'success', data: result, correlationId: payload.correlationId, messageId: payload.messageId, timestamp: new Date().toISOString() });
      await producer.send(topic + '.reply', env as any);
    } catch (error: any) {
      logger.logError('Handler error', { topic, error: error.message });
      const env = signer.sign({ status: 'error', error: { messageId: payload.messageId, code: 'INTERNAL-5001', message: error.message, timestamp: new Date().toISOString(), correlationId: payload.correlationId } });
      await producer.send(topic + '.reply', env as any);
    }
  }

  await consumer.onModuleInit();
  for (const [topic, handler] of Object.entries(handlers)) {
    await consumer.subscribe(topic, async (p) => {
      const msg = JSON.parse(p.message.value?.toString() || '{}');
      logger.info('Processing ' + topic, { messageId: msg.messageId, correlationId: msg.correlationId });
      await handleAndReply(topic, msg, handler);
    });
  }
  await consumer.startConsuming();
  logger.info('User Service consumers started');
}
bootstrap();
