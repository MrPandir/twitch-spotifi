import type { Client } from "tmi.js";

export interface User {
  id: string;
  userName: string;
  displayName: string;
}

export interface CommandContext {
  client: Client;
  author: User;
  args: string[];
  tags: Record<string, any>;
}

export type CommandExecute = (ctx: CommandContext) => Promise<void>;

export interface Command {
  permission: "BROADCASTER" | "MOD" | "USER";
  execute: CommandExecute;
}
