import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get()
  getHome(): string {
    return '<h1>Welcome to the code editor server</h1>';
  }
}
