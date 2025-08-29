# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo with two main applications:
- **web**: Next.js dashboard app (port 3000) with AI chat functionality
- **docs**: Next.js documentation app (port 3001)
- **packages**: Shared configurations and UI components

## Architecture

### Core Structure
```
dashboard-new/
├── apps/
│   ├── web/          # Main dashboard application
│   └── docs/         # Documentation site
├── packages/
│   ├── eslint-config/ # Shared ESLint configurations
│   ├── typescript-config/ # Shared TypeScript configs
│   └── ui/           # Shared React components
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml # Monorepo workspace config
```

### Technology Stack
- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript 5.9.2
- **Monorepo**: Turborepo with pnpm
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI + custom shadcn/ui components
- **AI Integration**: Vercel AI SDK 5.0.26
- **State Management**: React 19.1.0 with modern hooks
- **Icons**: Remix icons + Lucide React

## Development Commands

### Root Commands
```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start all apps (web:3000, docs:3001)
pnpm dev --filter=web # Start only web app

# Building
pnpm build              # Build all apps
pnpm build --filter=web # Build only web app

# Quality
pnpm lint               # Lint all packages
pnpm check-types        # Type check all packages
pnpm format             # Format with Prettier

# Individual app commands
pnpm --filter=web dev   # Web app development
pnpm --filter=docs dev  # Docs app development
```

### Web App Specific
```bash
cd apps/web
npm run dev        # Next.js with Turbopack
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Next.js linting
npm run check-types # TypeScript checking
```

### Package Commands
```bash
cd packages/ui
npm run build      # Build shared components
```

## AI Configuration

The web app includes AI chat functionality with configurable providers:
- **Location**: `apps/web/lib/ai-config.ts`
- **Providers**: OpenAI (default) or Anthropic
- **Environment Variables**:
  - `AI_PROVIDER=openai|anthropic`
  - `OPENAI_API_KEY=your_key`
  - `ANTHROPIC_API_KEY=your_key`
  - `OPENAI_MODEL=gpt-3.5-turbo`
  - `ANTHROPIC_MODEL=claude-3-haiku-20240307`

## Key Components

### Web App Structure
- **Main Layout**: `apps/web/app/layout.tsx` - Dark theme with Inter font
- **Sidebar**: `apps/web/components/app-sidebar.tsx` - Navigation with team switching
- **AI Chat**: `apps/web/components/ai-chat-*` - AI chat dialog and buttons
- **API Routes**: `apps/web/app/api/chat/route.ts` - Chat endpoint
- **Shared UI**: `packages/ui/src/` - Reusable components

### Shared Configurations
- **ESLint**: Uses `@repo/eslint-config` with Next.js and Prettier configs
- **TypeScript**: Uses `@repo/typescript-config` with Next.js and base configs
- **UI Components**: Shared React components in `packages/ui`

## Environment Setup

### Required Environment Variables
```bash
# For AI functionality (web app)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Optional configurations
AI_PROVIDER=openai|anthropic
OPENAI_MODEL=gpt-3.5-turbo
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### Node.js Requirements
- Node.js >=18
- pnpm 9.0.0

## Development Workflow

1. **Setup**: Clone repo → `pnpm install`
2. **Development**: `pnpm dev` for all apps or `pnpm dev --filter=web` for specific app
3. **Testing**: `pnpm lint` and `pnpm check-types` before commits
4. **Building**: `pnpm build` to verify production builds
5. **Formatting**: `pnpm format` for consistent code style

## Package Management

- **Package Manager**: pnpm with workspace protocol
- **Dependencies**: Use `workspace:*` for internal packages
- **Adding Dependencies**: 
  - Root: `pnpm add -w package-name`
  - Specific app: `pnpm --filter=web add package-name`
  - Shared package: `pnpm --filter=@repo/ui add package-name`