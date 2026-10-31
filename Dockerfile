FROM oven/bun:1.4.2

# Prisma braucht OpenSSL für die Migrations-Engine
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Erst nur die package.json-Dateien kopieren, damit "bun install" gecacht wird
COPY package.json bun.lock ./
COPY database/package.json ./database/
RUN bun install --frozen-lockfile

COPY . .

# Prisma Client erzeugen (die URL wird nur zum Laden der Config gebraucht)
ENV DATABASE_URL=file:/app/data/data.db
RUN cd database && bunx --bun prisma generate --config prisma7.config.ts

CMD ["bun", "src/index.ts"]
