import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RoomGateway } from './room.gateway';
import { LiveKitController } from './livekit.controller';
import { RecordingsController } from './recordings.controller';

@Module({
  imports: [],
  controllers: [AppController, LiveKitController, RecordingsController],
  providers: [RoomGateway],
})
export class AppModule {}
