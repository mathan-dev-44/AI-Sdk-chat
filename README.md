# AI SDK Chat

A full-stack AI chat application built with the [Vercel AI SDK v5](https://ai-sdk.dev/), featuring a React frontend and NestJS backend powered by Google Gemini.

## Stack

| Layer    | Tech                                                    |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, AI SDK v5   |
| Backend  | NestJS, AI SDK v5, Google Gemini (`@ai-sdk/google`)     |
| Database | MongoDB (via Mongoose)                                  |

## Project Structure

```
AI-Sdk-chat/
├── aisdk-react/   # React frontend
└── aisdk-server/  # NestJS backend
```

## Features

- Streaming chat responses via `streamText` with `pipeUIMessageStreamToResponse`
- Multi-step tool calling (calculator, weather)
- Rich AI-rendered UI elements: reasoning, sources, artifacts, canvas, code blocks, chain-of-thought, web preview, and more
- Model selector with provider logos
- Light/dark theme toggle
- Image/file analysis support

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- MongoDB instance
- Google AI API key

### Backend

```bash
cd aisdk-server
pnpm install
# Create a .env file with:
# GOOGLE_API_KEY=your_key_here
pnpm start:dev
```

### Frontend

```bash
cd aisdk-react
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

## Models Used

- `gemini-2.5-flash` — primary chat model
- `gemini-2.0-flash-lite-preview` — streaming utility responses
