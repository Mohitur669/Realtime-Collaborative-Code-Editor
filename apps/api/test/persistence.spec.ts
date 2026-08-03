import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PersistenceController } from '../src/persistence.controller';

describe('PersistenceController (/api/persistence)', () => {
  let app: INestApplication;
  let controller: PersistenceController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PersistenceController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = app.get(PersistenceController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should save document snapshot and retrieve it', async () => {
    const saveRes = controller.saveSnapshot({
      roomId: 'room-abc',
      documentName: 'main.js',
      snapshot: 'SGVsbG8gV29ybGQ=', // Base64 for "Hello World"
      updatedAt: Date.now(),
    });

    expect(saveRes.success).toBe(true);
    expect(saveRes.updatedAt).toBeDefined();

    const getRes: any = controller.getSnapshot('room-abc', 'main.js');
    expect(getRes.snapshot).toBe('SGVsbG8gV29ybGQ=');
    expect(getRes.roomId).toBe('room-abc');
  });
});
