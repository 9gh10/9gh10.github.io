import CanvasRenderer from './canvasRenderer.js';
import AssetManager from './assetManager.js';
import Player from './player.js';
import Background from './background.js';
import ObstacleManager from './obstacleManager.js';
import { convertKmHToPixelsPerSecond } from './utils.js';

const ASSETS = [
    { name: 'playerRun1', path: 'assets/player_run_1.png' },
    { name: 'playerRun2', path: 'assets/player_run_2.png' },
    { name: 'playerJump', path: 'assets/player_jump.png' },
    { name: 'background', path: 'assets/background_tile.png' },
    { name: 'obstacleRock1', path: 'assets/obstacle_rock.png' },
    { name: 'obstacleRock2', path: 'assets/obstacle_rock50-80.png' },
    { name: 'obstacleRock3', path: 'assets/obstacle_rock40-50.png' },
];

const GAME_SPEED_KMH = 70;
const PIXELS_PER_METER = 10; // 1メートルを10ピクセルとして換算

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;

        this.canvasRenderer = new CanvasRenderer(this.ctx, this.canvas.width, this.canvas.height);
        this.assetManager = new AssetManager();

        this.debugMode = false; // 当たり判定の視覚化を有効にする
        this.isGameOver = true;
        this.distanceRunMeters = 0;
        this.gameStartTime = 0;
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        this.gameSpeedPixelsPerSecond = convertKmHToPixelsPerSecond(GAME_SPEED_KMH, PIXELS_PER_METER);

        this.player = null;
        this.background = null;
        this.obstacleManager = null;

        this.bindInputHandlers();
    }

    async init() {
        this.canvasRenderer.drawText('Loading assets...', this.canvas.width / 2, this.canvas.height / 2, '30px Arial', 'black', 'center');
        await this.assetManager.loadAll(ASSETS);

        const groundY = this.canvas.height - 100;

        this.player = new Player(50, groundY, this.assetManager, groundY);
        this.background = new Background(this.assetManager.getAsset('background'), 0, this.canvas.width, this.canvas.height, 1.0);
        this.obstacleManager = new ObstacleManager(this.canvas.width, this.gameSpeedPixelsPerSecond, this.assetManager, groundY);

        this.canvasRenderer.clearCanvas();
        this.canvasRenderer.drawText('Press Space or Tap to Start', this.canvas.width / 2, this.canvas.height / 2, '30px Arial', 'black', 'center');
    }

    start() {
        this.isGameOver = false;
        this.distanceRunMeters = 0;
        this.gameStartTime = performance.now();
        this.lastFrameTime = this.gameStartTime;

        this.player.reset();
        this.obstacleManager.clearObstacles();

        this.gameLoop(this.gameStartTime);
    }

    gameLoop(currentTime) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        if (deltaTime > 0) {
            this.update(deltaTime);
            this.draw();
        }
    }

    update(deltaTime) {
        this.background.update(deltaTime, this.gameSpeedPixelsPerSecond);
        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime);

        if (this.obstacleManager.checkCollisions(this.player)) {
            this.gameOver();
        }

        // 距離を更新 (ピクセル/秒 * 経過秒数(s) / ピクセル/メートル = メートル)
        this.distanceRunMeters += (this.gameSpeedPixelsPerSecond * (deltaTime / 1000)) / PIXELS_PER_METER;
    }

    draw() {
        this.canvasRenderer.clearCanvas();

        this.background.draw(this.canvasRenderer);
        this.obstacleManager.draw(this.canvasRenderer);
        this.player.draw(this.canvasRenderer);

        // UI描画
        this.canvasRenderer.drawText(`Distance: ${Math.floor(this.distanceRunMeters)} m`, 20, 40, '24px Arial', 'black');

        // デバッグモードが有効な場合、当たり判定を描画
        if (this.debugMode) {
            this.player.drawBounds(this.canvasRenderer);
            this.obstacleManager.drawBounds(this.canvasRenderer);
        }
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        cancelAnimationFrame(this.animationFrameId);

        // Game Over画面描画
        this.canvasRenderer.drawText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40, '50px Arial', 'red', 'center');
        this.canvasRenderer.drawText(`Final Distance: ${Math.floor(this.distanceRunMeters)} m`, this.canvas.width / 2, this.canvas.height / 2, '30px Arial', 'black', 'center');
        this.canvasRenderer.drawText('Press "R" to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40, '24px Arial', 'black', 'center');
    }

    handleInput(event) {
        const key = event.type === 'keydown' ? event.key : null;
        const isTouch = event.type === 'touchstart';

        if (this.isGameOver) {
            if (key === 'r' || key === 'R') {
                this.start();
            }
            // ゲーム開始前
            else if (this.player && (key === ' ' || isTouch)) {
                 if (this.player.y === this.player.groundY) { // 初回スタート判定
                    this.start();
                 }
            }
        } else {
            if ((key === ' ' || isTouch) && !this.player.isJumping) {
                event.preventDefault(); // スペースキーでの画面スクロールを防止
                this.player.jump();
            }
        }
    }

    bindInputHandlers() {
        // bind(this) で、イベントハンドラ内の `this` が Game インスタンスを指すようにする
        this.boundHandleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.boundHandleInput);
        this.canvas.addEventListener('touchstart', this.boundHandleInput);
    }

    // クリーンアップ用（将来的拡張のため）
    destroy() {
        window.removeEventListener('keydown', this.boundHandleInput);
        this.canvas.removeEventListener('touchstart', this.boundHandleInput);
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}