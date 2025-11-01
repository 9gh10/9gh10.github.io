# RunGame - Technical Design Document

## 1. Introduction

This document outlines the technical design for "RunGame," a web-based running game built using HTML Canvas and JavaScript. The game features a player character running to the right, a scrolling background, randomly appearing obstacles, and a jump mechanic triggered by spacebar or screen tap. The core objective is to run as far as possible without colliding with an obstacle, with the total distance displayed upon game over.

## 2. High-Level Architecture

The game will follow a modular, object-oriented design approach. The main components will include:

*   **HTML Structure:** A simple HTML page containing a `<canvas>` element for rendering.
*   **JavaScript Modules:**
    *   `Game`: Orchestrates the entire game, manages the game loop, and holds references to all core components.
    *   `CanvasRenderer`: Handles all drawing operations on the HTML Canvas.
    *   `AssetManager`: Loads and manages game assets (images).
    *   `Player`: Represents the player character, handling its state, movement, and animations.
    *   `Background`: Manages the scrolling background layers.
    *   `Obstacle`: Represents a single obstacle object.
    *   `ObstacleManager`: Responsible for spawning, updating, and removing obstacles, and detecting collisions.
*   **Game Loop:** Powered by `requestAnimationFrame` for smooth, efficient animation.

```
+-----------------+
|   index.html    |
|  (Canvas Element)|
+--------+--------+
         |
+--------v--------+
|    game.js      |
|  (Main Game Logic)|
| +---------------+ |
| |     Game      | |
| | (Orchestrator)| |
| +-------+-------+ |
|         |         |
| +-------v-------+ |    +----------------+
| | CanvasRenderer|------>| HTML Canvas 2D |
| +---------------+ |    | Context        |
|                   |    +----------------+
| +---------------+ |    +----------------+
| |  AssetManager |------>| Image Assets   |
| +---------------+ |    +----------------+
|                   |
| +---------------+ |
| |    Player     | |
| +---------------+ |
|                   |
| +---------------+ |
| |   Background  | |
| +---------------+ |
|                   |
| +---------------+ |
| |ObstacleManager| |
| | +-----------+ | |
| | |  Obstacle | | | (Multiple instances)
| | +-----------+ | |
| +---------------+ |
+-------------------+
```

## 3. Core Game Loop

The game loop is the heart of the application, responsible for continuously updating the game state and redrawing the canvas.

```javascript
// Global scope or within Game class
let lastTime = 0;
let deltaTime = 0; // Time in milliseconds since last frame

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Pause game loop if game is over
    if (Game.isGameOver) {
        // Potentially handle restart logic here or in an event listener
        return;
    }

    // Update game state
    Game.update(deltaTime);

    // Draw everything
    Game.draw();
}

// Initial call to start the loop
// requestAnimationFrame(gameLoop); // Called by Game.start()
```

## 4. Detailed Class Design

All drawing operations will leverage the `CanvasRenderer` to ensure a clean separation of concerns.

---

### `class Game`

Manages the overall game state, initialization, and the game loop.

**Properties:**

*   `canvas`: Reference to the HTML Canvas element.
*   `ctx`: The 2D rendering context of the canvas.
*   `canvasRenderer`: Instance of `CanvasRenderer`.
*   `assetManager`: Instance of `AssetManager`.
*   `player`: Instance of `Player`.
*   `background`: Instance of `Background`.
*   `obstacleManager`: Instance of `ObstacleManager`.
*   `isGameOver`: Boolean, true when the game has ended.
*   `gameSpeedPixelsPerSecond`: The effective horizontal speed of the game world (background and obstacles). Derived from 45km/h.
*   `distanceRunMeters`: Accumulates the total distance run.
*   `gameStartTime`: Timestamp of when the game started (for distance calculation).
*   `lastFrameTime`: Timestamp of the last animation frame.
*   `animationFrameId`: ID returned by `requestAnimationFrame`.

**Methods:**

