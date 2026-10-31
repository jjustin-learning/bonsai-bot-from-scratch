# Bonsai Bot

Discord-Bot mit [discord.js](https://discord.js.org) und [Bun](https://bun.com),
der eine Liste von Spielen mit aktuellen Preisen von Steam und Instant Gaming
verwaltet und Geburtstage der Server-Mitglieder speichert und ankündigt. Die
Daten liegen in einer SQLite-Datenbank (Prisma).

## Setup

```bash
bun install
cp .env.example .env   # Token, Client-ID, (optional) Guild-ID und Geburtstags-Channel eintragen
bun run db:generate    # Prisma Client erzeugen
bun run db:migrate:dev # Datenbank auf den neuesten Stand bringen
bun run deploy         # Slash-Commands bei Discord registrieren
```

### Umgebungsvariablen

| Variable              | Beschreibung                                                          |
| --------------------- | --------------------------------------------------------------------- |
| `DISCORD_TOKEN`       | Bot-Token                                                             |
| `CLIENT_ID`           | Application-ID des Bots                                               |
| `GUILD_ID`            | Optional: Server, auf dem die Commands registriert werden             |
| `BIRTHDAY_CHANNEL_ID` | Optional: Channel für Geburtstagsgrüße; ohne sie sind diese deaktiviert |

Channel- und Server-IDs bekommt man in Discord per Rechtsklick → „ID kopieren“
(dafür unter Einstellungen → Erweitert den Entwicklermodus aktivieren).

## Slash-Commands

### Spiele

| Command              | Beschreibung                                                    |
| -------------------- | --------------------------------------------------------------- |
| `/new-game`          | Fügt ein Spiel per Steam- und/oder Instant-Gaming-Link hinzu    |
| `/remove-game`       | Entfernt ein Spiel aus der Liste                                |
| `/list-games`        | Zeigt alle Spiele mit günstigstem Shop, Preis und Release-Datum |
| `/update-games-list` | Lädt Preise und Infos aller Spiele neu                          |

### Geburtstage

| Command            | Beschreibung                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| `/new-birthday`    | Speichert den Geburtstag eines Users (`TT.MM.JJJJ` oder `TT.MM.`)             |
| `/remove-birthday` | Entfernt den Geburtstag eines Users                                          |
| `/list-birthdays`  | Zeigt alle Geburtstage, sortiert nach dem nächsten, mit Countdown            |

Pro User wird genau ein Geburtstag gespeichert; ein erneutes `/new-birthday`
überschreibt den alten Eintrag. Das Jahr ist optional.

Der Bot prüft beim Start und danach stündlich, ob jemand Geburtstag hat, und
gratuliert im Channel aus `BIRTHDAY_CHANNEL_ID` mit einer Erwähnung (und dem
Alter, falls das Jahr bekannt ist). Jeder bekommt pro Jahr nur einen
Glückwunsch, auch nach Neustarts. Wer am 29.02. Geburtstag hat, wird in
Nicht-Schaltjahren am 28.02. gratuliert.

### Sonstiges

| Command | Beschreibung                      |
| ------- | --------------------------------- |
| `/ping` | Antwortet mit Pong und der Latenz |

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

Der Bot-Container läuft in der Zeitzone `Europe/Berlin`, damit Geburtstagsgrüße
um Mitternacht deutscher Zeit verschickt werden.

## Struktur

```
src/
  index.ts              Einstiegspunkt, Client + Handler
  deploy-commands.ts    Registriert Slash-Commands
  config.ts             Liest .env
  loader.ts             Lädt Commands und Events automatisch
  scraper.ts            Holt Preise und Infos von Steam / Instant Gaming
  birthdays.ts          Prüft Geburtstage und verschickt Glückwünsche
  types.ts              Command-, Event-, Game- und Birthday-Typen
  commands/
    games/              Commands zur Spieleliste
    birthday/           Commands zu Geburtstagen
    utility/            Sonstige Commands
  events/               Ein Event-Handler pro Datei
database/
  prisma/schema.prisma  Datenbankschema
  prisma/migrations/    Migrationen
  src/                  Exportiert den Prisma Client (@repo/database)
```

Neuen Command anlegen: Datei unter `src/commands/<kategorie>/` erstellen, die
`{ data, execute } satisfies Command` exportiert, dann `bun run deploy`.
