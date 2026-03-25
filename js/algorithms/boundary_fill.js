/**
 * Boundary Fill Algorithm
 * Fills a region by starting from an interior point and expanding
 * until boundary-colored pixels are encountered.
 */

const BoundaryFillAlgorithm = {
    name: 'Boundary Fill',

    /**
     * Generate a demo grid with a boundary shape and fill it
     * @param {number} seedX - Seed point X
     * @param {number} seedY - Seed point Y
     * @param {number} size - Grid half-size
     * @returns {Object} - Points array and calculation steps
     */
    calculate(seedX, seedY, size) {
        const grid = {};       // key "x,y" → 'boundary' | 'fill' | undefined
        const points = [];
        const steps = [];
        const boundaryPoints = [];

        // Create a diamond boundary shape centred at (0,0)
        const r = size || 6;
        for (let i = -r; i <= r; i++) {
            const offset = r - Math.abs(i);
            const bPoints = [
                { x: i, y: offset },
                { x: i, y: -offset }
            ];
            bPoints.forEach(p => {
                const key = `${p.x},${p.y}`;
                if (!grid[key]) {
                    grid[key] = 'boundary';
                    boundaryPoints.push(p);
                }
            });
        }

        // BFS-based boundary fill from the seed point
        const queue = [{ x: seedX, y: seedY }];
        const visited = new Set();
        let stepNum = 0;

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (grid[key] === 'boundary') {
                steps.push({
                    step: stepNum++,
                    x,
                    y,
                    action: 'Boundary hit – skip',
                    queueSize: queue.length
                });
                continue;
            }

            // Check if point is within reasonable bounds
            if (Math.abs(x) > r + 2 || Math.abs(y) > r + 2) continue;

            visited.add(key);
            grid[key] = 'fill';
            points.push({ x, y, type: 'fill' });

            steps.push({
                step: stepNum++,
                x,
                y,
                action: 'Fill pixel',
                queueSize: queue.length
            });

            // 4-connected neighbours
            const neighbours = [
                { x: x + 1, y },
                { x: x - 1, y },
                { x, y: y + 1 },
                { x, y: y - 1 }
            ];

            neighbours.forEach(n => {
                const nk = `${n.x},${n.y}`;
                if (!visited.has(nk) && grid[nk] !== 'boundary') {
                    queue.push(n);
                }
            });
        }

        return {
            points,
            steps,
            boundaryPoints,
            metadata: {
                seedX,
                seedY,
                boundarySize: r,
                filledPixels: points.length,
                boundaryPixels: boundaryPoints.length
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
            <h3>Boundary Fill Algorithm</h3>
            <p>Starts from an interior seed point and fills outward using 4-connected neighbours until boundary-coloured pixels are reached.</p>
            <div class="formula">
                <code>If pixel ≠ boundary and ≠ fill → fill it</code>
                <code>Recurse on 4 neighbours (N, S, E, W)</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.BoundaryFillAlgorithm = BoundaryFillAlgorithm;
}
