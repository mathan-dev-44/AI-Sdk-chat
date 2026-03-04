import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Injectable } from '@nestjs/common';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai';
import { Response } from 'express';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

@Injectable()
export class AiService {
  public google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });
  private history: Message[] = [];

  // async chat(prompt: string) {
  //   this.history.push({ role: 'user', text: prompt });
  //   const { text } = await generateText({
  //     model: this.google('gemini-2.5-flash'),
  //     messages: this.history.map((m) => ({
  //       role: m.role,
  //       content: m.text,
  //     })),
  //     tools: {
  //       search: this.google.tools.googleSearch({}),
  //     },
  //   });
  //   this.history.push({ role: 'assistant', text });
  //   return text;
  // }

  chat(res: Response, req: Request) {
    const { messages }: { messages: UIMessage[] } = req.body as any;

    const result = streamText({
      model: this.google('gemini-2.5-flash'),
      system:
        'You are a helpful AI assistant. When the user shares images or files, analyze and describe them in detail. Always respond in the same language the user writes in.',
      messages: convertToModelMessages(messages),
    });
    // send sources and reasoning back to the client
    return result.pipeUIMessageStreamToResponse(res);
  }

  async streamResponse(prompt: string, onChunk: (text: string) => void) {
    const stream = await streamText({
      model: this.google('gemini-2.0-flash-lite-preview'),
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream.textStream) {
      onChunk(chunk);
    }
  }

  public async getWeather(location: string) {
    const { text } = await streamText({
      model: this.google('gemini-2.5-flash'),
      tools: {
        weather: tool({
          description: 'Get the weather in a location (in Fahrenheit)',
          inputSchema: z.object({
            location: z
              .string()
              .describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: 72 + Math.floor(Math.random() * 21) - 10,
          }),
        }),
        convertFahrenheitToCelsius: tool({
          description: 'Convert temperature from Fahrenheit to Celsius',
          inputSchema: z.object({
            temperature: z.number().describe('Temperature in Fahrenheit'),
          }),
          execute: async ({ temperature }) => {
            const celsius = Math.round((temperature - 32) * (5 / 9));
            return { celsius };
          },
        }),
      },
      stopWhen: stepCountIs(20),
      prompt: `Get the temperature for ${location} and convert to Celsius`,
    });
    return text;
  }
}
