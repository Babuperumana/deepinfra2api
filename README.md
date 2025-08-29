# deepinfra2api

## 项目介绍

deepinfra2api 是一个代理服务，允许您通过标准的OpenAI API格式访问DeepInfra上的各种AI模型。它提供了一个简单的接口来获取模型列表和发送聊天完成请求，使您可以轻松集成DeepInfra的AI模型到您的应用程序中。

该项目使用Bun构建，支持通过Docker部署，并提供了完整的API文档和使用示例。

## 环境变量配置

项目支持以下环境变量配置：

- `PORT` - 服务监听端口，默认为 `12506`
- `API_KEY` - API密钥，用于验证请求，默认为 `default-key-change-me`
- `CORS_ORIGINS` - 允许的CORS来源，多个来源用逗号分隔，默认为 `*`（允许所有来源）

## 本地运行

### 使用Bun（推荐）

安装依赖:

```bash
bun install
```

运行服务:

```bash
bun run index.ts
```

服务将在 http://localhost:12506 上运行。

### 使用Docker

从GitHub Container Registry拉取镜像:

```bash
docker pull ghcr.io/xlfish233/deepinfra2api:latest
```

运行容器:

```bash
docker run -p 12506:12506 ghcr.io/xlfish233/deepinfra2api:latest
```

或者使用docker-compose:

```bash
docker-compose up -d
```

你也可以自己构建镜像:

```bash
docker build -t deepinfra2api .
```

然后运行:

```bash
docker run -p 12506:12506 deepinfra2api
```

### 使用Docker Compose（推荐）

创建一个 `docker-compose.yml` 文件：

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

然后运行:

```bash
docker-compose up -d
```

## API端点

### GET /models

获取可用模型列表。

**响应示例:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "object": "model",
      "created": 1640995200,
      "owned_by": "meta-llama"
    },
    // ... 更多模型
  ]
}
```

### POST /chat/completions

发送聊天完成请求。

**请求示例:**
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

**响应:**
该端点将直接返回DeepInfra API的响应，支持流式传输。

## 使用方法

服务启动后，您可以像使用OpenAI API一样使用它：

```javascript
// 示例：获取模型列表
fetch('http://localhost:12506/models')

// 示例：发送聊天请求
fetch('http://localhost:12506/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN' // 任意值，但必须提供
  },
  body: JSON.stringify({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      {
        role: "user",
        content: "Hello!"
      }
    ]
  })
})
```

## 支持的模型

该项目支持以下DeepInfra模型：

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

## 部署

此项目配置了GitHub Actions CI/CD，会自动将镜像推送到GitHub Container Registry (GHCR)。

This project was created using `bun init` in bun v1.2.20. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.