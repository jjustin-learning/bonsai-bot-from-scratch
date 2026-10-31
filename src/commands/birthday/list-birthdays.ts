import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "@repo/database";
import type { BirthdayDate, Command } from "../../types.ts";

const MAX_BIRTHDAYS = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

function birthdayIn(year: number, day: number, month: number) {
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : new Date(year, month - 1, 28);
}

function daysUntil({ day, month }: BirthdayDate, today: Date) {
  let next = birthdayIn(today.getFullYear(), day, month);
  if (next < today) next = birthdayIn(today.getFullYear() + 1, day, month);
  return Math.round((next.getTime() - today.getTime()) / DAY_MS);
}

function formatDate({ day, month, year }: BirthdayDate) {
  const date = `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.`;
  return year ? `${date}${year}` : date;
}

export default {
  data: new SlashCommandBuilder()
    .setName("list-birthdays")
    .setDescription("Gibt die Liste aller gespeicherten Geburtstage aus."),
  async execute(interaction) {
    const birthdays = await prisma.birthday.findMany();
    if (birthdays.length === 0) {
      await interaction.reply("❌ Es sind noch keine Geburtstage gespeichert.");
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sorted = birthdays
      .map((birthday) => ({ ...birthday, days: daysUntil(birthday, today) }))
      .sort((a, b) => a.days - b.days);

    const lines = sorted.slice(0, MAX_BIRTHDAYS).map((birthday) => {
      const countdown =
        birthday.days === 0
          ? "🎉 heute"
          : birthday.days === 1
            ? "morgen"
            : `in ${birthday.days} Tagen`;
      return `<@${birthday.userId}> · ${formatDate(birthday)} · ${countdown}`;
    });

    const embed = new EmbedBuilder()
      .setTitle("🎂 Geburtstage")
      .setColor(0xeb459e)
      .setDescription(lines.join("\n"))
      .setFooter({
        text:
          birthdays.length > MAX_BIRTHDAYS
            ? `${MAX_BIRTHDAYS} von ${birthdays.length} Geburtstagen`
            : `${birthdays.length} Geburtstag(e)`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
