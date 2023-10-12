import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKey,
} from "discord-interactions";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { commands } from "./commands";

const interactionSchema = z.object({
  type: z.nativeEnum(InteractionType),
  data: z
    .object({
      id: z.string(),
      name: z.string(),
      options: z
        .object({
          name: z.string(),
          type: z.nativeEnum(InteractionType),
          value: z.string(),
        })
        .array(),
    })
    .optional(),
});

export type Interaction = z.infer<typeof interactionSchema>;

export type InteractionResponse = {
  type: InteractionResponseType;
  data?: {
    content: string;
    flags?: InteractionResponseFlags;
    components?: {
      type: MessageComponentTypes.ACTION_ROW;
      components: {
        type: MessageComponentTypes.BUTTON;
        style: ButtonStyleTypes;
        label: string;
        custom_id: string;
      }[];
    }[];
  };
};

export async function handleInteraction(
  context: Context,
): Promise<InteractionResponse> {
  const verification = await verifyRequest(context);

  if (!verification.isValid) {
    throw new HTTPException(401, { message: "Bad request signature" });
  }

  // TODO - Better handle JSON.parse which can fail before being parsed by schema
  const parsedData = interactionSchema.safeParse(JSON.parse(verification.data));

  if (!parsedData.success) {
    throw new HTTPException(500, { message: "Bad request body" });
  }

  const interaction = parsedData.data;

  if (interaction.type === InteractionType.PING) {
    return { type: InteractionResponseType.PONG };
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const command = commands.find(
      (command) => command.name === interaction.data?.name.toLowerCase(),
    );
    if (!command) {
      throw new HTTPException(404, { message: "Command not found" });
    }
    return command.execute(context, interaction.data);
  }

  throw new HTTPException(500, { message: "Bad request" });
}

type VerifyRequestResult =
  | {
      isValid: false;
    }
  | {
      isValid: true;
      data: string;
    };

async function verifyRequest(context: Context): Promise<VerifyRequestResult> {
  const signature = context.req.header("x-signature-ed25519");
  const timestamp = context.req.header("x-signature-timestamp");

  if (!signature || !timestamp) {
    return { isValid: false };
  }

  const data = await context.req.text();

  if (!verifyKey(data, signature, timestamp, context.env.DISCORD_PUBLIC_KEY)) {
    return { isValid: false };
  }

  return { isValid: true, data };
}
