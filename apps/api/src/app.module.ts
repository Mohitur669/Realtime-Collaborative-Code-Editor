import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RoomGateway } from './room.gateway';
import { LiveKitController } from './livekit.controller';
import { RecordingsController } from './recordings.controller';
import { AiController } from './ai.controller';
import { PersistenceController } from './persistence.controller';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    LiveKitController,
    RecordingsController,
    AiController,
    PersistenceController,
    AuthController,
  ],
  providers: [RoomGateway],
})
export class AppModule {}
