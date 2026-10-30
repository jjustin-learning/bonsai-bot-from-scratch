import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Zeigt Infos über diesen Server."),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply("Dieser Command funktioniert nur auf einem Server.");
      return;
    }
    await interaction.reply(
      `**${interaction.guild.name}** hat ${interaction.guild.memberCount} Mitglieder.`,
    );
  },
} satisfies Command;
