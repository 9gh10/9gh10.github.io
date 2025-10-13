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

    drawBounds(renderer) {
        const bounds = this.getBounds();
        // 半透明の赤い四角形で当たり判定を描画
        renderer.drawRectangle(bounds.x, bounds.y, bounds.width, bounds.height, 'rgba(255, 0, 0, 0.5)');
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