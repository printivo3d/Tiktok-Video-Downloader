## Project Overview

This is a TikTok and Instagram media downloader Progressive Web App (PWA) built with Next.js 15 and TypeScript. The app provides a user-friendly interface for downloading videos, photo slideshows, and reels from social media platforms.

## Development Commands

```bash
# Development server with Socket.IO support
npm run dev        # Runs nodemon with tsx, watching server.ts and src directory

# Production build and start
npm run build      # Next.js build
npm start          # Production server with tsx

# Code quality
npm run lint       # ESLint with Next.js config

# Database management (Prisma with SQLite)
npm run db:push    # Push schema changes without migrations
npm run db:generate # Generate Prisma client
npm run db:migrate # Create and apply migrations
npm run db:reset   # Reset database and apply migrations
```

## Architecture Overview

### Server Architecture
The app uses a custom server setup (`server.ts`) that integrates Next.js with Socket.IO:
- Runs on port 3000 (0.0.0.0:3000)
- Socket.IO endpoint: `/api/socketio`
- Handles both HTTP requests (Next.js) and WebSocket connections
- Logs output to `dev.log` (development) and `server.log` (production)

### Core Technology Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5 (with `noImplicitAny: false`)
- **UI Components**: shadcn/ui components (Radix UI primitives)
- **Styling**: Tailwind CSS 4 with tailwindcss-animate
- **Database**: SQLite with Prisma ORM
- **Real-time**: Socket.IO for live updates
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Directory Structure
```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── instagram-download/ # Instagram download API
│   │   ├── tiktok-download/   # TikTok download API
│   │   └── health/            # Health check endpoint
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Main page with downloaders
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── tiktok-video-downloader.tsx
│   ├── tiktok-photo-downloader.tsx
│   ├── instagram-downloader.tsx
│   ├── batch-downloader.tsx
│   ├── download-history.tsx
│   ├── auth-modal.tsx
│   └── navigation.tsx
├── lib/
│   ├── auth.tsx               # Auth context provider
│   ├── socket.ts              # Socket.IO setup
│   ├── error-handler.ts       # Centralized error handling
│   ├── download-history.ts    # Download history management
│   ├── db.ts                  # Database utilities
│   └── utils.ts               # Shared utilities
└── hooks/                     # Custom React hooks
```

### Database Schema (Prisma)
The app uses SQLite with the following main models:
- **User**: User accounts with authentication
- **Download**: Download history with metadata (url, title, type, platform, status)
- **Playlist**: User-created playlists
- **Favorite**: User favorites
- **Analytics**: Event tracking

Supported platforms: TIKTOK, INSTAGRAM, YOUTUBE, TWITTER, FACEBOOK
Download types: VIDEO, PHOTO, REEL, STORY, POST

### Error Handling System
The app uses a centralized error handling system (`lib/error-handler.ts`):
- Predefined error messages with German localization
- Toast notifications using Sonner
- Error codes for different scenarios (network, API, rate limits, etc.)
- Structured error responses with suggestions

### Download Flow
1. User enters URL in the appropriate downloader component
2. Component validates URL and sends POST request to `/api/[platform]-download`
3. API route processes the request (currently returns 503 for TikTok due to API restrictions)
4. Socket.IO can emit real-time progress updates
5. Download history is stored in the database
6. User can view history and re-download items

### Key Implementation Details
- **PWA Support**: Manifest.json configured for installable web app
- **Theme Support**: Dark/light mode with next-themes
- **Internationalization**: German language as default (`lang="de"`)
- **Authentication**: Custom auth implementation (not NextAuth.js despite dependency)
- **Path Aliases**: `@/*` maps to `./src/*`
- **TypeScript Config**: Strict mode enabled but `noImplicitAny: false`

### Current Limitations
- TikTok API download is currently disabled (returns 503) due to anti-scraping measures
- Instagram download implementation needs to be verified
- Socket.IO is set up but not actively used for download progress

### Development Notes
- The app uses tsx for running TypeScript files directly
- Nodemon watches for changes in development mode
- All output is piped to log files using tee
- CORS is enabled for Socket.IO connections ("*" origin)