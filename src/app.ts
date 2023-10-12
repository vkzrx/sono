import { Hono } from "hono";
import { logger } from "hono/logger";
import * as discord from "./discord";

const app = new Hono();

app.use("*", logger());

app.get("/_health", (c) => {
  return c.text("healthy");
});

app.post("/interaction", async (c) => {
  const response = await discord.handleInteraction(c);
  return c.json(response);
});

export default app;
