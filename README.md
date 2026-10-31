# Bonsai Bot

Discord-Bot mit [discord.js](https://discord.js.org) und [Bun](https://bun.com),
der eine Liste von Spielen mit aktuellen Preisen von Steam und Instant Gaming
verwaltet. Die Daten liegen in einer SQLite-Datenbank (Prisma).

## Setup

```bash
bun install
cp .env.example .env   # Token, Client-ID und (optional) Guild-ID eintragen
bun run db:generate    # Prisma Client erzeugen
bun run db:migrate:dev # Datenbank auf den neuesten Stand bringen
```

## Slash-Commands

| Command   | Beschreibung                                                   |
| --------- | -------------------------------------------------------------- |
| `/add`    | Fügt ein Spiel per Steam- und/oder Instant-Gaming-Link hinzu   |
| `/remove` | Entfernt ein Spiel aus der Liste                               |
| `/list`   | Zeigt alle Spiele mit günstigstem Shop, Preis und Release-Datum |
| `/update` | Lädt Preise und Infos aller Spiele neu                         |
| `/ping`   | Antwortet mit Pong und der Latenz                              |

## Scripts

| Script                     | Beschreibung                                  |
| -------------------------- | --------------------------------------------- |
| `bun run deploy`           | Slash-Commands bei Discord registrieren       |
| `bun run dev`              | Bot mit Auto-Reload starten                   |
| `bun start`                | Bot starten                                   |
| `bun run check-types`      | TypeScript prüfen                             |
| `bun run db:generate`      | Prisma Client erzeugen                        |
| `bun run db:migrate:dev`   | Migration aus Schema-Änderungen erstellen     |
| `bun run db:migrate:reset` | Datenbank zurücksetzen                        |
| `bun run db:studio`        | Prisma Studio öffnen                          |
| `bun run docker:dev`       | Docker-Container bauen und starten            |

## Docker

```bash
bun run docker:dev
```

Der Dienst `database` wendet beim Start alle Migrationen auf die SQLite-Datei
im Volume `db-data` an und beendet sich danach; erst dann startet `bot`.
Nach Schema-Änderungen also einfach die Container neu bauen.

## Struktur

```
src/
  index.ts              Einstiegspunkt, Client + Handler
  deploy-commands.ts    Registriert Slash-Commands
  config.ts             Liest .env
  loader.ts             Lädt Commands und Events automatisch
  scraper.ts            Holt Preise und Infos von Steam / Instant Gaming
  types.ts              Command-, Event- und Game-Typen
  commands/<kategorie>/ Ein Slash-Command pro Datei
  events/               Ein Event-Handler pro Datei
database/
  prisma/schema.prisma  Datenbankschema
  prisma/migrations/    Migrationen
  src/                  Exportiert den Prisma Client (@repo/database)
```

Neuen Command anlegen: Datei unter `src/commands/<kategorie>/` erstellen, die
`{ data, execute } satisfies Command` exportiert, dann `bun run deploy`.
