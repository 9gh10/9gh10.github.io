import Obstacle from './obstacle.js';
import { getRandomInt, collisionDetection } from './utils.js';

export default class ObstacleManager {
    constructor(canvasWidth, gameSpeedPixelsPerSecond, assetManager, groundY) {
        this.canvasWidth = canvasWidth;
        this.gameSpeedPixelsPerSecond = gameSpeedPixelsPerSecond;
        this.groundY = groundY;

        this.obstacles = [];
        this.availableObstacleImages = [
            assetManager.getAsset('obstacleRock1'),
            assetManager.getAsset('obstacleRock2'),
            assetManager.getAsset('obstacleRock3'),
            // 他の障害物アセットがあればここに追加
        ];

        this.minSpawnInterval = 1500; // ms
        this.maxSpawnInterval = 3500; // ms
        this.spawnTimer = this.minSpawnInterval;
    }

    update(deltaTime) {
        // 障害物の更新と画面外に出たものの削除
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update(deltaTime);
            return !obstacle.isOffscreen();
        });

        // 新しい障害物の生成
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.generateObstacle();
            this.resetSpawnTimer();
        }
    }

    draw(renderer) {
        this.obstacles.forEach(obstacle => obstacle.draw(renderer));
    }

    drawBounds(renderer) {
        this.obstacles.forEach(obstacle => obstacle.drawBounds(renderer));
    }

    generateObstacle() {
        const image = this.availableObstacleImages[
            getRandomInt(0, this.availableObstacleImages.length - 1)
        ];

        const newObstacle = new Obstacle(
            this.canvasWidth,
            this.groundY,
            image,
            this.gameSpeedPixelsPerSecond
        );

        this.obstacles.push(newObstacle);
    }

    checkCollisions(player) {
        const playerBounds = player.getBounds();
        for (const obstacle of this.obstacles) {
            const obstacleBounds = obstacle.getBounds();
            if (collisionDetection(playerBounds, obstacleBounds)) {
                return true;
            }
        }
        return false;
    }

    clearObstacles() {
        this.obstacles = [];
    }

    resetSpawnTimer() {
        this.spawnTimer = getRandomInt(this.minSpawnInterval, this.maxSpawnInterval);
    }
}