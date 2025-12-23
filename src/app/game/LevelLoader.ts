export interface TileData {
  type: "air" | "grass" | "door" | "coin" | "spike";
  x: number; // grid coordinate
  y: number; // grid coordinate
  sprite: string;
}

export interface LevelData {
  name: string;
  background: string;
  width: number; // in tiles
  height: number; // in tiles
  tiles: TileData[];
  playerStart: { x: number; y: number }; // in pixels
}

const TILE_SIZE = 32;

const TILE_MAPPING: Record<string, { type: TileData["type"]; sprite: string }> =
  {
    g: { type: "grass", sprite: "Grass.png" },
    d: { type: "door", sprite: "Door.png" },
    z: { type: "coin", sprite: "ZileanCoin.png" },
    s: { type: "spike", sprite: "Spike.png" },
    ".": { type: "air", sprite: "" },
  };

export class LevelLoader {
  /**
   * Load and parse a level file
   * @param levelNum Level number (1-4)
   * @returns Parsed level data
   */
  public static async loadLevel(levelNum: number): Promise<LevelData> {
    // Load via fetch (NOT AssetPack)
    // Use BASE_URL for GitHub Pages compatibility
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/level${levelNum}.txt`,
    );

    if (!response.ok) {
      throw new Error(`Level ${levelNum} not found`);
    }

    const text = await response.text();

    return this.parseLevelText(text, levelNum);
  }

  /**
   * Parse level text format
   * Format:
   * Line 1: "Level1 Name: Level1" (skip)
   * Line 2: "Level Background: white.png" (skip)
   * Line 3: "Level .size (.block.): 10 x 10" (skip)
   * Lines 4+: Grid data
   */
  private static parseLevelText(text: string, levelNum: number): LevelData {
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    // Parse metadata
    const nameLine = lines[0] || "";
    const backgroundLine = lines[1] || "";

    const name = nameLine.includes(":")
      ? nameLine.split(":")[1].trim()
      : `Level ${levelNum}`;
    const background = backgroundLine.includes(":")
      ? backgroundLine.split(":")[1].trim()
      : "white.png";

    // Skip first 3 metadata lines
    const gridLines = lines.slice(3);

    // Parse grid
    const tiles: TileData[] = [];
    let playerStart: { x: number; y: number } = { x: 32, y: 32 }; // default spawn
    let hasDoor = false;
    let firstGrassTile: { x: number; y: number } | null = null;

    const height = gridLines.length;
    let width = 0;

    gridLines.forEach((line, y) => {
      width = Math.max(width, line.length);

      for (let x = 0; x < line.length; x++) {
        const char = line[x];
        const mapping = TILE_MAPPING[char];

        if (mapping) {
          // Don't create sprites for air tiles
          if (mapping.type !== "air") {
            tiles.push({
              type: mapping.type,
              x,
              y,
              sprite: mapping.sprite,
            });
          }

          // Track first grass tile for player spawn
          if (mapping.type === "grass" && !firstGrassTile) {
            firstGrassTile = { x, y };
          }

          // Track if door exists
          if (mapping.type === "door") {
            hasDoor = true;
          }
        }
      }
    });

    // Set player spawn to top of first grass block
    if (firstGrassTile) {
      const tile = firstGrassTile as { x: number; y: number };

      playerStart = {
        x: tile.x * TILE_SIZE + TILE_SIZE / 2,
        y: tile.y * TILE_SIZE, // Spawn on top of the grass (player center at grass top edge)
      };
    }

    // Validate level
    if (!hasDoor) {
      console.warn(`Level ${levelNum} has no door (exit)`);
    }

    return {
      name,
      background,
      width,
      height,
      tiles,
      playerStart,
    };
  }
}
