import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.ts";
import { prisma } from "@repo/database";

export default {
  data: new SlashCommandBuilder()
    .setName("remove-birthday")
    .setDescription("Entfernt einen Geburtstag aus der Liste.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, dessen Geburtstag entfernt werden soll")
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);

    const { count } = await prisma.birthday.deleteMany({
      where: { userId: user.id },
    });

    await interaction.reply({
      content:
        count > 0
          ? `✅ Geburtstag von <@${user.id}> entfernt.`
          : `❌ Für <@${user.id}> ist kein Geburtstag gespeichert.`,
      allowedMentions: { parse: [] },
    });
  },
} satisfies Command;
