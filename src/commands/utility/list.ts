import { EmbedBuilder, SlashCommandBuilder, time } from "discord.js";
import { prisma } from "@repo/database";
import type { Command, Game } from "../../types.ts";

const priceFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const MAX_DESCRIPTION_LENGTH = 200;
const MAX_GAMES = 10;

function shorten(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxLength
    ? `${clean.slice(0, maxLength - 1).trimEnd()}…`
    : clean;
}

function cheapestShop(game: Game) {
  const shops = [
    { name: "Steam", price: game.steamPrice, link: game.steamLink },
    {
      name: "Instant Gaming",
      price: game.instantGamingPrice,
      link: game.instantGamingLink,
    },
  ].filter((shop) => shop.price !== null && shop.link);

  return shops.sort((a, b) => a.price! - b.price!)[0];
}

function formatGame(game: Game) {
  const shop = cheapestShop(game);
  // Kein Preis in irgendeinem Shop → noch nicht erschienen oder überall ausverkauft
  const unavailable = game.releaseDate
    ? `⏳ Noch nicht erschienen (Release: ${game.releaseDate})`
    : "❌ Ausverkauft";
  const link = shop?.link || game.steamLink || game.instantGamingLink;

  const details = [
    shop && `🛒 ${shop.name}`,
    shop ? `💶 ${priceFormat.format(shop.price!)}` : unavailable,
    game.crossplay ? "🔀 Crossplay" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    name: shorten(game.name, 256),
    value: [
      `> ${shorten(game.description, MAX_DESCRIPTION_LENGTH)}`,
      details,
      link && `[Zum Shop](${link})`,
      game.createdAt && `📅 Hinzugefügt ${time(game.createdAt, "D")}`,
      "​",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Gibt die Liste aller gespeicherten Spiele aus."),
  async execute(interaction) {
    const games = await prisma.game.findMany();
    if (games.length === 0) {
      await interaction.reply("Es sind noch keine Spiele gespeichert.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🎮 Spieleliste")
      .setColor(0x57f287)
      .addFields(games.slice(0, MAX_GAMES).map(formatGame))
      .setFooter({
        text:
          games.length > MAX_GAMES
            ? `${MAX_GAMES} von ${games.length} Spielen`
            : `${games.length} Spiel(e)`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
