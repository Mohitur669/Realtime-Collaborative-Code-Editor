import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LiveKitController } from '../src/livekit.controller';

describe('LiveKitController (POST /api/livekit/token)', () => {
  let app: INestApplication;
  let controller: LiveKitController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LiveKitController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = app.get(LiveKitController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return a signed LiveKit JWT token and wsUrl', async () => {
    const res = await controller.createToken({
      roomName: 'test-av-room',
      participantName: 'alice',
    });

    expect(res).toBeDefined();
    expect(typeof res.token).toBe('string');
    expect(res.token.length).toBeGreaterThan(20);
    expect(res.wsUrl).toBeDefined();
    expect(typeof res.isConfigured).toBe('boolean');
  });
});
