import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.ts";
import { scrapeByGameUrl, updateList } from "../../scraper.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Aktualisiert die Liste der Spiele."),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      await updateList();
      await interaction.editReply("✅ Liste aktualisiert.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler.";
      await interaction.editReply(`❌ ${message}`);
    }
  },
} satisfies Command;
