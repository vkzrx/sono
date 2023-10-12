# Sono

> **Warning**
> This is currently in development and things are being figured out so expect breaking changes.

Sono is a Discord bot that allows to listen Youtube audio.

## Requirements

[Bun](https://bun.sh) v1.0.x

## Getting started

Install dependencies:

```bash
bun install
```

Register Discord commands

```bash
bun run register
```

Run the app

```bash
bun run dev
```

### Environment variables

You'll need two files to store environment variables.

One for Cloudflare Worker.

```
DISCORD_APPLICATION_ID=
DISCORD_PUBLIC_KEY=
DISCORD_TOKEN=
```

And one for registering commands.

```
DISCORD_API_VERSION=
DISCORD_APPLICATION_ID=
DISCORD_TOKEN=
```
