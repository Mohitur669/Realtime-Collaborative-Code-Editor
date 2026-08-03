import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AiController } from '../src/ai.controller';

describe('AiController (POST /api/ai/completion)', () => {
  let app: INestApplication;
  let controller: AiController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AiController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = app.get(AiController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return explain AI completion', async () => {
    const res = await controller.getCompletion({
      prompt: 'Explain code',
      contextCode: 'const x = 10;',
      action: 'explain',
    });

    expect(res).toBeDefined();
    expect(res.action).toBe('explain');
    expect(res.result).toContain('Code Explanation');
  });

  it('should return generate code completion', async () => {
    const res = await controller.getCompletion({
      prompt: 'User Auth Helper',
      action: 'generate',
    });

    expect(res).toBeDefined();
    expect(res.action).toBe('generate');
    expect(res.result).toContain('UserAuthHelper');
  });
});
