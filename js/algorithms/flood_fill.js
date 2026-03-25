/**
 * Flood Fill Algorithm
 * Fills all connected pixels of the same colour with a new colour,
 * starting from a seed point (like paint-bucket in image editors).
 */

const FloodFillAlgorithm = {
    name: 'Flood Fill',

    /**
     * Generate a grid with a target-coloured region and flood-fill it
     * @param {number} seedX - Seed point X
     * @param {number} seedY - Seed point Y
     * @param {number} size - Region half-size
     * @returns {Object}
     */
    calculate(seedX, seedY, size) {
        const grid = {};
        const points = [];
        const steps = [];
        const regionPoints = [];
        const r = size || 6;

        // Create a circular target-colour region
        for (let y = -r; y <= r; y++) {
            for (let x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    grid[`${x},${y}`] = 'target';
                    regionPoints.push({ x, y });
                }
            }
        }

        // BFS flood fill – replace 'target' with 'filled'
        const queue = [{ x: seedX, y: seedY }];
        const visited = new Set();
        let stepNum = 0;

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (grid[key] !== 'target') {
                steps.push({
                    step: stepNum++,
                    x,
                    y,
                    action: 'Not target colour – skip',
                    queueSize: queue.length
                });
                continue;
            }

            visited.add(key);
            grid[key] = 'filled';
            points.push({ x, y, type: 'fill' });

            steps.push({
                step: stepNum++,
                x,
                y,
                action: 'Replace colour',
                queueSize: queue.length
            });

            // 4-connected neighbours
            [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }]
                .forEach(n => {
                    const nk = `${n.x},${n.y}`;
                    if (!visited.has(nk)) queue.push(n);
                });
        }

        return {
            points,
            steps,
            regionPoints,
            metadata: {
                seedX,
                seedY,
                regionRadius: r,
                filledPixels: points.length,
                regionPixels: regionPoints.length
            }
        };
    },

    getTableHeaders() {
        return ['Step', 'X', 'Y', 'Action', 'Queue'];
    },

    formatStep(step) {
        return [step.step, step.x, step.y, step.action, step.queueSize];
    },

    getDescription() {
        return `
            <h3>Flood Fill Algorithm</h3>
            <p>Replaces all 4-connected pixels of the same target colour with a new colour, starting from a seed point — like the paint-bucket tool.</p>
            <div class="formula">
                <code>If pixel colour == target colour → replace</code>
                <code>Recurse on 4 neighbours (N, S, E, W)</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.FloodFillAlgorithm = FloodFillAlgorithm;
}
