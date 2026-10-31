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
  price: number | null;
  releaseDate: string | null;
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
  const comingSoon = !purchaseBox.length && $(".game_area_comingsoon").length;

  return {
    name: $(".apphub_AppName").first().text().trim(),
    description: $(".game_description_snippet").first().text().trim(),
    price: comingSoon ? null : parsePrice(price),
    releaseDate: comingSoon
      ? $(".release_date .date").first().text().trim() || "unbekannt"
      : null,
  };
}

async function scrapeInstantGaming(url: string): Promise<ScrapedShop> {
  const $ = await loadPage(url);
  const release = $(".subinfos .release").first().text().trim();

  return {
    name: $(".game-title")
      .first()
      .text()
      .trim()
      .replace(/ - PC( \(.*\))?$/, ""),
    description: $('[itemprop="description"]').first().text().trim(),
    price:
      release || $(".subinfos .nostock").length
        ? null
        : parsePrice($(".total").first().text()),
    releaseDate: release
      ? release.replace(/^Release:\s*/, "") || "unbekannt"
      : null,
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
  const releaseDate = steam?.releaseDate || instantGaming?.releaseDate || null;

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
      releaseDate,
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
    const releaseDate =
      steam || instantGaming
        ? steam?.releaseDate || instantGaming?.releaseDate || null
        : game.releaseDate;

    await prisma.game.update({
      where: { id: game.id },
      data: {
        name,
        description,
        steamPrice: steam?.price ?? null,
        instantGamingPrice: instantGaming?.price ?? null,
        releaseDate,
      },
    });
  }
}
