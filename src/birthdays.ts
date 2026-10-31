import type { Client } from "discord.js";
import { prisma } from "@repo/database";
import { config } from "./config.ts";

const CHECK_INTERVAL = 60 * 60 * 1000;

export function startBirthdayScheduler(client: Client<true>) {
  const channelId = config.birthdayChannelId;
  if (!channelId) {
    console.warn(
      "BIRTHDAY_CHANNEL_ID fehlt, Geburtstagsgrüße sind deaktiviert",
    );
    return;
  }

  const run = () => checkBirthdays(client, channelId).catch(console.error);
  run();
  setInterval(run, CHECK_INTERVAL);
}

async function checkBirthdays(client: Client<true>, channelId: string) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const isLeapYear = new Date(thisYear, 1, 29).getDate() === 29;
  const days = !isLeapYear && month === 2 && day === 28 ? [28, 29] : [day];

  const birthdays = await prisma.birthday.findMany({
    where: {
      month,
      day: { in: days },
      OR: [{ lastWishedYear: null }, { lastWishedYear: { lt: thisYear } }],
    },
  });
  if (birthdays.length === 0) return;

  const channel = await client.channels.fetch(channelId);
  if (!channel?.isSendable()) {
    throw new Error(
      `Channel ${channelId} nicht gefunden oder nicht beschreibbar`,
    );
  }

  for (const birthday of birthdays) {
    const age = birthday.year
      ? ` Du bist jetzt ${thisYear - birthday.year}!`
      : "";
    await channel.send({
      content: `🎉 Alles Gute zum Geburtstag, <@${birthday.userId}>!${age} 🎂`,
      allowedMentions: { users: [birthday.userId] },
    });
    await prisma.birthday.update({
      where: { id: birthday.id },
      data: { lastWishedYear: thisYear },
    });
  }
}