*   **`constructor(canvasId)`:**
    *   Initializes `canvas`, `ctx`, `canvasRenderer`, `assetManager`.
    *   Sets up initial game state (`isGameOver = true`, `distanceRunMeters = 0`).
    *   Binds input event listeners (`handleInput`).
*   **`init()`: `async`**
    *   Loads all necessary assets via `assetManager.loadAll()`.
    *   Initializes `player`, `background`, `obstacleManager` instances, passing `gameSpeedPixelsPerSecond`.
    *   Sets up initial positions.
    *   Prepares for `start()`.
*   **`start()`:**
    *   Resets game state (`isGameOver = false`, `distanceRunMeters = 0`, `gameStartTime = performance.now()`).
    *   Clears existing obstacles.
    *   Starts the `requestAnimationFrame` loop by calling `gameLoop`.
    *   Sets `lastFrameTime = performance.now()`.
*   **`update(deltaTime)`:**
    *   Updates `player` state (position, animation, jump physics).
    *   Updates `background` position.
    *   Updates `obstacleManager` (moving obstacles, spawning new ones).
    *   Checks for collisions using `obstacleManager.checkCollisions(this.player)`. If a collision occurs, calls `gameOver()`.
    *   Updates `distanceRunMeters`:
        `this.distanceRunMeters += (this.gameSpeedPixelsPerSecond / 1000) * deltaTime * (this.KMH_TO_MPS_FACTOR);`
        (Where `KMH_TO_MPS_FACTOR` converts km/h to meters per pixel for the displayed speed)
*   **`draw()`:**
    *   Calls `canvasRenderer.clearCanvas()`.
    *   Calls `background.draw(this.canvasRenderer)`.
    *   Calls `obstacleManager.draw(this.canvasRenderer)`.
    *   Calls `player.draw(this.canvasRenderer)`.
    *   Draws UI elements (e.g., current distance, game over message) using `canvasRenderer.drawText()`.
*   **`gameOver()`:**
    *   Sets `isGameOver = true`.
    *   Cancels the `requestAnimationFrame` loop (`cancelAnimationFrame(this.animationFrameId)`).
    *   Displays "Game Over" message and final `distanceRunMeters` on screen using `canvasRenderer.drawText()`.
    *   Potentially adds a "Press R to Restart" prompt.
*   **`handleInput(event)`:**
    *   Listens for `keydown` (spacebar) and `touchstart` events.
    *   If spacebar/tap and `!this.isGameOver` and `!this.player.isJumping`, calls `player.jump()`.
    *   If `isGameOver` and a 'R' key is pressed, calls `start()`.

---

### `class CanvasRenderer`

Provides an abstraction layer for drawing on the HTML Canvas.

**Properties:**

*   `ctx`: The 2D rendering context.
*   `canvasWidth`: Width of the canvas.
*   `canvasHeight`: Height of the canvas.

**Methods:**

*   **`constructor(ctx, canvasWidth, canvasHeight)`:**
    *   Initializes `ctx`, `canvasWidth`, `canvasHeight`.
*   **`clearCanvas()`:**
    *   `this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)`.
*   **`drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)`:**
    *   A wrapper for `this.ctx.drawImage()`, allowing for sprite sheet usage (`sx`, `sy`, etc.) or simple image drawing.
*   **`drawRectangle(x, y, width, height, color, fill = true)`:**
    *   Draws a rectangle, useful for debugging hitboxes or simple shapes.
*   **`drawText(text, x, y, font, color, align = 'left')`:**
    *   Draws text on the canvas, e.g., for score, distance, game over messages.

---

### `class AssetManager`

Handles loading of all game assets (images).

**Properties:**

*   `assets`: An object to store loaded `Image` objects (e.g., `{ 'playerRun1': Image, 'obstacle1': Image }`).
*   `numAssetsLoaded`: Counter for loaded assets.
*   `numAssetsTotal`: Total number of assets to load.

**Methods:**

