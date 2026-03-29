/**
 * Main Application Controller
 * Manages algorithms across Drawing, Filling, Clipping, Visibility, and Transformations.
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
            painters: PaintersAlgorithm,
            transform2d: Transform2DAlgorithm // NEW: Added Transformations
        };

        this.algorithmTitles = {
            dda: 'DDA Line Drawing Algorithm',
            bresenham: "Bresenham's Line Drawing Algorithm",
            circle: 'Midpoint Circle Drawing Algorithm',
            boundaryFill: 'Boundary Fill Algorithm (DFS)',
            floodFill: 'Flood Fill Algorithm (DFS)',
            cohenSutherland: 'Cohen–Sutherland Line Clipping',
            sutherlandHodgman: 'Sutherland–Hodgman Polygon Clipping',
            backFace: 'Back Face Detection Algorithm',
            zbuffer: 'Z-Buffer Algorithm',
            painters: "Painter's Algorithm",
            transform2d: '2D Transformations' // NEW: Added Transformations
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
            painters: 'scene-form',
            transform2d: 'transform-form' // NEW: Added Transformations
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

        // NEW: Transform Type Dropdown Logic
        const transformTypeSelect = document.getElementById('transform-type');
        if (transformTypeSelect) {
            transformTypeSelect.addEventListener('change', (e) => {
                // Hide all parameter divs
                document.querySelectorAll('.transform-params').forEach(el => el.classList.add('hidden'));
                // Show the specific one selected
                const targetParam = document.getElementById(`param-${e.target.value}`);
                if (targetParam) targetParam.classList.remove('hidden');
            });
        }
    }

    switchAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === algorithm);
        });

        // Show the correct form, hide all others (Added 'transform-form')
        const allForms = ['line-form', 'circle-form', 'fill-form', 'clip-line-form', 'clip-poly-form', 'view-form', 'scene-form', 'transform-form'];
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
        // NEW: Transformations Data Capture
        if (algo === 'transform2d') {
            const text = document.getElementById('trans-vertices').value.trim();
            const vertices = text.split(/\s+/).map(pair => {
                const [x, y] = pair.split(',').map(Number);
                return { x: x || 0, y: y || 0 };
            });
            const type = document.getElementById('transform-type').value;
            
            return {
                vertices,
                type,
                params: {
                    tx: parseFloat(document.getElementById('trans-tx').value) || 0,
                    ty: parseFloat(document.getElementById('trans-ty').value) || 0,
                    sx: parseFloat(document.getElementById('trans-sx').value) || 1,
                    sy: parseFloat(document.getElementById('trans-sy').value) || 1,
                    angle: parseFloat(document.getElementById('trans-angle').value) || 0,
                    shx: parseFloat(document.getElementById('trans-shx').value) || 0,
                    shy: parseFloat(document.getElementById('trans-shy').value) || 0,
                    axis: document.getElementById('trans-reflect-axis').value
                }
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
            case 'transform2d': // NEW
                result = algo.calculate(values.vertices, values.type, values.params);
                break;
            case 'zbuffer':
            case 'painters':
                result = algo.calculate(values.sceneId);
                break;
        }

        // Error Handling
        if (result && result.error) {
            alert(result.error);
            this.clear(); 
            return; 
        }

        // Update pixel count (Safeguard for algorithms that don't return 'points' array like Transformations)
        const pointCount = result.points ? result.points.length : 0;
        document.getElementById('pixel-count').textContent = `Pixels/Vertices: ${pointCount > 0 ? pointCount : result.steps.length}`;

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
                if (result.boundaryPoints) {
                    result.boundaryPoints.forEach(p => {
                        this.canvas.plotPixelColor(p.x, p.y, '#f59e0b', 'rgba(245,158,11,0.5)');
                    });
                }
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(i), () => ({
                    color: '#10b981',
                    glow: 'rgba(16,185,129,0.5)'
                }));
                break;

            case 'floodFill':
                if (result.boundaryPoints) {
                    result.boundaryPoints.forEach(p => {
                        this.canvas.plotPixelColor(p.x, p.y, p.color, 'rgba(255,255,255,0.2)');
                    });
                }
                if (result.regionPoints) {
                    result.regionPoints.forEach(p => {
                        this.canvas.plotPixelColor(p.x, p.y, 'rgba(255,255,255,0.05)', 'transparent');
                    });
                }
                const hexF = '#00f5ff'; 
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(i), () => ({
                    color: hexF,
                    glow: `rgba(0,245,255,0.5)`
                }));
                break;

            case 'cohenSutherland':
                this.canvas.drawRect(values.xMin, values.yMin, values.xMax, values.yMax, '#f59e0b', 2);
                this.canvas.drawLine(
                    result.originalLine.x1, result.originalLine.y1,
                    result.originalLine.x2, result.originalLine.y2,
                    'rgba(239, 68, 68, 0.5)', 2
                );
                if (result.accept && result.clippedLine) {
                    this.canvas.drawLine(
                        result.clippedLine.x1, result.clippedLine.y1,
                        result.clippedLine.x2, result.clippedLine.y2,
                        '#10b981', 3
                    );
                }
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), () => ({
                    color: '#f59e0b',
                    glow: 'rgba(245,158,11,0.3)'
                }));
                break;

            case 'sutherlandHodgman':
                this.canvas.drawRect(values.xMin, values.yMin, values.xMax, values.yMax, '#f59e0b', 2);
                this.canvas.drawPolygon(result.originalPolygon, 'rgba(239, 68, 68, 0.5)', 2, true);
                if (result.clippedPolygon && result.clippedPolygon.length > 0) {
                    this.canvas.drawFilledPolygon(result.clippedPolygon, 'rgba(16, 185, 129, 0.25)', '#10b981');
                }
                await this.canvas.animatePixelsColored(result.points, (i) => this.highlightRow(Math.min(i, result.steps.length - 1)), () => ({
                    color: '#f59e0b',
                    glow: 'rgba(245,158,11,0.3)'
                }));
                break;

            case 'backFace':
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

            // NEW: Render Transformations
            case 'transform2d':
                // Draw Original Polygon (Red, dashed outline)
                this.canvas.drawPolygon(result.originalPolygon, 'rgba(239, 68, 68, 0.5)', 2, true);
                
                // Draw Transformed Polygon (Solid green with light fill)
                this.canvas.drawFilledPolygon(result.transformedPolygon, 'rgba(16, 185, 129, 0.25)', '#10b981');
                
                // Highlight final step in table (Short delay for visual flow)
                await new Promise(r => setTimeout(r, 100));
                this.highlightRow(result.steps.length - 1);
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