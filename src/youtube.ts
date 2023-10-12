import { z } from "zod";

const videoSchema = z
  .object({
    kind: z.string(),
    etag: z.string(),
    items: z
      .object({
        id: z.string(),
        kind: z.string(),
        etag: z.string(),
        snippet: z.object({
          publishedAt: z.string(),
          channelId: z.string(),
          title: z.string(),
          description: z.string(),
          thumbnails: z.object({
            default: z.object({
              url: z.string().url(),
              width: z.number(),
              height: z.number(),
            }),
          }),
          channelTitle: z.string(),
        }),
      })
      .array(),
  })
  .transform((video) => {
    return {
      channel: {
        id: video.items[0]?.snippet.channelId,
        title: video.items[0]?.snippet.channelTitle,
      },
      description: video.items[0]?.snippet.description,
      thumbnailUrl: video.items[0]?.snippet.thumbnails.default.url,
    };
  });

type Video = z.infer<typeof videoSchema>;

type GetVideoParams = {
  url: string;
  apiKey: string;
};

export async function getVideo(params: GetVideoParams): Promise<Video | null> {
  const videoId = extractVideoId(params.url);
  if (!videoId) return null;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${params.apiKey}`;

  const rawResponse = await fetch(url);
  if (!rawResponse.ok) return null;

  const response = await rawResponse.json();

  const parsed = videoSchema.safeParse(response);
  if (!parsed.success) return null;

  return parsed.data;
}

function extractVideoId(url: string): string | null {
  const pattern =
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|(?:https?:\/\/)?youtu.be\/([a-zA-Z0-9_-]+)/;
  const match = url.match(pattern);
  if (!match) {
    return null;
  }
  return match[1] || match[2] || null;
}
