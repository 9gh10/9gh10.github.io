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
    
    drawRectangle(x, y, width, height, color, fill = true) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        if (fill) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    drawGround(y, color = '#2ecc71', lineColor = '#27ae60') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, y, this.canvasWidth, this.canvasHeight - y);

        // Add some ground texture/decoration
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.canvasWidth; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, y);
            this.ctx.lineTo(i + 10, y + 5);
            this.ctx.stroke();
        }
    }

    drawCloud(x, y, size, color = 'rgba(255, 255, 255, 0.8)') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.5, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.4, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
}