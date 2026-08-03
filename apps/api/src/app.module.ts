import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RoomGateway } from './room.gateway';
import { LiveKitController } from './livekit.controller';

@Module({
  imports: [],
  controllers: [AppController, LiveKitController],
  providers: [RoomGateway],
})
export class AppModule {}
