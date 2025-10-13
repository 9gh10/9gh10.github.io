export default class Background {
    constructor(image, y, canvasWidth, canvasHeight, scrollSpeedRatio) {
        this.image = image;
        this.y = y;
        this.width = this.image.width; // 画像自体の幅を使用
        this.height = canvasHeight;
        this.scrollSpeedRatio = scrollSpeedRatio;

        this.x1 = 0;
        this.x2 = this.width;
    }

    update(deltaTime, gameSpeedPixelsPerSecond) {
        const scrollAmount = (gameSpeedPixelsPerSecond / 1000) * deltaTime * this.scrollSpeedRatio;

        this.x1 -= scrollAmount;
        this.x2 -= scrollAmount;

        if (this.x1 <= -this.width) {
            this.x1 = this.x2 + this.width;
        }
        if (this.x2 <= -this.width) {
            this.x2 = this.x1 + this.width;
        }
    }

    draw(renderer) {
        // 背景画像をキャンバスの高さに合わせて引き伸ばして描画
        renderer.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x1, this.y, this.width, this.height);
        renderer.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x2, this.y, this.width, this.height);
    }
}