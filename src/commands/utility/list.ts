import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Platform } from "@repo/database";
import { platformNames } from "../../constants.ts";
import type { Command, Game } from "../../types.ts";

const games: Game[] = [
  {
    name: "Minecraft",
    description:
      "Ein Sandbox-Spiel, in dem Spieler in einer offenen Welt bauen und erkunden können.",
    price: 26.95,
    platform: Platform.INSTANT_GAMING,
    crossplay: true,
    link: "https://www.instant-gaming.com/de/442-kaufen-minecraft-java-bedrock-edition-pc/",
  },
];

const priceFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

function formatGame(game: Game) {
  const details = [
    `🛒 ${platformNames[game.platform]}`,
    `💶 ${priceFormat.format(game.price)}`,
    game.crossplay ? "🔀 Crossplay" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    name: game.name,
    value: [
      `> ${game.description}`,
      details,
      `[Zum Shop](${game.link})`,
    ].join("\n"),
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Gibt die Liste aller gespeicherten Spiele aus."),
  async execute(interaction) {
    if (games.length === 0) {
      await interaction.reply("Es sind noch keine Spiele gespeichert.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🎮 Spieleliste")
      .setColor(0x57f287)
      .addFields(games.slice(0, 25).map(formatGame))
      .setFooter({ text: `${games.length} Spiel(e)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
