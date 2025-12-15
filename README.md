# PokeAssist - Pokemon Soul Link Challenge Tracker

A web application for tracking Pokemon Soul Link challenge pairs, runs, and locations. Built with Next.js, Supabase, and integrated with PokeAPI for Pokemon data.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Architecture & File Structure](#architecture--file-structure)
- [Key Components](#key-components)
- [Feature Implementation Details](#feature-implementation-details)
- [Setup Instructions](#setup-instructions)

## Project Overview

**PokeAssist** is designed to help players track their Pokemon Soul Link challenge runs. A Soul Link challenge is a multiplayer Nuzlocke variant where each player's Pokemon are "linked" - if one player's Pokemon faints, the linked Pokemon on the other player's team must be released.

The application provides:
- Session management for tracking multiple Soul Link runs
- Interactive map-based pair tracking
- Pokemon selection with visual sprites
- Run management (multiple runs per session)
- Location-based pair organization

### What is a Soul Link Challenge?

In a Soul Link challenge:
- Two players play simultaneously
- Each catch location yields one Pokemon per player
- Pokemon from the same location are "linked" as pairs
- If a linked Pokemon faints, both must be released
- Players track which Pokemon are caught where to manage their linked pairs

**PokeAssist** helps visualize and manage these pairs on a game map.

## Features

### 1. Session Creation & Management

**Purpose**: Create a new Soul Link session for two players playing a specific Pokemon game.

**User Experience**: 
- Landing page with a form to enter two player names and select a game
- Currently supports "HeartGold & SoulSilver"
- Creates a shareable session link
- Automatically creates the first run (Run 1)

**Implementation**: 
- Located in `src/app/page.tsx`
- Creates a `session` record in Supabase with player names and game selection
- Auto-creates the first `run` associated with that session
- Redirects to the run page immediately after creation

**Context**: The session is the top-level organizational unit. All runs belong to a session, and all pairs belong to runs.

### 2. Session Dashboard

**Purpose**: View session details, manage runs, and share the session link.

**User Experience**:
- Displays player names and game title
- Shows shareable URL with copy button
- Lists all runs in the session
- Button to create new runs
- Active run is highlighted
- Click "Open Run" to navigate to a specific run

**Implementation**:
- Located in `src/app/session/[sessionId]/page.tsx`
- Fetches session and associated runs from Supabase
- Displays runs ordered by run number
- When creating a new run, deactivates all existing runs and creates a new active one

**Context**: This page serves as the central hub for a Soul Link session. Players can track multiple attempts (runs) of the same challenge.

### 3. Interactive Map Run Page

**Purpose**: The main interface for tracking Pokemon pairs on an interactive game map.

**User Experience**:
- Full-screen map display with parallax effects
- Interactive location detection (hover highlights locations)
- Click locations to add pairs
- Top toolbar with "Add Pair" and "Box" tabs
- Settings menu for toggling parallax
- Background image with blur effect

**Implementation**:
- Located in `src/app/session/[sessionId]/run/[runId]/page.tsx` (main component, ~1100 lines)
- Uses layered PNG images for parallax: `HGSS_Back.png`, `HGSS_Objects.png`, `HGSS_Map.png`
- Hitmap detection using `HGSS_Hitmap.png` with color-coded location regions
- Canvas-based pixel sampling for hover detection
- Real-time highlight overlay using canvas manipulation

**Context**: This is the core feature - players use this to visually track where they caught Pokemon and which Pokemon are linked at each location.

#### 3.1 Parallax Effect

**Purpose**: Creates depth and visual interest on the map.

**User Experience**:
- Map layer moves more than objects layer as mouse moves
- Background image moves in reverse (opposite direction)
- Can be toggled in settings
- Smooth transitions when enabled

**Implementation**:
- Mouse position normalized to -1 to 1 relative to container center
- `HGSS_Map.png` moves with multiplier of 3
- `HGSS_Objects.png` moves with multiplier of 1.5
- Background image (`HGSS_JohtoKanto.jpg`) moves in reverse with multiplier of -3 and scales to 1.15x
- Uses CSS `translate3d` for hardware acceleration

**Context**: The parallax makes the map feel more dynamic and engaging. It's optional to avoid motion sensitivity issues.

#### 3.2 Location Detection & Highlighting

**Purpose**: Allow users to interact with specific locations on the map.

**User Experience**:
- Hovering over a location shows a highlighted overlay with saturation boost
- Tooltip displays location name
- Clicking a location opens the "Add Pair" modal with location pre-filled
- Cursor changes to crosshair when hovering over a location

**Implementation**:
- `HGSS_Hitmap.png` is a color-coded image where each location is a specific RGB color
- `LOCATION_MAP` constant maps hex colors to location names
- Hidden canvas samples pixel colors from hitmap as mouse moves
- Highlight canvas composites map layers and applies HSL transformations (saturation boost, brightness adjustment)
- Canvas overlay uses `mix-blend-mode: screen` for blending

**Context**: This system allows precise pixel-level location detection without needing complex geometry calculations or SVG overlays.

### 4. Add Pair Modal

**Purpose**: Create a new Pokemon pair linked to a specific location.

**User Experience**:
- Draggable modal window
- Location field (pre-filled if clicked from map)
- Two Pokemon selector dropdowns (one per player)
- Pokemon selectors show sprites and support search
- "Add Pair" or "Update" button
- Cancel button

**Implementation**:
- Modal state managed with `showAddPairModal` and `modalPosition`
- Drag functionality using mouse events (`onMouseDown`, `mousemove`, `mouseup`)
- Uses `PokemonSelector` component for Pokemon selection
- Optimistic state updates - adds pair to local state immediately without full page reload

**Context**: This is where players record their catches. When both players catch a Pokemon at the same location, they create a pair here.

### 5. Pokemon Selector Component

**Purpose**: Searchable dropdown for selecting Pokemon with visual sprites.

**User Experience**:
- Text input that filters Pokemon list in real-time
- Dropdown shows Pokemon sprites, names, and ID numbers
- Selected Pokemon sprite appears next to input
- Click outside to close
- Clear button (×) to remove selection

**Implementation**:
- Located in `src/components/PokemonSelector.tsx`
- Fetches Pokemon list from PokeAPI on mount (cached in memory)
- Uses `src/lib/pokemon.ts` utilities for data fetching and searching
- Sprites loaded from PokeAPI CDN: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
- Filters Pokemon by name (case-insensitive, partial match)
- Limits results to 100 for performance

**Context**: This replaces manual text entry, reducing errors and making Pokemon selection faster. The sprite display helps visual confirmation.

#### 5.1 Pokemon Utilities (`src/lib/pokemon.ts`)

**Purpose**: Centralized Pokemon data management and API integration.

**Features**:
- `getAllPokemon()`: Fetches up to 1010 Pokemon from PokeAPI and caches in memory
- `searchPokemon()`: Filters Pokemon list by name
- `formatPokemonName()`: Formats names (e.g., "pikachu" → "Pikachu")
- `getPokemonSpriteUrl()`: Generates sprite URLs from Pokemon ID

**Implementation**:
- Uses PokeAPI REST API: `https://pokeapi.co/api/v2/pokemon`
- Fetches in batches of 100
- Extracts Pokemon ID from API URLs
- Caches results to avoid repeated API calls

**Context**: This abstraction layer allows easy switching between API sources and provides consistent Pokemon data throughout the app.

### 6. Box Tab

**Purpose**: View all pairs created in the current run.

**User Experience**:
- Side panel showing list of all pairs
- Each pair displays: location, Pokemon names, creation date
- Edit and Delete buttons for each pair
- Scrollable if many pairs
- Counter in tab shows pair count

**Implementation**:
- Reads from `pairs` state array
- Edit button opens Add Pair modal with existing data
- Delete uses optimistic updates (removes from state immediately)
- Sorted by creation date (ascending)

**Context**: Players use this to review their linked pairs, edit mistakes, or remove pairs if a Pokemon was released.

### 7. Settings Menu

**Purpose**: Toggle features like parallax effect.

**User Experience**:
- Settings button in top-right of toolbar
- Dropdown menu with checkboxes
- Currently includes "Enable Parallax" toggle
- Click outside to close

**Implementation**:
- Managed by `showSettings` state
- `parallaxEnabled` state controls parallax calculations
- Click-outside detection using refs and event listeners

**Context**: Allows users to customize their experience, especially useful for users sensitive to motion.

## Tech Stack

### Frontend
- **Next.js 16.0.8**: React framework with App Router
- **React 19.2.1**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **Canvas API**: For hitmap detection and highlight overlays

### Backend & Database
- **Supabase**: Backend-as-a-Service (BaaS)
  - PostgreSQL database
  - Real-time subscriptions (available but not currently used)
  - Row Level Security (RLS) policies

### External APIs
- **PokeAPI**: Pokemon data and sprite URLs
  - REST API: `https://pokeapi.co/api/v2/pokemon`
  - Sprite CDN: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/`

### Development Tools
- **ESLint**: Code linting
- **Babel React Compiler**: React optimization
- **Git Submodules**: For external dependencies (PokeAPI repos)

## Database Schema

### Tables

#### `sessions`
Top-level entity representing a Soul Link challenge between two players.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `player1_name` | TEXT | First player's name |
| `player2_name` | TEXT | Second player's name |
| `game` | TEXT | Game identifier (e.g., "heartgold-soulsilver") |
| `created_at` | TIMESTAMP | Creation timestamp |

**Purpose**: Organizes all data under a session. Each session represents one Soul Link challenge.

**Context**: Sessions are shareable via URL. Multiple players can view the same session.

#### `runs`
Represents an attempt/playthrough of a Soul Link challenge.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to `sessions.id` |
| `run_number` | INTEGER | Sequential run number (1, 2, 3...) |
| `is_active` | BOOLEAN | Whether this is the current active run |
| `created_at` | TIMESTAMP | Creation timestamp |

**Purpose**: Allows tracking multiple attempts. Players can start over without losing previous run data.

**Context**: Only one run per session is active at a time. Creating a new run deactivates all previous runs.

#### `pairs`
Represents a linked Pokemon pair caught at a specific location.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `run_id` | UUID | Foreign key to `runs.id` |
| `player1_name` | TEXT | First player's Pokemon name |
| `player2_name` | TEXT | Second player's Pokemon name |
| `location` | TEXT | Location name (e.g., "Route 31") |
| `pokemon1` | TEXT | Pokemon name for player 1 (nullable) |
| `pokemon2` | TEXT | Pokemon name for player 2 (nullable) |
| `created_at` | TIMESTAMP | Creation timestamp |

**Purpose**: Core data structure - tracks which Pokemon are linked at which locations.

**Context**: Pokemon names are stored as strings (e.g., "pikachu"). The location must match a value in `LOCATION_MAP` for map interaction to work.

### Relationships
```
sessions (1) ──< (many) runs (1) ──< (many) pairs
```

## Architecture & File Structure

```
pokeassist/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Home page - session creation
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── session/
│   │       └── [sessionId]/          # Dynamic session route
│   │           ├── page.tsx          # Session dashboard
│   │           └── run/
│   │               └── [runId]/
│   │                   └── page.tsx  # Main run page with map
│   ├── components/
│   │   └── PokemonSelector.tsx       # Reusable Pokemon selector
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client initialization
│   │   ├── pokemon.ts                # Pokemon API utilities
│   │   └── gameConfig.ts             # Game configuration system (modular multi-generation support)
│   └── types/
│       └── database.ts               # TypeScript types for DB tables
├── public/                            # Static assets
│   ├── HGSS_Back.png                 # Map background layer
│   ├── HGSS_Objects.png              # Map objects layer
│   ├── HGSS_Map.png                  # Map detail layer (parallax)
│   ├── HGSS_Hitmap.png               # Color-coded location hitmap
│   └── HGSS_JohtoKanto.jpg           # Page background image
├── external/                          # Git submodules
│   └── pokeapi/                      # PokeAPI repository (for future reference)
├── sprites/                           # Git submodule (optional, not required)
│   └── sprites/                      # Local Pokemon sprites (large, 1.45GB)
├── package.json
├── .env.local                         # Environment variables (not in git)
└── README.md
```

## Key Components

### `src/app/page.tsx` - Session Creation
**Purpose**: Landing page for creating new Soul Link sessions.

**Key State**:
- `player1`, `player2`: Player name inputs
- `selectedGame`: Selected game from dropdown
- `loading`: Submit button loading state

**Key Functions**:
- `handleSubmit()`: Creates session and first run, then redirects

### `src/app/session/[sessionId]/page.tsx` - Session Dashboard
**Purpose**: Display session details and manage runs.

**Key State**:
- `session`: Current session data
- `runs`: Array of all runs in session

**Key Functions**:
- `loadSession()`: Fetches session and runs from Supabase
- `createNewRun()`: Creates new run, deactivates others

### `src/app/session/[sessionId]/run/[runId]/page.tsx` - Run Page
**Purpose**: Main interactive map interface (most complex component).

**Key State**:
- `session`, `run`, `pairs`: Data from Supabase
- `activeTab`: 'add-pair' | 'box' | null
- `showAddPairModal`: Modal visibility
- `modalPosition`, `isDragging`: Drag state
- `pairFormData`: Form inputs
- `editingPair`: Currently editing pair (if any)
- `mousePosition`: Normalized mouse position for parallax
- `hoveredLocation`, `hoveredColor`: Current hover state
- `tooltipPosition`: Tooltip coordinates
- `parallaxEnabled`: Settings state

**Key Refs**:
- `hitmapCanvasRef`: Canvas with hitmap image
- `highlightCanvasRef`: Canvas for highlight overlay
- `mapBackCanvasRef`, `mapObjectsCanvasRef`, `mapMapCanvasRef`: Map layer canvases

**Key Data Attributes**:
- `data-parallax-container`: The outer container for parallax calculations
- `data-aspect-container`: The aspect ratio container used for hitmap coordinate calculations (critical for fullscreen support)

**Key Functions**:
- `loadData()`: Fetches session, run, and pairs
- `createPair()`, `updatePair()`, `deletePair()`: CRUD operations with optimistic updates
- `handleMapClick()`: Opens Add Pair modal with location
- Mouse event handlers for parallax and hitmap detection

**Key Effects**:
- Image loading: Loads all map images and hitmap into canvases
- Highlight overlay: Updates when `hoveredColor` changes
- Parallax tracking: Updates `mousePosition` as mouse moves
- Location detection: Samples hitmap pixels on mouse move

### `src/components/PokemonSelector.tsx` - Pokemon Selector
**Purpose**: Searchable dropdown for Pokemon selection.

**Props**:
- `value`: Selected Pokemon name
- `onChange`: Callback when selection changes
- `placeholder`: Input placeholder text
- `label`: Optional label above input

**Key State**:
- `isOpen`: Dropdown visibility
- `searchQuery`: Search input value
- `pokemonList`: Full Pokemon list (from API)
- `filteredPokemon`: Filtered results
- `selectedPokemon`: Currently selected Pokemon object

**Key Functions**:
- `handleSelect()`: Updates selection and closes dropdown
- `handleInputChange()`: Updates search query

### `src/lib/pokemon.ts` - Pokemon Utilities
**Purpose**: Centralized Pokemon data management.

**Exports**:
- `Pokemon` interface
- `getAllPokemon()`: Fetches and caches Pokemon list
- `searchPokemon()`: Filters Pokemon by name
- `formatPokemonName()`: Formats Pokemon names
- `getPokemonSpriteUrl()`: Generates sprite URLs

**Implementation Details**:
- Fetches up to 1010 Pokemon from PokeAPI
- Caches results in module-level variable
- Uses pagination (100 per request)
- Extracts IDs from API URLs (no need for detail fetches)

### `src/lib/gameConfig.ts` - Game Configuration System
**Purpose**: Modular configuration system for supporting multiple Pokemon games/regions.

**Exports**:
- `GameConfig` interface: Defines structure for game configurations
- `getGameConfig(gameId)`: Retrieves configuration for a specific game
- `getAllGameConfigs()`: Returns all available game configurations
- `getAvailableGames()`: Returns games formatted for dropdowns
- `isValidGameId(gameId)`: Validates if a game ID exists

**Game Configuration Structure**:
Each game configuration includes:
- **id**: Unique identifier (e.g., "heartgold-soulsilver")
- **name & displayName**: Game identification
- **assets**: Paths to map images (back, objects, map, hitmap, background)
- **dimensions**: Map dimensions in pixels (width, height)
- **locationMap**: Color-to-location name mapping (hex colors → location names)
- **parallax**: Parallax multipliers for different layers

**Benefits**:
- **Modular**: Adding new games only requires creating a new config object
- **Type-safe**: TypeScript ensures all required fields are present
- **Centralized**: All game-specific data in one place
- **Maintainable**: Easy to update or extend game configurations

**Context**: This system makes the application ready for multi-generation support. To add a new game, simply create a new `GameConfig` object and add it to the registry.

### `src/lib/supabase.ts` - Supabase Client
**Purpose**: Initialize Supabase client for database operations.

**Implementation**:
- Reads environment variables
- Creates and exports singleton client
- Throws error if variables missing

## Feature Implementation Details

### Hitmap Detection System

**Problem**: Need to detect which location on the map the user is hovering/clicking.

**Solution**: Color-coded hitmap image where each location is a unique RGB color.

**Process**:
1. `HGSS_Hitmap.png` is loaded into a hidden canvas
2. On mouse move, calculate pixel coordinates accounting for `object-contain` scaling
3. Sample pixel color from hitmap canvas
4. Look up color in `LOCATION_MAP` constant (or game config's `locationMap`)
5. If match found, update `hoveredLocation` and `hoveredColor`

**Key Constants**:
- Location maps are defined in game configurations (see `src/lib/gameConfig.ts`)
- Each game has a `locationMap` object mapping hex colors (e.g., "#FF0000") to location names
- Currently maps ~50 locations for HeartGold/SoulSilver

**Edge Cases**:
- Black (#000000) pixels are ignored (background)
- Transparent/low-alpha pixels are ignored
- Pixel color matching uses ±2 tolerance for anti-aliasing

**Important Implementation Detail - Coordinate Calculation**:
- The hitmap detection uses the **aspect ratio container's bounding rect** (`data-aspect-container`), not the image element's rect
- This is critical because `object-contain` causes the image to be letterboxed/pillarboxed within its container
- Using the container ensures consistent coordinate calculations across all window sizes, including fullscreen
- The container maintains a fixed aspect ratio via CSS, while the image scales within it
- Coordinates are calculated by:
  1. Getting mouse position relative to the container
  2. Determining which dimension (width/height) constrains the image scale
  3. Calculating the offset where the image starts within the container (for centering)
  4. Converting mouse coordinates to pixel coordinates using the calculated scale

### Highlight Overlay System

**Problem**: Show visual feedback when hovering over a location.

**Solution**: Canvas-based overlay that composites map layers and applies visual effects.

**Process**:
1. When `hoveredColor` changes, trigger highlight update
2. Get all pixel data from hitmap and map layer canvases
3. For each pixel matching `hoveredColor`:
   - Composite back, objects, and map layers (alpha blending)
   - Convert RGB to HSL
   - Apply transformations (saturation boost, brightness adjustment)
   - Convert back to RGB
   - Write to highlight canvas
4. Render highlight canvas with `mix-blend-mode: screen`

**Transformations**:
- Saturation: Multiplied by 2.5
- Brightness: Multiplied by 1.0 (no change)
- Hue: 0° shift (no change)
- Overlay opacity: 255 (fully opaque)

**Performance**: Processes all pixels on hover change. Could be optimized with spatial caching if needed.

### Parallax System

**Problem**: Create depth effect with layered images moving at different rates.

**Solution**: Normalize mouse position and apply different multipliers to each layer.

**Mouse Position Calculation**:
```typescript
const centerX = containerRect.left + containerRect.width / 2;
const centerY = containerRect.top + containerRect.height / 2;
const offsetX = (mouseX - centerX) / (containerRect.width / 2); // -1 to 1
const offsetY = (mouseY - centerY) / (containerRect.height / 2); // -1 to 1
```

**Layer Movement**:
- Background: `x: offsetX * -3, y: offsetY * -3, scale: 1.15`
- Objects: `x: offsetX * 1.5, y: offsetY * 1.5`
- Map: `x: offsetX * 3, y: offsetY * 3`

**Implementation**:
- Uses CSS `transform: translate3d()` for hardware acceleration
- Transition disabled when parallax is off
- Mouse tracking uses `window.addEventListener('mousemove')`

### Optimistic Updates

**Problem**: Avoid full page reloads after CRUD operations.

**Solution**: Update local state immediately, then sync with database.

**Implementation**:
- `createPair()`: After insert, add returned data to `pairs` array
- `updatePair()`: After update, replace matching pair in array
- `deletePair()`: After delete, filter pair out of array

**Benefits**:
- Instant UI feedback
- No loading spinners
- Better UX

**Trade-offs**:
- If API call fails, UI shows incorrect state
- Currently shows alert on error (could add rollback)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git (for submodules)

### 1. Clone Repository
```bash
git clone <repository-url>
cd pokeassist
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Wait for project to initialize

#### Create Database Tables
Run these SQL commands in the Supabase SQL Editor:

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  game TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Runs table
CREATE TABLE runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pairs table
CREATE TABLE pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  location TEXT NOT NULL,
  pokemon1 TEXT,
  pokemon2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_runs_session_id ON runs(session_id);
CREATE INDEX idx_pairs_run_id ON pairs(run_id);
```

#### Set Up Row Level Security (RLS)
Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on runs" ON runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pairs" ON pairs FOR ALL USING (true) WITH CHECK (true);
```

### 4. Configure Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

### 5. Add Map Assets

Place these image files in the `public/` directory:

- `HGSS_Back.png` - Background layer (376x160)
- `HGSS_Objects.png` - Objects layer (376x160)
- `HGSS_Map.png` - Map detail layer (376x160)
- `HGSS_Hitmap.png` - Color-coded location hitmap (376x160)
- `HGSS_JohtoKanto.jpg` - Page background image

**Note**: These are custom assets specific to HeartGold/SoulSilver. For other games, you'll need to create equivalent assets.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. (Optional) Set Up Git Submodules

The PokeAPI repositories are optional (app uses CDN URLs):

```bash
# For PokeAPI data (optional)
git submodule update --init external/pokeapi

# For local sprites (optional, 1.45GB)
git submodule update --init sprites
```

## Development Notes

### Architecture: Modular Game Support

The application uses a **modular game configuration system** (`src/lib/gameConfig.ts`) that makes it easy to add support for new Pokemon games/regions. This architecture:

- **Separates game-specific data** from application logic
- **Centralizes configuration** in a single, type-safe location
- **Eliminates hardcoded values** throughout the codebase
- **Enables easy expansion** to support all Pokemon generations

The run page automatically adapts to any game configuration, using:
- Game-specific map assets and dimensions
- Game-specific location mappings
- Game-specific parallax settings
- Game-specific background images

### Adding New Games

To support additional Pokemon games:

1. **Create Map Assets**: Generate the 5 required images for the new game:
   - `{GAME}_Back.png` - Background layer
   - `{GAME}_Objects.png` - Objects layer
   - `{GAME}_Map.png` - Map detail layer
   - `{GAME}_Hitmap.png` - Color-coded location hitmap
   - `{GAME}_Background.jpg` - Page background image

2. **Add Game Configuration**: In `src/lib/gameConfig.ts`:
   - Create a new `GameConfig` object with all required fields
   - Add it to the `GAME_REGISTRY` object
   - The game will automatically appear in the dropdown on the home page

3. **Create Location Hitmap**: 
   - Use a tool like Photoshop/GIMP to create the hitmap
   - Each location must have a unique hex color
   - Colors should be distinct enough to avoid false positives (±2 tolerance)
   - Map each color to its location name in the `locationMap` field

4. **Configure Parallax** (optional):
   - Adjust parallax multipliers in the `parallax` field
   - Default values work well, but can be customized per game

5. **Test**: 
   - Verify hitmap detection works for all locations
   - Test parallax effects
   - Ensure all images load correctly

**Example**: See `HGSS_CONFIG` in `src/lib/gameConfig.ts` for a complete reference implementation.

### Location Map Updates

When creating or updating location maps:
- Each location must have a **unique hex color** (e.g., `#FF0000`)
- Colors should be **distinct enough** to avoid false positives (current tolerance: ±2 RGB values)
- Use a tool like **Photoshop/GIMP** to create the hitmap image
- **Test thoroughly** - incorrect mappings break location detection
- The hitmap image dimensions must match the `dimensions` specified in the game config

### Performance Considerations

- Pokemon list is cached in memory (fetched once on first use)
- Highlight overlay recalculates all pixels on hover change (could be optimized)
- Parallax uses hardware-accelerated transforms
- Map images are game-specific (dimensions vary by game) but kept small for fast loading
- Game configuration is loaded once per session and cached in component state

### Troubleshooting: Hitmap Detection at Different Window Sizes

**Issue**: Hitmap detection may fail at certain window sizes (especially fullscreen) if coordinate calculations use the wrong reference element.

**Root Cause**: When using `object-contain` CSS, the image element's bounding rect doesn't match the container's coordinate space. The image may be letterboxed/pillarboxed within the container, causing coordinate mismatches.

**Solution**: The hitmap detection system uses the aspect ratio container (`data-aspect-container`) instead of the image element for coordinate calculations. This ensures consistent behavior across all window sizes because:

1. The container maintains a fixed aspect ratio via CSS `aspectRatio` property
2. The image uses `object-contain`, which means it may not fill the entire container
3. Using the container's bounding rect accounts for letterboxing/pillarboxing
4. The scale calculation correctly accounts for which dimension (width/height) constrains the image

**Implementation Details**:
- The aspect ratio container has `data-aspect-container` attribute for reliable selection
- Coordinate calculations use `document.querySelector('[data-aspect-container]').getBoundingClientRect()`
- Scale is calculated based on which dimension constrains the image (wider vs taller aspect ratios)
- Offsets are calculated to account for centering when the image doesn't fill the container

**Important**: When modifying hitmap detection code, always use `document.querySelector('[data-aspect-container]')` to get the coordinate reference, not the image element's bounding rect. This ensures consistent behavior at all window sizes including fullscreen.

### Future Enhancements

Potential features to add:
- Pokemon lookup tab (UI prepared, data utilities ready)
- Shiny Pokemon indicators
- Release/faint tracking
- Team management
- Statistics dashboard
- Export/import functionality
- Additional game/region support (infrastructure ready - just add configs and assets)
- Custom parallax settings per game (already supported in config)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
