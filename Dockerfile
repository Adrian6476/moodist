FROM docker.io/node:20-alpine3.18 AS build
WORKDIR /app

# 设置npm和pnpm使用淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com/

# 拷贝 package.json 和 pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# 配置Alpine中国镜像源并安装依赖
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    apk add --no-cache vips-dev build-base && \
    pnpm install --registry=https://registry.npmmirror.com/

# 拷贝源代码
COPY . .

# 构建（包括生成图标）
RUN pnpm run build

FROM docker.io/nginx:alpine AS runtime
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
