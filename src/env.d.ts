// IMPORTANT: This adds TypeScript types to process.env.
// The only use case is to register Discord commands which is typically done by running the `src/scripts/register.ts` locally or in CI. And both support `process`.
// Everything else use Cloudflare Workers own runtime which doesn't support `process`.

declare namespace NodeJS {
  export interface ProcessEnv {
    DISCORD_API_VERSION: string;
    DISCORD_APPLICATION_ID: string;
    DISCORD_TOKEN: string;
    DISCORD_PUBLIC_KEY: string;
  }
}
