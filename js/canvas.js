/**
 * Canvas Manager - Handles all canvas operations
 */

class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pixelSize = 20;
        this.gridColor = 'rgba(255, 255, 255, 0.08)';
        this.axisColor = 'rgba(255, 255, 255, 0.3)';
        this.pixelColor = '#6366f1';
        this.pixelGlow = 'rgba(99, 102, 241, 0.5)';
        this.originX = 0;
        this.originY = 0;
        this.isAnimating = false;
        this.animationSpeed = 100;
        this.resize();
        window.addEventListener('resize', () => setTimeout(() => this.resize(), 100));
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        this.originX = Math.floor(rect.width / 2);
        this.originY = Math.floor(rect.height / 2);
        this.drawGrid();
    }

    toScreen(x, y) {
        return {
            x: this.originX + x * this.pixelSize,
            y: this.originY - y * this.pixelSize
        };
    }

    drawGrid() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);

        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        for (let x = this.originX % this.pixelSize; x < w; x += this.pixelSize) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h); this.ctx.stroke();
        }
        for (let y = this.originY % this.pixelSize; y < h; y += this.pixelSize) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(w, y); this.ctx.stroke();
        }

        this.ctx.strokeStyle = this.axisColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(0, this.originY); this.ctx.lineTo(w, this.originY); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(this.originX, 0); this.ctx.lineTo(this.originX, h); this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.font = '11px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        for (let i = Math.floor(-this.originX / this.pixelSize); i <= Math.floor((w - this.originX) / this.pixelSize); i++) {
            if (i !== 0 && i % 5 === 0) this.ctx.fillText(i.toString(), this.originX + i * this.pixelSize, this.originY + 5);
        }
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        for (let i = Math.floor(-this.originY / this.pixelSize); i <= Math.floor((h - this.originY) / this.pixelSize); i++) {
            if (i !== 0 && i % 5 === 0) this.ctx.fillText(i.toString(), this.originX - 5, this.originY - i * this.pixelSize);
        }
    }

    plotPixel(x, y, animate = false) {
        const screen = this.toScreen(x, y);
        const size = this.pixelSize - 2;
        this.ctx.shadowColor = this.pixelGlow;
        this.ctx.shadowBlur = animate ? 15 : 8;
        const gradient = this.ctx.createLinearGradient(screen.x + 1, screen.y - this.pixelSize + 1, screen.x + 1 + size, screen.y + 1);
        gradient.addColorStop(0, '#818cf8');
        gradient.addColorStop(1, '#6366f1');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(screen.x + 1, screen.y - this.pixelSize + 1, size, size);
        this.ctx.shadowBlur = 0;
    }

    async animatePixels(points, onStep, speed = 100) {
        this.animationSpeed = speed;
        this.isAnimating = true;
        for (let i = 0; i < points.length; i++) {
            if (!this.isAnimating) break;
            this.plotPixel(points[i].x, points[i].y, true);
            if (onStep) onStep(i);
            await new Promise(r => setTimeout(r, this.animationSpeed));
        }
        this.isAnimating = false;
    }

    stopAnimation() { this.isAnimating = false; }
    clear() { this.stopAnimation(); this.drawGrid(); }
    setSpeed(value) { this.animationSpeed = 330 - (value * 30); }
}

window.CanvasManager = CanvasManager;
