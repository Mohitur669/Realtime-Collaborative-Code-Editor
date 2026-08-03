import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RoomSnapshotDTO } from '@codesync/shared-types';

@Controller('api/persistence')
export class PersistenceController {
  private snapshotDatabase = new Map<string, RoomSnapshotDTO>();

  @Post('snapshot')
  saveSnapshot(@Body() body: RoomSnapshotDTO): { success: boolean; updatedAt: number } {
    const key = `${body.roomId}:${body.documentName}`;
    const record: RoomSnapshotDTO = {
      ...body,
      updatedAt: Date.now(),
    };
    this.snapshotDatabase.set(key, record);
    return { success: true, updatedAt: record.updatedAt };
  }

  @Get('snapshot/:roomId/:documentName')
  getSnapshot(
    @Param('roomId') roomId: string,
    @Param('documentName') documentName: string,
  ): RoomSnapshotDTO | { snapshot: null } {
    const key = `${roomId}:${documentName}`;
    const found = this.snapshotDatabase.get(key);
    if (!found) {
      return { snapshot: null };
    }
    return found;
  }
}
