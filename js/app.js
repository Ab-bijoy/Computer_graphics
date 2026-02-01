/**
 * Main Application Controller
 */

class App {
    constructor() {
        this.canvas = new CanvasManager('graphics-canvas');
        this.currentAlgorithm = 'dda';
        this.algorithms = {
            dda: DDAAlgorithm,
            bresenham: BresenhamAlgorithm,
            circle: MidpointCircleAlgorithm
        };
        this.algorithmTitles = {
            dda: 'DDA Line Drawing Algorithm',
            bresenham: "Bresenham's Line Drawing Algorithm",
            circle: 'Midpoint Circle Drawing Algorithm'
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

        // Show/hide appropriate form
        const lineForm = document.getElementById('line-form');
        const circleForm = document.getElementById('circle-form');

        if (algorithm === 'circle') {
            lineForm.classList.add('hidden');
            circleForm.classList.remove('hidden');
        } else {
            lineForm.classList.remove('hidden');
            circleForm.classList.add('hidden');
        }

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
        if (this.currentAlgorithm === 'circle') {
            return {
                cx: parseInt(document.getElementById('cx').value) || 0,
                cy: parseInt(document.getElementById('cy').value) || 0,
                radius: parseInt(document.getElementById('radius').value) || 5
            };
        }
        return {
            x1: parseInt(document.getElementById('x1').value) || 0,
            y1: parseInt(document.getElementById('y1').value) || 0,
            x2: parseInt(document.getElementById('x2').value) || 10,
            y2: parseInt(document.getElementById('y2').value) || 5
        };
    }

    async draw() {
        this.clear();
        document.getElementById('canvas-overlay').classList.add('hidden');

        const algo = this.algorithms[this.currentAlgorithm];
        const values = this.getInputValues();

        let result;
        if (this.currentAlgorithm === 'circle') {
            result = algo.calculate(values.cx, values.cy, values.radius);
        } else {
            result = algo.calculate(values.x1, values.y1, values.x2, values.y2);
        }

        // Update pixel count
        document.getElementById('pixel-count').textContent = `Pixels: ${result.points.length}`;

        // Populate table
        this.populateTable(result.steps, algo);

        // Animate drawing
        const speed = parseInt(document.getElementById('speed-slider').value);
        this.canvas.setSpeed(speed);

        await this.canvas.animatePixels(result.points, (index) => {
            this.highlightRow(index);
        });
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
        document.getElementById('table-body').innerHTML = '<tr class="empty-row"><td colspan="5">No data yet. Click Draw to start.</td></tr>';
        document.getElementById('canvas-overlay').classList.remove('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
