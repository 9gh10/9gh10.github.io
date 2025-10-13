export default class Player {
    constructor(x, y, assetManager, groundY) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;

        this.animationFrames = [
            assetManager.getAsset('playerRun1'),
            assetManager.getAsset('playerRun2')
        ];
        this.jumpImage = assetManager.getAsset('playerJump');

        // 画像からサイズを決定（最初のフレームを基準に）
        this.width = this.animationFrames[0].width;
        this.height = this.animationFrames[0].height;

        this.y = groundY - this.height; // y座標を地面に合わせる
        this.initialY = this.y;

        this.velocityY = 0;
        this.isJumping = false;
        this.gravity = 1800; // ピクセル/秒^2
        this.jumpStrength = 700; // ピクセル/秒
        this.groundY = groundY - this.height;

        this.currentFrameIndex = 0;
        this.animationTimer = 0;
        this.animationSpeed = 150; // ms per frame
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocityY = 0;
        this.isJumping = false;
        this.currentFrameIndex = 0;
        this.animationTimer = 0;
    }

    update(deltaTime) {
        const dtSeconds = deltaTime / 1000;

        if (this.isJumping) {
            this.y += this.velocityY * dtSeconds;
            this.velocityY += this.gravity * dtSeconds;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        } else {
            // 地上にいる場合のアニメーション
            this.animationTimer += deltaTime;
            if (this.animationTimer > this.animationSpeed) {
                this.animationTimer = 0;
                this.currentFrameIndex = (this.currentFrameIndex + 1) % this.animationFrames.length;
            }
        }
    }

    draw(renderer) {
        let imageToDraw;
        if (this.isJumping) {
            imageToDraw = this.jumpImage;
        } else {
            imageToDraw = this.animationFrames[this.currentFrameIndex];
        }
        renderer.drawImage(imageToDraw, this.x, this.y);
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpStrength;
        }
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