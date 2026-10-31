import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.ts";
import { prisma } from "@repo/database";

export default {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Entfernt ein Spiel aus der Liste.")
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

    // Schon ein übereinstimmender Link reicht, um das Spiel zu finden
    const { count } = await prisma.game.deleteMany({
      where: {
        OR: [
          ...(steamUrl ? [{ steamLink: steamUrl }] : []),
          ...(igUrl ? [{ instantGamingLink: igUrl }] : []),
        ],
      },
    });

    await interaction.reply(
      count > 0 ? "Spiel entfernt." : "❌ Kein Spiel mit diesem Link gefunden.",
    );
  },
} satisfies Command;
