# Bonsai Bot

Discord-Bot mit [discord.js](https://discord.js.org) und [Bun](https://bun.com).

## Setup

```bash
bun install
cp .env.example .env   # Token, Client-ID und (optional) Guild-ID eintragen
```

## Befehle

| Script              | Beschreibung                               |
| ------------------- | ------------------------------------------ |
| `bun run deploy`    | Slash-Commands bei Discord registrieren    |
| `bun run dev`       | Bot mit Auto-Reload starten                |
| `bun start`         | Bot starten                                |
| `bun run check-types` | TypeScript prüfen                        |

## Struktur

```
src/
  index.ts              Einstiegspunkt, Client + Handler
  deploy-commands.ts    Registriert Slash-Commands
  config.ts             Liest .env
  loader.ts             Lädt Commands und Events automatisch
  types.ts              Command- und Event-Typen
  commands/<kategorie>/ Ein Slash-Command pro Datei
  events/               Ein Event-Handler pro Datei
```

Neuen Command anlegen: Datei unter `src/commands/<kategorie>/` erstellen, die
`{ data, execute } satisfies Command` exportiert, dann `bun run deploy`.
