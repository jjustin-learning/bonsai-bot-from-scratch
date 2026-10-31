import { Events } from "discord.js";
import { startBirthdayScheduler } from "../birthdays.ts";
import type { Event } from "../types.ts";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Eingeloggt als ${client.user.tag}`);
    startBirthdayScheduler(client);
  },
} satisfies Event<Events.ClientReady>;
