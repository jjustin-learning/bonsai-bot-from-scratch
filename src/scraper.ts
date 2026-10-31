import * as cheerio from "cheerio";
import { prisma } from "@repo/database";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
  "Accept-Language": "de-DE",
};

type ScrapedShop = {
  name: string;
  description: string;
  price: number;
};

async function loadPage(url: string) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok)
    throw new Error(`Seite nicht erreichbar (HTTP ${response.status}).`);
  return cheerio.load(await response.text());
}

function parsePrice(text: string) {
  return parseFloat(
    text.replace("€", "").replace(",", ".").replace("--", "00").trim(),
  );
}

// -------------------------------------------------------> Steam

async function scrapeSteam(url: string): Promise<ScrapedShop> {
  const $ = await loadPage(url);

  const purchaseBox = $(
    ".game_area_purchase_game_wrapper:not(.dynamic_bundle_description) .game_area_purchase_game:not(.demo_above_purchase)",
  ).first();
  const price =
    purchaseBox.find(".discount_final_price").first().text() ||
    purchaseBox.find(".game_purchase_price").first().text();

  return {
    name: $(".apphub_AppName").first().text().trim(),
    description: $(".game_description_snippet").first().text().trim(),
    price: parsePrice(price),
  };
}

async function scrapeInstantGaming(url: string): Promise<ScrapedShop> {
  const $ = await loadPage(url);

  return {
    name: $(".game-title")
      .first()
      .text()
      .trim()
      .replace(/ - PC( \(.*\))?$/, ""),
    description: $('[itemprop="description"]').first().text().trim(),
    price: parsePrice($(".total").first().text()),
  };
}

export async function scrapeByGameUrl(
  steamUrl?: string | null,
  igUrl?: string | null,
) {
  if (!steamUrl && !igUrl) {
    throw new Error("Kein Link angegeben.");
  }

  const existingGame = await prisma.game.findFirst({
    where: {
      OR: [
        ...(steamUrl ? [{ steamLink: steamUrl }] : []),
        ...(igUrl ? [{ instantGamingLink: igUrl }] : []),
      ],
    },
  });

  if (existingGame) {
    throw new Error("Spiel bereits in der Liste.");
  }

  const steam = steamUrl ? await scrapeSteam(steamUrl) : null;
  const instantGaming = igUrl ? await scrapeInstantGaming(igUrl) : null;

  if (steam && (!steam.name || Number.isNaN(steam.price))) {
    throw new Error("Fehler beim Scrapen der Steam-Seite.");
  }
  if (
    instantGaming &&
    (!instantGaming.name || Number.isNaN(instantGaming.price))
  ) {
    throw new Error("Fehler beim Scrapen der Instant-Gaming-Seite.");
  }

  const name = steam?.name || instantGaming?.name || "";
  const description = steam?.description || instantGaming?.description || "";

  await prisma.game.create({
    data: {
      name,
      description,
      steamPrice: steam?.price ?? null,
      instantGamingPrice: instantGaming?.price ?? null,
      steam: steam ? "Steam" : "",
      instantGaming: instantGaming ? "Instant Gaming" : "",
      steamLink: steamUrl || null,
      instantGamingLink: igUrl || null,
      crossplay: false,
    },
  });
}

export async function updateList() {
  const games = await prisma.game.findMany();

  for (const game of games) {
    let steam: ScrapedShop | null = null;
    let instantGaming: ScrapedShop | null = null;

    if (game.steamLink) {
      try {
        steam = await scrapeSteam(game.steamLink);
      } catch (error) {
        console.error(`Fehler beim Scrapen von Steam für ${game.name}:`, error);
      }
    }

    if (game.instantGamingLink) {
      try {
        instantGaming = await scrapeInstantGaming(game.instantGamingLink);
      } catch (error) {
        console.error(
          `Fehler beim Scrapen von Instant Gaming für ${game.name}:`,
          error,
        );
      }
    }

    const name = steam?.name || instantGaming?.name || game.name;
    const description =
      steam?.description || instantGaming?.description || game.description;

    await prisma.game.update({
      where: { id: game.id },
      data: {
        name,
        description,
        steamPrice: steam?.price ?? null,
        instantGamingPrice: instantGaming?.price ?? null,
      },
    });
  }
}