*   **`constructor()`:**
    *   Initializes `assets`, `numAssetsLoaded`, `numAssetsTotal`.
*   **`loadAsset(name, path)`: `async`**
    *   Loads a single image asset. Returns a `Promise` that resolves with the `Image` object.
    *   Updates `numAssetsLoaded` on success.
*   **`loadAll(assetList)`: `async`**
    *   `assetList` is an array of `{ name: string, path: string }` objects.
    *   Sets `numAssetsTotal`.
    *   Uses `Promise.all` to load all assets concurrently.
    *   Returns a `Promise` that resolves when all assets are loaded.

---

### `class Player`

Represents the player character.

**Properties:**

*   `x`, `y`: Current position on canvas.
*   `width`, `height`: Dimensions.
*   `velocityY`: Vertical speed for jumping.
*   `isJumping`: Boolean.
*   `gravity`: Downward acceleration during jump.
*   `jumpStrength`: Initial upward velocity when jumping.
*   `animationFrames`: Array of `Image` objects for running animation.
*   `jumpImage`: `Image` object for jump pose.
*   `currentFrameIndex`: Index of the current animation frame.
*   `animationTimer`: Tracks time for animation frame switching.
*   `animationSpeed`: How quickly frames change.
*   `groundY`: The Y-coordinate where the player stands.

**Methods:**

*   **`constructor(x, y, width, height, assetManager, groundY)`:**
    *   Initializes position, dimensions, `groundY`.
    *   Loads player specific images from `assetManager`.
    *   Sets up initial physics properties (`velocityY`, `gravity`, `jumpStrength`).
*   **`update(deltaTime)`:**
    *   If `isJumping`:
        *   `this.y += this.velocityY * (deltaTime / 1000)`.
        *   `this.velocityY += this.gravity * (deltaTime / 1000)`.
        *   If `this.y >= this.groundY` (hit ground):
            *   `this.y = this.groundY`.
            *   `this.isJumping = false`.
            *   `this.velocityY = 0`.
    *   If `!isJumping`:
        *   Updates `animationTimer` and `currentFrameIndex` to cycle through running animation frames.
*   **`draw(renderer)`:**
    *   Determines which image (running frame or jump image) to draw based on `isJumping`.
    *   Calls `renderer.drawImage()` to draw the appropriate image at `(this.x, this.y)`.
    *   (Optional: Draws collision box for debugging).
*   **`jump()`:**
    *   Sets `isJumping = true`.
    *   Sets `velocityY = -this.jumpStrength` (upwards).
*   **`getBounds()`:**
    *   Returns an object `{ x, y, width, height }` representing the player's current bounding box for collision detection.

---

### `class Background`

Manages the scrolling background. Can use multiple layers for parallax.

**Properties:**

*   `image`: The `Image` object for the background tile.
*   `scrollSpeedRatio`: How fast this layer scrolls relative to the game speed (e.g., 0.5 for parallax, 1.0 for main foreground).
*   `x1`, `x2`: X-coordinates for two instances of the background image, creating an infinite scroll.
*   `y`, `width`, `height`: Position and dimensions of the background.

**Methods:**

*   **`constructor(image, y, width, height, scrollSpeedRatio)`:**
    *   Initializes properties.
    *   Sets `x1 = 0`, `x2 = width` initially.
*   **`update(deltaTime, gameSpeedPixelsPerSecond)`:**
    *   Calculates scroll amount: `scrollAmount = (gameSpeedPixelsPerSecond / 1000) * deltaTime * this.scrollSpeedRatio`.
    *   Decrements `x1` and `x2` by `scrollAmount`.
    *   If `x1` goes completely off-screen to the left, reset `x1` to `x2 + this.width` (or `width` if only one image).
    *   If `x2` goes completely off-screen to the left, reset `x2` to `x1 + this.width`.
*   **`draw(renderer)`:**
    *   Calls `renderer.drawImage()` twice, once for `x1` and once for `x2`, to draw the seamless scrolling background.

---

