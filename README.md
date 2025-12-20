# PokeAssist - Pokemon Nuzlocke & Soul Link Challenge Tracker

A web application for tracking Pokemon Nuzlocke and Soul Link challenge runs. Built with Next.js, Supabase, and integrated with PokeAPI for Pokemon data.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Architecture & File Structure](#architecture--file-structure)
- [Key Components](#key-components)
- [Setup Instructions](#setup-instructions)

## Project Overview

**PokeAssist** is designed to help players track their Pokemon challenge runs, supporting both:
- **Nuzlocke**: Single-player challenge runs
- **Soul Link**: Multi-player challenge runs (2-4 players) where Pokemon are linked across players

The application provides:
- Interactive map-based encounter tracking
- Pokemon selection with visual sprites
- Location detail windows with splash images
- Notes system for location-specific information
- Cookie-based run persistence
- Support for multiple Pokemon games/regions
- Dark/light mode toggle
- Parallax effects

## Features

### 1. Main Menu

**Purpose**: Entry point with cycling background images and run management.

**User Experience**:
- Cycling menu splash images (blurred, semi-transparent background)
- Three main actions: Continue, New Game, Load Game
- Cookie consent popup for saving runs locally
- Smooth transitions between views

**Implementation**:
- Located in `src/app/page.tsx`
- Uses `MenuBackground` component for cycling images
- Cookie utilities in `src/lib/cookies.ts` for run persistence
- Continue button loads most recent run from cookies
- Load Game shows all saved runs

### 2. Game Type Selection

**Purpose**: Choose between Nuzlocke (single player) or Soul Link (multi-player).

**User Experience**:
- Two buttons side-by-side: "Nuzlocke" and "Soul Link"
- Selecting one reveals game selection and customization options
- Smooth animations and transitions

**Implementation**:
- Single-page flow with conditional rendering
- State management for game type, player count, and selections

### 3. Game Selection

**Purpose**: Select which Pokemon game to play.

**User Experience**:
- Grid of game logos (greyscale by default, color on hover)
- For Nuzlocke: Individual games only (HeartGold, SoulSilver, Black, White, Black 2, White 2)
- For Soul Link: All games including combined versions (HeartGold & SoulSilver, Black & White)
- No text labels below logos

**Implementation**:
- Game logos defined in `src/lib/gameLogos.ts`
- Maps logo IDs to game configuration IDs
- Individual games map to their own configs (e.g., "heartgold" → "heartgold" config)

### 4. Player Management (Soul Link Only)

**Purpose**: Configure player count and names for Soul Link challenges.

**User Experience**:
- Player count buttons: 2, 3, or 4 players
- Dynamic player name input fields appear based on count
- Player names formatted as "name1 & name2" (2 players) or "name1, name2 & name3" (3+ players)

**Implementation**:
- Player count state determines number of input fields
- Names stored in session with `player1_name`, `player2_name`, `player3_name`, `player4_name`
- `player_count` field tracks total players

### 5. Customizations

**Purpose**: Configure challenge rules and modifiers.

**User Experience**:
- Checkbox grid with options:
  - Randomizer
  - No Potions
  - Level Cap
  - Dupes Clause (default: enabled)
  - Shiny Clause
  - Set Mode
- Appears when game type is selected

**Implementation**:
- State managed in `NewGameFlow` component
- Currently UI-only (can be extended to store in database)

### 6. Session Dashboard

**Purpose**: View session details, manage runs, and share the session link.

**User Experience**:
- Displays game title and player names
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

### 7. Interactive Map Run Page

**Purpose**: The main interface for tracking Pokemon encounters on an interactive game map.

**User Experience**:
- Full-screen map display with parallax effects (optional)
- Interactive location detection (hover highlights locations)
- Click locations to open location detail window
- Top toolbar with "Add Encounter" and "Box" tabs
- Settings menu for toggling parallax and dark/light mode
- Background image with blur effect
- Location tooltips show location names

**Implementation**:
- Located in `src/app/session/[sessionId]/run/[runId]/page.tsx`
- Uses layered PNG images for parallax: `{GAME}_Back.png`, `{GAME}_Objects.png`, `{GAME}_Map.png`
- Hitmap detection using `{GAME}_Hitmap.png` with color-coded location regions
- Canvas-based pixel sampling for hover detection
- Real-time highlight overlay using canvas manipulation
- Dynamic game configuration loading based on session game

**Key Features**:
- **Parallax Effect**: Optional depth effect with layered images moving at different rates
- **Location Detection**: Color-coded hitmap for precise location identification
- **Dark/Light Mode**: Toggle between themes (default: dark)
- **Encounter Management**: Track encounters per location with duplicate prevention

### 8. Location Detail Window

**Purpose**: View and manage encounters and notes for a specific location.

**User Experience**:
- Draggable window with location name (Perandory font)
- Map description subtitle (DP Pro font)
- Blurred, semi-transparent splash image background
- Encounters section:
  - Lists all encounters for the location
  - Shows which encounters have been added
  - "Add Encounter" button (plus icon) for available encounters
- Notes section:
  - Textarea for location-specific notes
  - Auto-saves on blur
  - Uses Lato font

**Implementation**:
- Located in `src/components/LocationDetailWindow.tsx`
- Splash images from `public/BW/splashes/` (anime folder prioritized, then game folder)
- Encounter list from `src/lib/encounters.ts`
- Notes stored in `location_notes` table in Supabase
- Supports variable player counts (1-4 Pokemon per encounter)

### 9. Add Encounter Modal

**Purpose**: Create a new Pokemon encounter for a specific location.

**User Experience**:
- Draggable modal window
- Location field (pre-filled if clicked from map)
- Pokemon selector dropdowns (one per player)
- Pokemon selectors show sprites and support search
- "Add Encounter" or "Update" button
- Cancel button

**Implementation**:
- Modal state managed with `showAddPairModal` and `modalPosition`
- Drag functionality using mouse events
- Uses `PokemonSelector` component for Pokemon selection
- Optimistic state updates - adds encounter to local state immediately
- Supports variable player counts (1-4 Pokemon)

### 10. Pokemon Selector Component

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
- Sprites loaded from PokeAPI CDN

### 11. Box Tab

**Purpose**: View all encounters created in the current run.

**User Experience**:
- Side panel showing list of all encounters
- Each encounter displays: location, Pokemon names (formatted for player count), creation date
- Edit and Delete buttons for each encounter
- Scrollable if many encounters
- Counter in tab shows encounter count

**Implementation**:
- Reads from `pairs` state array
- Edit button opens Add Encounter modal with existing data
- Delete uses optimistic updates
- Displays Pokemon array or falls back to pokemon1/pokemon2 for backward compatibility

### 12. Settings Menu

**Purpose**: Toggle features like parallax effect and dark/light mode.

**User Experience**:
- Settings icon button in top-right of toolbar
- Dropdown menu with:
  - Dark Mode toggle (slider, default: enabled)
  - Enable Parallax checkbox (default: disabled)
- Click outside to close

**Implementation**:
- Managed by `showSettings` state
- `parallaxEnabled` state controls parallax calculations
- `darkMode` state controls theme
- Click-outside detection using refs and event listeners

## Tech Stack

### Frontend
- **Next.js 16.1.0**: React framework with App Router
- **React 19.2.1**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Icon library
- **Canvas API**: For hitmap detection and highlight overlays

### Backend & Database
- **Supabase**: Backend-as-a-Service (BaaS)
  - PostgreSQL database
  - Row Level Security (RLS) policies

### External APIs
- **PokeAPI**: Pokemon data and sprite URLs
  - REST API: `https://pokeapi.co/api/v2/pokemon`
  - Sprite CDN: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/`

### Fonts
- **Lato**: Primary UI font (Regular, Bold, Italic, Bold Italic, Light, Light Italic)
- **Perandory**: Titles and headers
- **Pokemon DP Pro**: Location names, tooltips, player names, encounter names, map descriptions

## Database Schema

### Tables

#### `sessions`
Top-level entity representing a challenge run.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `player1_name` | TEXT | First player's name (nullable for nuzlocke) |
| `player2_name` | TEXT | Second player's name (nullable for nuzlocke) |
| `player3_name` | TEXT | Third player's name (nullable) |
| `player4_name` | TEXT | Fourth player's name (nullable) |
| `player_count` | INTEGER | Number of players (1-4) |
| `challenge_type` | TEXT | 'nuzlocke' or 'soul-link' |
| `game` | TEXT | Game identifier (e.g., "heartgold", "black-white") |
| `created_at` | TIMESTAMP | Creation timestamp |

#### `runs`
Represents an attempt/playthrough of a challenge.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to `sessions.id` |
| `run_number` | INTEGER | Sequential run number (1, 2, 3...) |
| `is_active` | BOOLEAN | Whether this is the current active run |
| `created_at` | TIMESTAMP | Creation timestamp |

#### `pairs`
Represents a Pokemon encounter at a specific location.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `run_id` | UUID | Foreign key to `runs.id` |
| `player1_name` | TEXT | First player's name |
| `player2_name` | TEXT | Second player's name |
| `player3_name` | TEXT | Third player's name (nullable) |
| `player4_name` | TEXT | Fourth player's name (nullable) |
| `location` | TEXT | Location name (e.g., "Route 31") |
| `pokemon1` | TEXT | Pokemon name for player 1 (nullable, legacy) |
| `pokemon2` | TEXT | Pokemon name for player 2 (nullable, legacy) |
| `pokemon` | JSONB | Array of Pokemon names (new format) |
| `created_at` | TIMESTAMP | Creation timestamp |

#### `location_notes`
Stores user notes for specific locations within a run.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `run_id` | UUID | Foreign key to `runs.id` |
| `location` | TEXT | Location name |
| `notes` | TEXT | Note content (nullable) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Relationships
```
sessions (1) ──< (many) runs (1) ──< (many) pairs
                                    (1) ──< (many) location_notes
```

## Architecture & File Structure

```
pokeassist/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Home page - main menu
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles and fonts
│   │   └── session/
│   │       └── [sessionId]/          # Dynamic session route
│   │           ├── page.tsx          # Session dashboard
│   │           └── run/
│   │               └── [runId]/
│   │                   └── page.tsx  # Main run page with map
│   ├── components/
│   │   ├── CookieConsent.tsx         # Cookie consent popup
│   │   ├── LocationDetailWindow.tsx  # Location detail modal
│   │   ├── MenuBackground.tsx        # Cycling background images
│   │   └── PokemonSelector.tsx       # Reusable Pokemon selector
│   ├── lib/
│   │   ├── cookies.ts                # Cookie utilities for run persistence
│   │   ├── encounters.ts             # Encounter management per location
│   │   ├── gameConfig.ts             # Game configuration system
│   │   ├── gameLogos.ts              # Game logo mappings
│   │   ├── pokemon.ts                # Pokemon API utilities
│   │   ├── splashImages.ts           # Location splash image utilities
│   │   └── supabase.ts               # Supabase client initialization
│   └── types/
│       └── database.ts                # TypeScript types for DB tables
├── public/                            # Static assets
│   ├── BW/                           # Black & White game assets
│   │   ├── BW_Back.png
│   │   ├── BW_Map.png
│   │   ├── BW_Hitmap.png
│   │   ├── BW_Shadow.png
│   │   ├── BW_Fullscreen.jpg
│   │   └── splashes/                 # Location splash images
│   │       ├── anime/                # Anime-style splashes (prioritized)
│   │       └── game/                 # Game-style splashes (fallback)
│   ├── HGSS/                         # HeartGold & SoulSilver assets
│   │   ├── HGSS_Back.png
│   │   ├── HGSS_Map.png
│   │   ├── HGSS_Hitmap.png
│   │   ├── HGSS_Objects.png
│   │   └── HGSS_JohtoKanto.jpg
│   ├── fonts/                        # Custom fonts
│   │   ├── Lato-*.woff               # Lato font variants
│   │   ├── PerandorySemiCondensed.woff
│   │   ├── pokemon-dp-pro.*          # Pokemon DP Pro font
│   │   └── Times-New-Roman-Subsetted.woff
│   ├── logos/                        # Game logo images
│   └── menu_splash/                  # Menu background images
├── package.json
├── tsconfig.json
└── README.md
```

## Key Components

### `src/app/page.tsx` - Main Menu
**Purpose**: Entry point with game creation and run management.

**Key Features**:
- Continue button (loads most recent run from cookies)
- New Game button (starts game creation flow)
- Load Game button (shows all saved runs)
- Cookie consent popup
- Cycling menu background

**Key State**:
- `currentView`: 'home' | 'new-game' | 'load-game'
- `savedRuns`: Array of saved runs from cookies

### `src/app/session/[sessionId]/run/[runId]/page.tsx` - Run Page
**Purpose**: Main interactive map interface.

**Key State**:
- `session`, `run`, `pairs`: Data from Supabase
- `gameConfig`: Current game configuration
- `activeTab`: 'add-pair' | 'box' | null
- `showLocationDetail`, `selectedLocation`: Location detail window state
- `darkMode`, `parallaxEnabled`: Settings state
- `hoveredLocation`, `hoveredColor`: Hover detection state

**Key Functions**:
- `loadData()`: Fetches session, run, and pairs
- `handleMapClick()`: Opens location detail window
- `handleAddPairFromLocation()`: Creates encounter from location detail window
- Mouse event handlers for parallax and hitmap detection

### `src/lib/gameConfig.ts` - Game Configuration System
**Purpose**: Modular configuration system for supporting multiple Pokemon games.

**Supported Games**:
- HeartGold & SoulSilver (combined)
- HeartGold (individual)
- SoulSilver (individual)
- Black & White (combined)
- Black (individual)
- White (individual)
- Black 2
- White 2

**Game Configuration Structure**:
- `id`: Unique identifier
- `displayName`: Display name
- `assets`: Paths to map images (back, objects, map, hitmap, background)
- `dimensions`: Map dimensions in pixels
- `locationMap`: Color-to-location name mapping
- `locationDescriptions`: Location descriptions from hitmap files
- `parallax`: Parallax multipliers for different layers

### `src/lib/encounters.ts` - Encounter Management
**Purpose**: Manages encounter lists per location and game.

**Features**:
- `getLocationEncounters()`: Get encounters for a specific location
- `getAllEncounters()`: Get all encounters for a game
- Prevents duplicate encounter additions
- Supports custom encounters per location

### `src/lib/cookies.ts` - Cookie Utilities
**Purpose**: Save and load runs locally using browser cookies.

**Features**:
- `saveRun()`: Save run to cookies
- `getSavedRuns()`: Get all saved runs
- `updateLastAccessed()`: Update last accessed timestamp
- `removeRun()`: Remove run from cookies
- Cookie consent management

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. Clone Repository
```bash
git clone <your-repository-url>
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
  player1_name TEXT,
  player2_name TEXT,
  player3_name TEXT,
  player4_name TEXT,
  player_count INTEGER DEFAULT 2,
  challenge_type TEXT DEFAULT 'soul-link',
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
  player3_name TEXT,
  player4_name TEXT,
  location TEXT NOT NULL,
  pokemon1 TEXT,
  pokemon2 TEXT,
  pokemon JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location notes table
CREATE TABLE location_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(run_id, location)
);

-- Indexes for performance
CREATE INDEX idx_runs_session_id ON runs(session_id);
CREATE INDEX idx_pairs_run_id ON pairs(run_id);
CREATE INDEX idx_location_notes_run_id ON location_notes(run_id);
CREATE INDEX idx_pairs_pokemon ON pairs USING gin(pokemon);

-- Trigger for updated_at on location_notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_location_notes_updated_at
  BEFORE UPDATE ON location_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Set Up Row Level Security (RLS)
Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on runs" ON runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pairs" ON pairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on location_notes" ON location_notes FOR ALL USING (true) WITH CHECK (true);
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

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Notes

### Adding New Games

To support additional Pokemon games:

1. **Create Map Assets**: Generate the required images:
   - `{GAME}_Back.png` - Background layer
   - `{GAME}_Objects.png` - Objects layer (optional, can reuse Back)
   - `{GAME}_Map.png` - Map detail layer
   - `{GAME}_Hitmap.png` - Color-coded location hitmap
   - `{GAME}_Background.jpg` - Page background image

2. **Create Location Hitmap**: 
   - Use a tool like Photoshop/GIMP
   - Each location must have a unique hex color
   - Map each color to its location name

3. **Add Game Configuration**: In `src/lib/gameConfig.ts`:
   - Create a new `GameConfig` object
   - Add it to the `GAME_REGISTRY`
   - The game will automatically appear in selection

4. **Add Game Logos**: In `src/lib/gameLogos.ts`:
   - Add logo entries for individual and combined versions
   - Map to the correct game configuration ID

5. **Add Splash Images** (optional):
   - Place location splash images in `public/{GAME}/splashes/`
   - Update `src/lib/splashImages.ts` to map locations to images

### Font Usage

- **Lato**: Primary UI font for buttons, labels, and general text
- **Perandory**: Titles, headers, and section labels
- **Pokemon DP Pro**: Location names, tooltips, player names, encounter names, map descriptions

### Performance Considerations

- Pokemon list is cached in memory (fetched once on first use)
- Highlight overlay recalculates all pixels on hover change
- Parallax uses hardware-accelerated transforms
- Game configuration is loaded once per session and cached
- Cookie-based run persistence limits to 10 most recent runs

## License

License information to be added.

## Contributing

Contribution guidelines to be added.
