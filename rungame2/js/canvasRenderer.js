export default class CanvasRenderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        if (dx === undefined) { // 引数の数で描画方法を切り替え
            // drawImage(image, dx, dy)
            this.ctx.drawImage(image, sx, sy);
        } else if (dWidth === undefined) {
            // drawImage(image, dx, dy, dWidth, dHeight)
            this.ctx.drawImage(image, sx, sy, sWidth, sHeight);
        } else {
            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    }

    drawText(text, x, y, font, color, align = 'left') {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
}