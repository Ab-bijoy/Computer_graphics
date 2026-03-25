/**
 * Main Application Controller
 * Manages 10 algorithms across Drawing, Filling, Clipping and Visibility categories.
 */

class App {
    constructor() {
        this.canvas = new CanvasManager('graphics-canvas');
        this.currentAlgorithm = 'dda';

        this.algorithms = {
            dda: DDAAlgorithm,
            bresenham: BresenhamAlgorithm,
            circle: MidpointCircleAlgorithm,
            boundaryFill: BoundaryFillAlgorithm,
            floodFill: FloodFillAlgorithm,
            cohenSutherland: CohenSutherlandAlgorithm,
            sutherlandHodgman: SutherlandHodgmanAlgorithm,
            backFace: BackFaceAlgorithm,
            zbuffer: ZBufferAlgorithm,
            painters: PaintersAlgorithm
        };

        this.algorithmTitles = {
            dda: 'DDA Line Drawing Algorithm',
            bresenham: "Bresenham's Line Drawing Algorithm",
            circle: 'Midpoint Circle Drawing Algorithm',
            boundaryFill: 'Boundary Fill Algorithm',
            floodFill: 'Flood Fill Algorithm',
            cohenSutherland: 'Cohen–Sutherland Line Clipping',
            sutherlandHodgman: 'Sutherland–Hodgman Polygon Clipping',
            backFace: 'Back Face Detection Algorithm',
            zbuffer: 'Z-Buffer Algorithm',
            painters: "Painter's Algorithm"
        };

        // Map algorithms to their input form IDs
        this.formMap = {
            dda: 'line-form',
            bresenham: 'line-form',
            circle: 'circle-form',
            boundaryFill: 'fill-form',
            floodFill: 'fill-form',
            cohenSutherland: 'clip-line-form',
            sutherlandHodgman: 'clip-poly-form',
            backFace: 'view-form',
            zbuffer: 'scene-form',
            painters: 'scene-form'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateAlgorithmInfo();
    }

    bindEvents() {
        // Algorithm tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAlgorithm(e.target.closest('.tab-btn').dataset.algorithm));
        });

