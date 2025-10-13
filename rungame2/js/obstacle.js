export default class Obstacle {
    constructor(x, y, image, speedPixelsPerSecond) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.width = image.width;
        this.height = image.height;
        this.speedPixelsPerSecond = speedPixelsPerSecond;

        this.y = y - this.height; // y座標を地面に合わせる
    }

    update(deltaTime) {
        this.x -= (this.speedPixelsPerSecond / 1000) * deltaTime;
    }

    draw(renderer) {
        renderer.drawImage(this.image, this.x, this.y);
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    getBounds() {
        // 当たり判定を少し小さく調整
        const padding = 5;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }
}