import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.ts";
import { scrapeByGameUrl } from "../../scraper.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Fügt ein neues Spiel zur Liste hinzu.")
    .addStringOption((option) =>
      option
        .setName("steam_url")
        .setDescription("Steam-Link zum Spiel")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("ig_url")
        .setDescription("Instant-Gaming-Link zum Spiel")
        .setRequired(false),
    ),
  async execute(interaction) {
    const steamUrl = interaction.options.getString("steam_url");
    const igUrl = interaction.options.getString("ig_url");

    if (!steamUrl && !igUrl) {
      await interaction.reply({
        content: "❌ Gib mindestens einen Link an (Steam oder Instant Gaming).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      await scrapeByGameUrl(steamUrl, igUrl);
      await interaction.editReply("Spiel hinzugefügt.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler.";
      await interaction.editReply(`❌ ${message}`);
    }
  },
} satisfies Command;