        // Draw button
        document.getElementById('draw-btn').addEventListener('click', () => this.draw());

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());

        // Speed slider
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.canvas.setSpeed(parseInt(e.target.value));
        });
    }

    switchAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === algorithm);
        });

        // Show the correct form, hide all others
        const allForms = ['line-form', 'circle-form', 'fill-form', 'clip-line-form', 'clip-poly-form', 'view-form', 'scene-form'];
        const activeForm = this.formMap[algorithm];
        allForms.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', id !== activeForm);
        });

        // Update title and info
        document.getElementById('canvas-title').textContent = this.algorithmTitles[algorithm];
        this.updateAlgorithmInfo();
        this.updateTableHeaders();
        this.clear();
    }

    updateAlgorithmInfo() {
        const algo = this.algorithms[this.currentAlgorithm];
        document.getElementById('algorithm-info').innerHTML = `<div class="info-card">${algo.getDescription()}</div>`;
    }

    updateTableHeaders() {
        const algo = this.algorithms[this.currentAlgorithm];
        const headers = algo.getTableHeaders();
        const headerRow = document.getElementById('table-header');
        headerRow.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
    }

    getInputValues() {
        const algo = this.currentAlgorithm;

        if (algo === 'circle') {
            return {
                cx: parseInt(document.getElementById('cx').value) || 0,
                cy: parseInt(document.getElementById('cy').value) || 0,
                radius: parseInt(document.getElementById('radius').value) || 5
            };
        }
        if (algo === 'dda' || algo === 'bresenham') {
            return {
                x1: parseInt(document.getElementById('x1').value) || 0,
                y1: parseInt(document.getElementById('y1').value) || 0,
                x2: parseInt(document.getElementById('x2').value) || 10,
                y2: parseInt(document.getElementById('y2').value) || 5
            };
        }
        if (algo === 'boundaryFill' || algo === 'floodFill') {
            return {
                seedX: parseInt(document.getElementById('seed-x').value) || 0,
                seedY: parseInt(document.getElementById('seed-y').value) || 0,
                size: parseInt(document.getElementById('fill-size').value) || 6
            };
        }
        if (algo === 'cohenSutherland') {
            return {
                x1: parseFloat(document.getElementById('clip-x1').value) || -8,
                y1: parseFloat(document.getElementById('clip-y1').value) || -6,
                x2: parseFloat(document.getElementById('clip-x2').value) || 8,
                y2: parseFloat(document.getElementById('clip-y2').value) || 7,
                xMin: parseFloat(document.getElementById('clip-xmin').value) || -5,
                yMin: parseFloat(document.getElementById('clip-ymin').value) || -5,
                xMax: parseFloat(document.getElementById('clip-xmax').value) || 5,
                yMax: parseFloat(document.getElementById('clip-ymax').value) || 5
            };
        }
        if (algo === 'sutherlandHodgman') {
            const text = document.getElementById('poly-vertices').value.trim();
            const polygon = text.split(/\s+/).map(pair => {
                const [x, y] = pair.split(',').map(Number);
                return { x: x || 0, y: y || 0 };
            });
            return {
                polygon,
                xMin: parseFloat(document.getElementById('poly-xmin').value) || -5,
                yMin: parseFloat(document.getElementById('poly-ymin').value) || -5,
                xMax: parseFloat(document.getElementById('poly-xmax').value) || 5,
                yMax: parseFloat(document.getElementById('poly-ymax').value) || 5
            };
        }
        if (algo === 'backFace') {
            return {
                vx: parseFloat(document.getElementById('view-x').value) || 0,
                vy: parseFloat(document.getElementById('view-y').value) || 0,
                vz: parseFloat(document.getElementById('view-z').value) || -1
            };
        }
        // zbuffer, painters
        return { sceneId: 0 };
    }

    async draw() {
        this.clear();
        document.getElementById('canvas-overlay').classList.add('hidden');

        const algo = this.algorithms[this.currentAlgorithm];
        const values = this.getInputValues();
        const algoKey = this.currentAlgorithm;

        let result;

        // Call the algorithm
        switch (algoKey) {
            case 'dda':
            case 'bresenham':
                result = algo.calculate(values.x1, values.y1, values.x2, values.y2);
                break;
            case 'circle':
                result = algo.calculate(values.cx, values.cy, values.radius);
                break;
            case 'boundaryFill':
            case 'floodFill':
                result = algo.calculate(values.seedX, values.seedY, values.size);
                break;
            case 'cohenSutherland':
                result = algo.calculate(values.x1, values.y1, values.x2, values.y2, values.xMin, values.yMin, values.xMax, values.yMax);
                break;
            case 'sutherlandHodgman':
                result = algo.calculate(values.polygon, values.xMin, values.yMin, values.xMax, values.yMax);
                break;
            case 'backFace':
                result = algo.calculate(values.vx, values.vy, values.vz);
                break;
            case 'zbuffer':
            case 'painters':
                result = algo.calculate(values.sceneId);
                break;
        }

        // Update pixel count
        document.getElementById('pixel-count').textContent = `Pixels: ${result.points.length}`;

        // Populate table
        this.populateTable(result.steps, algo);

        // Set animation speed
        const speed = parseInt(document.getElementById('speed-slider').value);
        this.canvas.setSpeed(speed);

        // Render based on algorithm type
        await this.renderResult(algoKey, result, values);
    }

    /**
     * Render results with algorithm-specific visualisation
     */
    async renderResult(algoKey, result, values) {
        switch (algoKey) {
            case 'dda':
            case 'bresenham':
            case 'circle':
                await this.canvas.animatePixels(result.points, (i) => this.highlightRow(i));
                break;

            case 'boundaryFill':
                // Draw boundary first
                if (result.boundaryPoints) {
                    result.boundaryPoints.forEach(p => {
                        this.canvas.plotPixelColor(p.x, p.y, '#f59e0b', 'rgba(245,158,11,0.5)');
                    });
                }
                // Animate fill
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(i), () => ({
                    color: '#10b981',
                    glow: 'rgba(16,185,129,0.5)'
                }));
                break;

            case 'floodFill':
                // Draw original region outline faintly
                if (result.regionPoints) {
                    result.regionPoints.forEach(p => {
                        this.canvas.plotPixelColor(p.x, p.y, 'rgba(255,255,255,0.08)', 'transparent');
                    });
                }
                // Animate fill
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(i), () => ({
                    color: '#6366f1',
                    glow: 'rgba(99,102,241,0.5)'
                }));
                break;

            case 'cohenSutherland':
                // Draw clip window
                this.canvas.drawRect(values.xMin, values.yMin, values.xMax, values.yMax, '#f59e0b', 2);
                // Draw original line
                this.canvas.drawLine(
                    result.originalLine.x1, result.originalLine.y1,
                    result.originalLine.x2, result.originalLine.y2,
                    'rgba(239, 68, 68, 0.5)', 2
                );
                // Draw clipped line
                if (result.accept && result.clippedLine) {
                    this.canvas.drawLine(
                        result.clippedLine.x1, result.clippedLine.y1,
                        result.clippedLine.x2, result.clippedLine.y2,
                        '#10b981', 3
                    );
                }
                // Animate window border pixels
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), (p) => ({
                    color: '#f59e0b',
                    glow: 'rgba(245,158,11,0.3)'
                }));
                break;

            case 'sutherlandHodgman':
                // Draw clip window
                this.canvas.drawRect(values.xMin, values.yMin, values.xMax, values.yMax, '#f59e0b', 2);
                // Draw original polygon
                this.canvas.drawPolygon(result.originalPolygon, 'rgba(239, 68, 68, 0.5)', 2, true);
                // Draw clipped polygon
                if (result.clippedPolygon && result.clippedPolygon.length > 0) {
                    this.canvas.drawFilledPolygon(result.clippedPolygon, 'rgba(16, 185, 129, 0.25)', '#10b981');
                }
                // Animate window border pixels
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), () => ({
                    color: '#f59e0b',
                    glow: 'rgba(245,158,11,0.3)'
                }));
                break;

            case 'backFace':
                // Animate edge pixels with face colouring
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), (p) => {
                    const faceColors = {
                        'Front': { color: '#6366f1', glow: 'rgba(99,102,241,0.5)' },
                        'Back': { color: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
                        'Left': { color: '#10b981', glow: 'rgba(16,185,129,0.5)' },
                        'Right': { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
                        'Top': { color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
                        'Bottom': { color: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
                    };
                    return faceColors[p.face] || { color: '#6366f1', glow: 'rgba(99,102,241,0.5)' };
                });
                break;

            case 'zbuffer':
            case 'painters': {
                const palette = this.canvas.palette;
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), (p) => {
                    const idx = (p.polyIndex || 0) % palette.length;
                    return { color: palette[idx].fill, glow: palette[idx].glow };
                });
                break;
            }
        }
    }

    populateTable(steps, algo) {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        steps.forEach((step, index) => {
            const row = document.createElement('tr');
            row.id = `step-row-${index}`;
            const values = algo.formatStep(step);
            row.innerHTML = values.map(v => `<td>${v}</td>`).join('');
            tbody.appendChild(row);
        });
    }

    highlightRow(index) {
        document.querySelectorAll('.steps-table tbody tr').forEach(row => row.classList.remove('highlight'));
        const row = document.getElementById(`step-row-${index}`);
        if (row) {
            row.classList.add('highlight');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    clear() {
        this.canvas.clear();
        document.getElementById('pixel-count').textContent = 'Pixels: 0';
        document.getElementById('table-body').innerHTML = '<tr class="empty-row"><td colspan="7">No data yet. Click Draw to start.</td></tr>';
        document.getElementById('canvas-overlay').classList.remove('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
