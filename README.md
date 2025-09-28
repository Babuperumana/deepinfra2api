# deepinfra2api

## Project Overview

**deepinfra2api** is a proxy service that lets you access various AI models hosted on DeepInfra using the standard OpenAI API format. It provides a simple interface to list models and send chat completion requests, making it easy to integrate DeepInfra’s AI models into your applications.

The project is built with **Bun**, supports deployment via **Docker**, and includes complete API documentation and usage examples.

## Environment Variables

The project supports the following environment variables:

- `PORT` — Service listen port (default: `12506`)
- `API_KEY` — API key used to authenticate requests (default: `default-key-change-me`)
- `CORS_ORIGINS` — Allowed CORS origins (comma-separated). Default: `*` (allow all origins)

## Run Locally

### Using Bun (recommended)

Install dependencies:

```bash
bun install
```

Start the service:

```bash
bun run index.ts
```

The service will run at: <http://localhost:12506>

### Using Docker

Pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/xlfish233/deepinfra2api:latest
```

Run the container:

```bash
docker run -p 12506:12506 ghcr.io/xlfish233/deepinfra2api:latest
```

Or use Docker Compose:

```bash
docker-compose up -d
```

You can also build the image yourself:

```bash
docker build -t deepinfra2api .
```

Then run:

```bash
docker run -p 12506:12506 deepinfra2api
```

### Using Docker Compose (recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  deepinfra2api:
    image: ghcr.io/xlfish233/deepinfra2api:latest
    ports:
      - "12506:12506"
    environment:
      - PORT=12506
      - API_KEY=your-api-key-here
      - CORS_ORIGINS=*
```

Then start it:

```bash
docker-compose up -d
```

## API Endpoints

### `GET /models`

Retrieve the list of available models.

**Response example:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "object": "model",
      "created": 1640995200,
      "owned_by": "meta-llama"
    }
    // ... more models
  ]
}
```

### `POST /chat/completions`

Send a chat completion request.

**Request example:**
```json
{
  "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

**Response:**
This endpoint proxies the response directly from the DeepInfra API and supports streaming.

## Usage

Once the service is running, you can use it like the OpenAI API:

```javascript
// Example: list models
fetch('http://localhost:12506/models')

// Example: send a chat request
fetch('http://localhost:12506/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN' // any non-empty value required
  },
  body: JSON.stringify({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      { role: "user", content: "Hello!" }
    ]
  })
})
```

## Supported Models

This project supports the following DeepInfra models:

- deepseek-ai/DeepSeek-V3.1
- openai/gpt-oss-120b
- Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo
- zai-org/GLM-4.5
- moonshotai/Kimi-K2-Instruct
- allenai/olmOCR-7B-0725-FP8
- Qwen/Qwen3-235B-A22B-Thinking-2507
- Qwen/Qwen3-Coder-480B-A35B-Instruct
- zai-org/GLM-4.5-Air
- mistralai/Voxtral-Small-24B-2507
- mistralai/Voxtral-Mini-3B-2507
- deepseek-ai/DeepSeek-R1-0528-Turbo
- Qwen/Qwen3-235B-A22B-Instruct-2507
- Qwen/Qwen3-30B-A3B
- Qwen/Qwen3-32B
- Qwen/Qwen3-14B
- deepseek-ai/DeepSeek-V3-0324-Turbo
- bigcode/starcoder2-15b
- Phind/Phind-CodeLlama-34B-v2
- Gryphe/MythoMax-L2-13b
- openchat/openchat_3.5
- openai/whisper-tiny
- meta-llama/Llama-3.3-70B-Instruct

## Deployment

GitHub Actions CI/CD is configured for this project and will automatically push the image to GitHub Container Registry (GHCR).

> This project was created using `bun init` on Bun v1.2.20. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
