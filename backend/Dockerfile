FROM oven/bun:1.0.26

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY . .

ENV PORT=3004

EXPOSE 3004

CMD ["bun", "start"]