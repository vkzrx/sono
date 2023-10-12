import {
  ButtonStyleTypes,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Interaction, InteractionResponse } from "./discord";
import * as youtube from "./youtube";

enum SlashCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11,
}

export type SlashCommand = {
  name: string;
  description: string;
  options?: {
    name: string;
    description: string;
    required: boolean;
    type: SlashCommandOptionType;
  }[];
  execute: (
    context: Context,
    data?: Interaction["data"],
  ) => Promise<InteractionResponse>;
};

const playCommand: SlashCommand = {
  name: "play",
  description: "Play the audio of a Youtube video",
  options: [
    {
      name: "url",
      description: "URL of the song to play",
      required: true,
      type: SlashCommandOptionType.STRING,
    },
  ],
  execute: async (context, data) => {
    if (!data?.options || !data.options[0]) {
      throw new HTTPException(400, { message: "Missing options data" });
    }

    const song = data.options[0];

    const video = await youtube.getVideo({
      url: song.value,
      apiKey: context.env.YOUTUBE_API_KEY,
    });

    if (!video) {
      throw new HTTPException(400, { message: "Invalid song URL" });
    }

    return {
      success: true,
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: video.thumbnailUrl || "",
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                style: ButtonStyleTypes.PRIMARY,
                label: "play",
                custom_id: "play",
              },
            ],
          },
        ],
      },
    };
  },
};

export const commands: SlashCommand[] = [playCommand];
