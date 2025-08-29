# 使用官方Bun镜像作为基础镜像
FROM oven/bun:1.1.30

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json .
COPY bun.lock .

# 复制源代码
COPY index.ts .

# 安装依赖
RUN bun install

# 暴露端口
EXPOSE 12506

# 运行应用
CMD ["bun", "run", "start"]