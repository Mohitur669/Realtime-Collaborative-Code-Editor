import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RecordingsController } from '../src/recordings.controller';

describe('RecordingsController (/api/recordings)', () => {
  let app: INestApplication;
  let controller: RecordingsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecordingsController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = app.get(RecordingsController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should start, record events, stop recording, and retrieve session replay', async () => {
    const startRes = controller.startRecording({
      roomId: 'test-room-1',
      title: 'Debugging Session',
    });

    expect(startRes.recordingId).toBeDefined();
    expect(typeof startRes.startedAt).toBe('number');

    controller.addEvent({
      recordingId: startRes.recordingId,
      type: 'code',
      author: 'alice',
      detail: 'Added function calculateTotal',
    });

    controller.addEvent({
      recordingId: startRes.recordingId,
      type: 'chat',
      author: 'bob',
      detail: 'LGTM!',
    });

    const stopRes = controller.stopRecording({
      recordingId: startRes.recordingId,
    });

    expect(stopRes.id).toBe(startRes.recordingId);
    expect(stopRes.events.length).toBe(4); // Start, 2 events, Stop

    const listRes = controller.getRecordingsForRoom('test-room-1');
    expect(listRes.recordings.length).toBe(1);
    expect(listRes.recordings[0].title).toBe('Debugging Session');

    const detailRes = controller.getRecordingDetail(startRes.recordingId);
    expect(detailRes.id).toBe(startRes.recordingId);
  });
});
