import { SlashCommandBuilder } from "discord.js";
import type { BirthdayDate, Command } from "../../types.ts";
import { prisma } from "@repo/database";

export default {
  data: new SlashCommandBuilder()
    .setName("new-birthday")
    .setDescription("Fügt einen neuen Geburtstag hinzu.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der Geburtstag hat")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Datum des Geburtstags (TT.MM.JJJJ oder TT.MM.)")
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const date = interaction.options.getString("date", true);

    await interaction.deferReply();

    try {
      const { day, month, year } = parseDate(date);
      await prisma.birthday.upsert({
        where: { userId: user.id },
        update: { day, month, year },
        create: { userId: user.id, day, month, year },
      });
      await interaction.editReply("✅ Geburtstag hinzugefügt.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler.";
      await interaction.editReply(`❌ ${message}`);
    }
  },
} satisfies Command;

function parseDate(date: string): BirthdayDate {
  const match = date.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})?$/);
  if (!match) {
    throw new Error(
      "Ungültiges Datum. Bitte im Format DD.MM.JJJJ oder DD.MM. angeben.",
    );
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3] ? Number(match[3]) : null;

  const check = new Date(year ?? 2000, month - 1, day);
  if (check.getMonth() !== month - 1 || check.getDate() !== day) {
    throw new Error("Dieses Datum gibt es nicht.");
  }

  if (year !== null && (year < 1900 || check > new Date())) {
    throw new Error("Ungültiges Geburtsjahr.");
  }

  return { day, month, year };
}
