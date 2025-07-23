# BlockStreet-Mobile Agent Guide

## Commands
- **Development**: `npm start` or `expo start` (starts Expo development server)
- **Platform Specific**: `npm run ios`, `npm run android`, `npm run web`
- **TypeScript Check**: `npx tsc --noEmit` (no explicit build script, check types only)
- **No test framework** currently configured

## Architecture
- **React Native + Expo** mobile app with TypeScript
- Entry point: `index.ts` → `App.tsx`
- **New Architecture enabled** (React Native's new architecture)
- **Assets**: Static resources in `/assets/` (icons, splash screens)
- **Configuration**: `app.json` for Expo settings, `tsconfig.json` extends Expo defaults

## Code Style
- **TypeScript**: Strict mode enabled
- **Imports**: Use named imports from React Native modules
- **Styling**: StyleSheet.create() pattern, camelCase style properties
- **Components**: Functional components with JSX
- **File naming**: PascalCase for components (App.tsx), camelCase for utilities
- **Error handling**: Not established yet (minimal codebase)
