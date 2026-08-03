import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RoomGateway } from './room.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [RoomGateway],
})
export class AppModule {}
