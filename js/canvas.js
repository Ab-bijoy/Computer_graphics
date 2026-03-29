/**
 * Canvas Manager - Handles all canvas operations including
 * pixel plotting, line/polygon drawing, region fills, multi-colour rendering,
 * and floating-point geometry for transformations.
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

        // Colour palette for multi-polygon rendering
        this.palette = [
            { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
            { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
            { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
            { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
            { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
            { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
        ];

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

        // Draw minor grid lines
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        for (let x = this.originX % this.pixelSize; x < w; x += this.pixelSize) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h); this.ctx.stroke();
        }
        for (let y = this.originY % this.pixelSize; y < h; y += this.pixelSize) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(w, y); this.ctx.stroke();
        }

        // Draw main axes (X and Y)
        this.ctx.strokeStyle = this.axisColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(0, this.originY); this.ctx.lineTo(w, this.originY); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(this.originX, 0); this.ctx.lineTo(this.originX, h); this.ctx.stroke();

        // Draw coordinate labels
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

    /**
     * Plot a pixel with a custom colour
     */
    plotPixelColor(x, y, color, glowColor, animate = false) {
        const screen = this.toScreen(x, y);
        const size = this.pixelSize - 2;
        this.ctx.shadowColor = glowColor || 'rgba(255,255,255,0.3)';
        this.ctx.shadowBlur = animate ? 15 : 8;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screen.x + 1, screen.y - this.pixelSize + 1, size, size);
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw a continuous line on the canvas
     */
    drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
        const s1 = this.toScreen(x1, y1);
        const s2 = this.toScreen(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(s1.x + this.pixelSize / 2, s1.y - this.pixelSize / 2);
        this.ctx.lineTo(s2.x + this.pixelSize / 2, s2.y - this.pixelSize / 2);
        this.ctx.stroke();
    }

    /**
     * Draw a rectangle outline (used for clip windows)
     */
    drawRect(xMin, yMin, xMax, yMax, color, lineWidth = 2) {
        const s1 = this.toScreen(xMin, yMax); // top-left in screen coords
        const s2 = this.toScreen(xMax, yMin); // bottom-right in screen coords
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(
            s1.x,
            s1.y - this.pixelSize,
            s2.x - s1.x + this.pixelSize,
            s2.y - s1.y + this.pixelSize
        );
        this.ctx.setLineDash([]);
    }

    /**
     * Draw a polygon outline (Supports floating point math for Transformations)
     */
    drawPolygon(vertices, color, lineWidth = 2, dash = false) {
        if (vertices.length < 2) return;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        if (dash) this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        const first = this.toScreen(vertices[0].x, vertices[0].y);
        this.ctx.moveTo(first.x + this.pixelSize / 2, first.y - this.pixelSize / 2);
        for (let i = 1; i < vertices.length; i++) {
            const p = this.toScreen(vertices[i].x, vertices[i].y);
            this.ctx.lineTo(p.x + this.pixelSize / 2, p.y - this.pixelSize / 2);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        if (dash) this.ctx.setLineDash([]);
    }

    /**
     * Draw a filled polygon with transparency
     */
    drawFilledPolygon(vertices, fillColor, strokeColor) {
        if (vertices.length < 2) return;
        this.ctx.beginPath();
        const first = this.toScreen(vertices[0].x, vertices[0].y);
        this.ctx.moveTo(first.x + this.pixelSize / 2, first.y - this.pixelSize / 2);
        for (let i = 1; i < vertices.length; i++) {
            const p = this.toScreen(vertices[i].x, vertices[i].y);
            this.ctx.lineTo(p.x + this.pixelSize / 2, p.y - this.pixelSize / 2);
        }
        this.ctx.closePath();
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    /**
     * Animate standard pixels
     */
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

    /**
     * Animate pixels with per-pixel colour based on type/index
     */
    async animatePixelsColored(points, onStep, colorFn) {
        this.isAnimating = true;
        for (let i = 0; i < points.length; i++) {
            if (!this.isAnimating) break;
            const p = points[i];
            const { color, glow } = colorFn ? colorFn(p, i) : { color: '#6366f1', glow: 'rgba(99,102,241,0.5)' };
            this.plotPixelColor(p.x, p.y, color, glow, true);
            if (onStep) onStep(i);
            await new Promise(r => setTimeout(r, this.animationSpeed));
        }
        this.isAnimating = false;
    }

    stopAnimation() { 
        this.isAnimating = false; 
    }
    
    clear() { 
        this.stopAnimation(); 
        this.drawGrid(); 
    }
    
    setSpeed(value) { 
        this.animationSpeed = 330 - (value * 30); 
    }
}

window.CanvasManager = CanvasManager;