import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { Response } from 'express';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Res() res, @Req() req) {
    return this.aiService.chat(res, req);
  }

  @Post('stream')
  async stream(@Body('prompt') prompt: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.aiService.streamResponse(prompt, (chunk) => {
      res.write(`data: ${chunk}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  }

  @Post('weather')
  async weather(@Body() body: { location: string }) {
    return { bot: await this.aiService.getWeather(body.location) };
  }
}
