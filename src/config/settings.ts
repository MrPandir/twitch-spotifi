import { SettingsSection } from "spcr-settings";
import { reconnect } from "@bot";
import type { Language } from "@locales";

const settings = new SettingsSection("Twitch Spotifi", "twitch-spotifi");

export async function addSettings() {
  settings.addInput("channel", "Nickname channel", "");

  settings.addDropDown("language", "Bot language", ["EN", "RU"], 0);

  settings.addInput("maxTracksPerUser", "Max tracks per user", "-1");

  settings.addInput("maxTracksInQueue", "Max tracks in queue", "-1");

  settings.addButton(
    "reconnect",
    "Twitch Bot Reconnect",
    "Reconnect",
    reconnect,
  );

  await settings.pushSettings();
}

export function getChannel(): string {
  return settings.getFieldValue("channel");
}

export function getLanguage(): Language {
  return settings.getFieldValue("language") || "EN";
}

export function getMaxTracksPerUser(): number {
  const value = settings.getFieldValue("maxTracksPerUser") as string;
  if (value.startsWith("-")) {
    return 1_000_000_000;
  }
  return Math.max(0, parseInt(value) || 0);
}

export function getMaxTracksInQueue(): number {
  const value = settings.getFieldValue("maxTracksInQueue") as string;
  if (value.startsWith("-")) {
    return 1_000_000_000;
  }
  return Math.max(0, parseInt(value) || 0);
}
