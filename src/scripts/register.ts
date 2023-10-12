// IMPORTANT: This script is intended to be run where `process` is available. Typically, Node.js, Deno and Bun runtimes.
// The only use case is to register Discord commands by running it locally or in CI. And both support `process`.
// Everything else use Cloudflare Workers own runtime which doesn't support `process`.

import { z } from "zod";
import { type SlashCommand, commands } from "~/commands";

const configSchema = z.object({
  discord: z.object({
    apiVersion: z.string(),
    applicationId: z.string(),
    token: z.string(),
  }),
});

const config = configSchema.parse({
  discord: {
    apiVersion: process.env.DISCORD_API_VERSION,
    applicationId: process.env.DISCORD_APPLICATION_ID,
    token: process.env.DISCORD_TOKEN,
  },
});

type SlashCommandMetadata = Pick<
  SlashCommand,
  "name" | "description" | "options"
>;

const commandsMetadata: SlashCommandMetadata[] = commands.map((command) => ({
  name: command.name,
  description: command.description,
  options: command.options,
}));

try {
  console.log("Registering application slash commands...");

  const url = `https://discord.com/api/v${config.discord.apiVersion}/applications/${config.discord.applicationId}/commands`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${config.discord.token}`,
    },
    method: "PUT",
    body: JSON.stringify(commandsMetadata),
  });

  if (!response.ok) {
    throw new Error("Failed to register slash commands");
  }

  console.log("Successfully registered application slash commands.");
} catch (err) {
  console.error("Failed to register slash commands", err);
}