### `class Obstacle`

Represents a single obstacle object.

**Properties:**

*   `x`, `y`: Current position.
*   `width`, `height`: Dimensions.
*   `image`: The `Image` object for this obstacle.
*   `speedPixelsPerSecond`: The speed at which this obstacle moves from right to left (relative to the player's perceived speed).

**Methods:**

*   **`constructor(x, y, width, height, image, speedPixelsPerSecond)`:**
    *   Initializes all properties.
*   **`update(deltaTime)`:**
    *   `this.x -= (this.speedPixelsPerSecond / 1000) * deltaTime`.
*   **`draw(renderer)`:**
    *   Calls `renderer.drawImage()` to draw the obstacle at `(this.x, this.y)`.
    *   (Optional: Draws collision box for debugging).
*   **`isOffscreen()`:**
    *   Returns `true` if `this.x + this.width < 0`, indicating it's off the left side of the canvas.
*   **`getBounds()`:**
    *   Returns an object `{ x, y, width, height }` representing the obstacle's current bounding box.

---

### `class ObstacleManager`

Manages a collection of `Obstacle` objects, including spawning and collision detection.

**Properties:**

*   `obstacles`: An array of `Obstacle` instances.
*   `canvasWidth`: Reference to game canvas width.
*   `gameSpeedPixelsPerSecond`: Reference to the game's scroll speed.
*   `availableObstacleImages`: An array of `Image` objects for different obstacle types.
*   `minSpawnInterval`, `maxSpawnInterval`: Time range for random obstacle spawning.
*   `spawnTimer`: Tracks time until next obstacle spawn.
*   `groundY`: The Y-coordinate obstacles appear on.

**Methods:**

*   **`constructor(canvasWidth, gameSpeedPixelsPerSecond, assetManager, groundY)`:**
    *   Initializes `obstacles` array, `canvasWidth`, `gameSpeedPixelsPerSecond`, `groundY`.
    *   Populates `availableObstacleImages` from `assetManager` (e.g., `assetManager.assets.obstacle1`, `assetManager.assets.obstacle2`).
    *   Sets initial `spawnTimer`.
*   **`update(deltaTime)`:**
    *   Iterate through `this.obstacles`:
        *   Call `obstacle.update(deltaTime)` for each.
        *   If `obstacle.isOffscreen()`, remove it from the array.
    *   Update `this.spawnTimer`: `this.spawnTimer -= deltaTime`.
    *   If `this.spawnTimer <= 0`:
        *   Call `this.generateObstacle()`.
        *   Reset `this.spawnTimer` to a new random interval between `minSpawnInterval` and `maxSpawnInterval`.
*   **`draw(renderer)`:**
    *   Iterate through `this.obstacles` and call `obstacle.draw(renderer)` for each.
*   **`generateObstacle()`:**
    *   Randomly selects an `image` from `availableObstacleImages`.
    *   Determines random dimensions (within reasonable bounds) for the obstacle.
    *   Calculates `y` position based on `groundY` and obstacle height.
    *   Creates a new `Obstacle` instance, positioning it at `this.canvasWidth` (far right).
    *   Adds the new `Obstacle` to `this.obstacles` array.
*   **`checkCollisions(player)`:**
    *   Iterates through `this.obstacles`.
    *   For each obstacle, performs AABB collision detection with `player.getBounds()` and `obstacle.getBounds()`.
    *   If a collision is detected, returns `true` immediately.
    *   If no collision, returns `false`.
*   **`clearObstacles()`:**
    *   Empties the `this.obstacles` array.

---

## 5. Global Functions / Utilities

These helper functions might be placed in a `utils.js` file or directly within `game.js`.

*   **`collisionDetection(rect1, rect2)`:**
    *   **Input:** Two objects, each with `{ x, y, width, height }` properties.
    *   **Output:** `boolean` - `true` if rectangles overlap, `false` otherwise.
    *   **Logic:** Standard Axis-Aligned Bounding Box (AABB) collision check:
        `(rect1.x < rect2.x + rect2.width &&`
        `rect1.x + rect1.width > rect2.x &&`
        `rect1.y < rect2.y + rect2.height &&`
        `rect1.y + rect1.height > rect2.y)`

*   **`convertKmHToPixelsPerSecond(kmh, pixelsPerMeter)`:**
    *   **Input:** Speed in kilometers per hour (`kmh`), conversion factor for pixels per meter (`pixelsPerMeter`).
    *   **Output:** Speed in pixels per second.
    *   **Logic:** `(kmh * 1000 / 3600) * pixelsPerMeter`

*   **`getRandomInt(min, max)`:**
    *   **Input:** `min`, `max` integers.
    *   **Output:** Random integer between `min` (inclusive) and `max` (inclusive).

## 6. Asset Management

The game will require several image assets:

*   **Player:**
    *   `player_run_1.png`, `player_run_2.png`, ... (for running animation)
    *   `player_jump.png` (for jumping pose)
*   **Background:**
    *   `background_tile.png` (a seamless, repeating background image)
*   **Obstacles:**
    *   `obstacle_rock.png`, `obstacle_bush.png`, `obstacle_log.png` (various obstacle types with transparent backgrounds)

These assets will be preloaded by the `AssetManager` before the game starts.

## 7. Game Flow and State

1.  **Page Load:**
    *   HTML Canvas and other DOM elements are loaded.
    *   `Game` instance is created (`const game = new Game('gameCanvas');`).
    *   `game.init()` is called to load assets.
2.  **Assets Loaded:**
    *   `game.init()` resolves.
    *   Game is ready to start, possibly showing a "Click to Start" screen.
3.  **Game Start (`game.start()`):**
    *   `isGameOver` set to `false`.
    *   Distance counter reset.
    *   `requestAnimationFrame` loop initiated.
4.  **Game Loop (Active):**
    *   `update()`: Player, Background, Obstacles move. Collisions checked. Distance updated.
    *   `draw()`: All objects rendered on canvas. UI updated.
    *   **Input:** Spacebar/Tap triggers `player.jump()`.
5.  **Collision Detected:**
    *   `game.gameOver()` is called.
    *   `isGameOver` set to `true`.
    *   `cancelAnimationFrame` stops the loop.
    *   "Game Over" message and final distance are displayed.
6.  **Restart:**
    *   Player presses a restart key (e.g., 'R').
    *   `game.start()` is called to reset and restart the game.

## 8. Technical Considerations and Future Enhancements

*   **Canvas Scaling:** Implement responsiveness by adjusting canvas size on `window.resize` and scaling drawing coordinates if needed.
*   **Performance:** Optimize image drawing, especially for large numbers of obstacles. Consider off-screen canvases for complex static layers.
*   **Sound Effects:** Add sound effects for jumping, collisions, and background music.
*   **Score/Distance:** Implement persistent high scores using `localStorage`.
*   **Difficulty Scaling:** Gradually increase `gameSpeedPixelsPerSecond` or decrease `minSpawnInterval` over time to make the game harder.
*   **Parallax Background:** Enhance the `Background` class to handle multiple layers with different `scrollSpeedRatio` values for a more immersive effect.
*   **Player Animations:** More detailed running and jumping animations (sprite sheets).
*   **Power-ups:** Introduce power-up items that the player can collect.
*   **Object Pooling:** For `Obstacle` objects, use object pooling instead of constantly creating and destroying new objects to reduce garbage collection overhead, especially in long games.
*   **Bundling/Transpilation:** For larger projects, use tools like Webpack or Parcel for modularity, minification, and browser compatibility. (Beyond initial scope, but good to keep in mind).
*   **Collision System:** For more complex shapes, consider pixel-perfect collision or more advanced physics libraries (though AABB is sufficient here).

This design provides a solid foundation for building the "RunGame" with clear responsibilities for each module and leverages HTML Canvas efficiently.