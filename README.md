# deepinfra2api

## 项目介绍

deepinfra2api 是一个代理服务，允许您通过标准的OpenAI API格式访问DeepInfra上的各种AI模型。

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

## API端点

- `/models` - 获取可用模型列表
- `/chat/completions` - 聊天完成端点（POST请求）

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

## 部署

此项目配置了GitHub Actions CI/CD，会自动将镜像推送到GitHub Container Registry (GHCR)。

This project was created using `bun init` in bun v1.2.20. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
