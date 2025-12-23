# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A PixiJS 8 platformer game built with TypeScript and Vite. The project uses a custom engine architecture (`CreationEngine`) that extends PixiJS Application with navigation, audio, and resize management.

## Development Commands

```bash
# Development server (runs on http://localhost:8080)
npm run dev
# or
npm start

# Build (runs lint, TypeScript compilation, and Vite build)
npm run build

# Lint only
npm run lint
```

## Architecture

### Core Engine (`src/engine/`)

The `CreationEngine` class extends PixiJS's `Application` and is enhanced via three custom plugins:

- **NavigationPlugin**: Manages screen/popup transitions with lifecycle hooks (show, hide, pause, resume, blur, focus)
- **AudioPlugin**: Provides `app.audio.bgm` and `app.audio.sfx` managers, plus master volume controls
- **ResizePlugin**: Custom replacement for PixiJS's default ResizePlugin with letterbox support and min width/height constraints

### Plugin Extension Pattern

The engine uses PixiJS's extension system to add functionality to the Application class. Type definitions in `src/pixi-mixins.d.ts` extend the global `PixiMixins` namespace to provide TypeScript support for these additions.

### Navigation System (`src/engine/navigation/`)

Screens and popups must implement the `AppScreen` interface (Container with optional lifecycle methods):
- `show()`, `hide()` - transition animations
- `pause()`, `resume()` - for popup overlay behavior
- `prepare()`, `reset()` - setup/cleanup
- `update(ticker)` - game loop integration
- `resize(width, height)` - responsive layout
- `blur()`, `focus()` - visibility change handling
- `onLoad(progress)` - asset loading progress

Use `app.navigation.showScreen(ScreenClass)` and `app.navigation.presentPopup(PopupClass)`.

### Asset Management

Assets are processed via AssetPack (`scripts/assetpack-vite-plugin.ts`):
- Source assets: `raw-assets/` directory
- Processed assets: `public/assets/` directory
- Manifest: Auto-generated at `src/manifest.json`
- AssetPack runs in watch mode during dev, processes on build

Asset loading uses bundles defined in the manifest:
- `preload` bundle loads during engine initialization
- Screen-specific bundles defined via `static assetBundles` property on screen classes
- All bundles background-loaded after preload

### Application Structure

- **`src/main.ts`**: Entry point - creates engine, initializes, shows LoadScreen then MainScreen
- **`src/app/getEngine.ts`**: Singleton accessor for engine instance
- **`src/app/screens/`**: Full-screen views (LoadScreen, MainScreen, etc.)
- **`src/app/popups/`**: Overlay dialogs (PausePopup, SettingsPopup, etc.)
- **`src/app/ui/`**: Reusable UI components (Button, Label, RoundedBox, VolumeSlider)
- **`src/app/utils/`**: Application utilities (userSettings, etc.)

### TypeScript Configuration

Strict mode enabled with:
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Bundler module resolution
- `allowImportingTsExtensions` for `.ts` imports

## Game Structure

The project implements a platformer game with the following components:

### Game Screens (`src/app/screens/game/`)
- **StartScreen**: Main menu with start button
- **GameScreen**: Core gameplay loop with physics, collision detection, and level management
- **GameOverScreen**: Death screen with retry/menu options
- **WinScreen**: Victory screen shown after completing all levels

### Game Systems (`src/app/game/`)
- **LevelLoader**: Parses level text files from `public/data/` using `fetch()`
- **Level**: Renders tile-based levels, manages collectibles and hazards
- **Player**: Physics-based movement with gravity, jumping, and collision detection
- **UI Components**: CoinCounter and VirtualControls for mobile support

### Level Format
Levels are stored as text files in `public/data/level1.txt` through `level4.txt`:
- Character mapping: `g`=grass (solid), `d`=door (exit), `z`=coin, `s`=spike (hazard), `.`=air
- Grid-based layout with 32×32 pixel tiles
- Levels are loaded at runtime via `fetch()`, not bundled by AssetPack

### Asset Bundles
- **game-ui**: UI screens (StartScreen, GameOver, etc.) - loaded on startup
- **game**: Gameplay assets (sprites atlas, compressed audio) - loaded when entering game
- Sprites use texture atlas (`{tps}` tag) for performance
- Audio compressed from WAV to MP3/OGG automatically

### Controls
- **Keyboard**: Arrow keys for movement, Space to jump
- **Mobile**: Virtual buttons (left/right arrows + jump button) shown automatically on touch devices

## Key Patterns

1. **Engine Access**: Import `engine()` from `src/app/getEngine.ts` to access the engine instance from anywhere
2. **Screen Lifecycle**: Screens are pooled via `BigPool.get()` for reuse - implement `reset()` to clean up state
3. **Interactivity Management**: Navigation automatically disables `interactiveChildren` during transitions
4. **Visibility Handling**: Engine pauses/resumes all sounds and notifies screens on visibility change
5. **Camera System**: Game uses camera container (scaled 2x) with separate UI layer for HUD elements
6. **Input Cleanup**: ALWAYS remove keyboard listeners in `hide()` method to prevent memory leaks
