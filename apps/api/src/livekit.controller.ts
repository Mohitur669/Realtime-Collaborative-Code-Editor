import { Controller, Post, Body } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { LiveKitTokenRequest, LiveKitTokenResponse } from '@codesync/shared-types';

@Controller('api/livekit')
export class LiveKitController {
  @Post('token')
  async createToken(@Body() body: LiveKitTokenRequest): Promise<LiveKitTokenResponse> {
    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secretsecretsecretsecretsecretsecretsecret';
    const wsUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';

    const isConfigured = Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);

    const at = new AccessToken(apiKey, apiSecret, {
      identity: body.participantName || 'Guest',
      name: body.participantName || 'Guest',
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: body.roomName || 'default-room',
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return {
      token,
      wsUrl,
      isConfigured,
    };
  }
}
