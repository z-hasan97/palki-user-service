import { Module } from '@nestjs/common';
import { ConfigModule } from '@palki/config';
import { LoggerModule } from '@palki/logger';
import { DatabaseModule } from '@palki/database';
import { KafkaConsumerService, KafkaProducerService } from '@palki/messaging';
import { MessageSignerService } from '@palki/messaging';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Agent } from './entities/agent.entity';
import { Package } from './entities/package.entity';
import { UserService } from './services/user.service';
import { UserConsumer } from './consumers/user.consumer';
import { ChangePasswordConsumer } from './consumers/change-password.consumer';
import { ClientConsumer } from './consumers/client.consumer';
import { AgentConsumer } from './consumers/agent.consumer';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule.forRoot([User, Client, Agent, Package])],
  providers: [
    KafkaConsumerService, KafkaProducerService, MessageSignerService,
    UserService, UserConsumer, ChangePasswordConsumer, ClientConsumer, AgentConsumer,
  ],
})
export class AppModule {}
