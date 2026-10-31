import type {
  ChatInputCommandInteraction,
  ClientEvents,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

export type Game = {
  name: string;
  description: string;
  steamPrice: number | null;
  instantGamingPrice: number | null;
  steam: string;
  instantGaming: string;
  steamLink: string | null;
  instantGamingLink: string | null;
  releaseDate: string | null;
  createdAt?: Date;
};

export type ScrapedShop = {
  name: string;
  description: string;
  price: number | null;
  releaseDate: string | null;
};

export type BirthdayDate = { day: number; month: number; year: number | null };
