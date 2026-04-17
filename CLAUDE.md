# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**newrockbot** is a Node.js backend server that tracks new music releases for subscribed artists and sends push notifications via Firebase Cloud Messaging (FCM). It uses the Spotify API as its primary data source, with Puppeteer-based web scrapers as fallbacks when the API is insufficient.

There is also a secondary Telegram chatbot (`server.bot.js`) powered by a neural chatbot AI.

## Running the Server

```bash
# Start main server (local dev, port 3001)
node server.js
```

No build step — pure Node.js/CommonJS. No test suite exists in this project.

## Architecture

### Entry Points
- **`server.js`** — Express HTTP server (port 3001). Initializes MongoDB, refreshes Spotify OAuth token every ~1hr in middleware, then handles routes.
- **`server.bot.js`** — Telegram bot + minimal Express server. Loads `botAI/` training data and initializes `neural-chatbot`.
- **`server/cron.js`** — Cron job (every 12 hrs) that triggers the releases route to find new releases and dispatch notifications.

### Request Flow for `/releases/:days`
1. Load all subscriptions from MongoDB (`subscriptions` collection)
2. For each subscription, call `spotify.findInArtistAlbums` (Spotify API)
3. Format results with `formatNewReleases.util.js`
4. Call `newReleasesCreateNotifications` to send FCM push notifications
5. Return results in response

### Key Directories
- **`server/routes/`** — Route handlers named by their URL pattern (e.g., `releases[days].get.route.js`)
- **`server/parts/newReleases/`** — Business logic for finding new releases via Spotify API and Last.fm
- **`server/parts/`** — Notifications, Firebase initialization
- **`server/utils/`** — Browser setup (Puppeteer), MongoDB connection, JS extensions, date/format helpers
- **`@parsers/`** — Puppeteer-based scrapers for Spotify, YouTube, Deezer, SoundCloud, Apple Music, Last.fm. Used by `/find/:group/:album` route as fallback when API is insufficient.

### Globals Set in `server.js`
| Global | Purpose |
|---|---|
| `global.LOG` | simple-node-logger instance, logs to `server/project.log` |
| `global.SPOTIFY_TOKEN` | OAuth token refreshed every ~1hr |
| `global.MONGO_CLIENT` | MongoDB client |
| `global.MONGO_DB` | `instaGQL-database` database |
| `global.MONGO_COLLECTION_PARSER` | `parser` collection (cache for scraper results) |
| `global.MONGO_COLLECTION_NOTIFICATIONS` | `notifications` collection |
| `global.MONGO_COLLECTION_SUBSCRIPTIONS` | `subscriptions` collection |
| `global.authOptions` | Spotify OAuth request options |
| `global.YOUTUBE_API` | YouTube Data API key |

### MongoDB
- Connection string is hardcoded in `server/utils/mongoDB/MongoDB.connect.js`
- MongoDB client is lazily initialized on the first request via Express middleware
- Collections: `parser` (scraper cache), `notifications`, `subscriptions`

### Puppeteer / Browser
- Configured in `server/utils/setupBrowser.utils.js` using `puppeteer-extra` with stealth, anonymize-ua, and adblocker plugins
- Launched with `headless: "new"` mode and `--no-sandbox` flag

### Firebase / FCM
- Firebase Admin SDK initialized in `server/parts/initializeFirebase.js`
- Credentials in `newrockbot-firebase-adminsdk-mb9q7-2767b30f25.json`
- FCM subscribe/unsubscribe routes: `/fcm/subscribe/:token/:topic` and `/fcm/unsubscribe/:token/:topic`

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/releases/:days` | New releases in the last N days for all subscriptions |
| GET | `/releases/:artist/:days` | New releases for a specific artist |
| GET | `/find/:group/:album` | Find album links across music platforms |
| GET | `/concerts/:artist` | Find upcoming concerts via Bandsintown |
| GET | `/spotify/token` | Get current Spotify token |
| GET | `/fcm/subscribe/:token/:topic` | Subscribe FCM token to topic |
| GET | `/fcm/unsubscribe/:token/:topic` | Unsubscribe FCM token from topic |
| GET/POST | `/mongo/*` | Generic MongoDB CRUD endpoints |
