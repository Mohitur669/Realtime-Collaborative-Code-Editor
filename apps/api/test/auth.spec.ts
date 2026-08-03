import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../src/auth.controller';

describe('AuthController (/api/auth)', () => {
  let app: INestApplication;
  let controller: AuthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = app.get(AuthController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate user and return token', async () => {
    const res = controller.login({ username: 'alice' });

    expect(res.token).toBeDefined();
    expect(res.user.username).toBe('alice');
  });

  it('should verify valid bearer token', async () => {
    const loginRes = controller.login({ username: 'bob' });
    const verifyRes = controller.verify(`Bearer ${loginRes.token}`);

    expect(verifyRes.valid).toBe(true);
    expect(verifyRes.token).toBe(loginRes.token);
  });

  it('should throw UnauthorizedException on missing bearer header', () => {
    expect(() => controller.verify('')).toThrow(UnauthorizedException);
  });
});
