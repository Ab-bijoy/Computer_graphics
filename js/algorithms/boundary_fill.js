/**
 * Boundary Fill Algorithm (8-Connected Stack / DFS implementation)
 * Fills a region by starting from an interior point and expanding
 * depth-first in 8 directions until boundary-colored pixels are encountered.
 */

const BoundaryFillAlgorithm = {
    name: 'Boundary Fill',

    /**
     * Generate a demo grid with a boundary shape and fill it
     * @param {number} seedX - Seed point X
     * @param {number} seedY - Seed point Y
     * @param {number} size - Grid half-size
     * @returns {Object} - Points array, steps, and error status
     */
    calculate(seedX, seedY, size) {
        const r = size || 6;

        // --- UPDATED: IN-BOUNDS CHECK FOR SQUARE ---
        // For a square centered at 0,0 with radius r, the point is outside or on the border if |x| >= r or |y| >= r.
        if (Math.abs(seedX) >= r || Math.abs(seedY) >= r) {
            return {
                error: `Please select a starting Seed Point strictly inside the square region (X and Y must be between -${r - 1} and ${r - 1}).`,
                points: [],
                steps: [],
                boundaryPoints: []
            };
        }

        const grid = {};       
        const points = [];
        const steps = [];
        const boundaryPoints = [];

        // --- UPDATED: CREATE A WATERTIGHT SQUARE BOUNDARY ---
        // A square ensures 8-connected fills do not leak through diagonal corners.
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                // Only draw the border walls (where x or y is at the maximum edge)
                if (Math.abs(x) === r || Math.abs(y) === r) {
                    const key = `${x},${y}`;
                    if (!grid[key]) {
                        grid[key] = 'boundary';
                        boundaryPoints.push({ x, y });
                    }
                }
            }
        }

        // DFS-based boundary fill from the seed point using a Stack
        const stack = [{ x: seedX, y: seedY }];
        const visited = new Set();
        let stepNum = 0;

        while (stack.length > 0) {
            const { x, y } = stack.pop(); 
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            
            if (grid[key] === 'boundary') {
                steps.push({
                    step: stepNum++,
                    x,
                    y,
                    action: 'Boundary hit – skip',
                    stackSize: stack.length
                });
                continue;
            }

            // Safety net
            if (Math.abs(x) > r + 2 || Math.abs(y) > r + 2) continue;

            visited.add(key);
            grid[key] = 'fill';
            points.push({ x, y, type: 'fill' });

            steps.push({
                step: stepNum++,
                x,
                y,
                action: 'Fill pixel',
                stackSize: stack.length
            });

            // --- UPDATED: 8-CONNECTED NEIGHBOURS ---
            const neighbours = [
                { x: x + 1, y },         // Right
                { x: x - 1, y },         // Left
                { x, y: y + 1 },         // Up
                { x, y: y - 1 },         // Down
                { x: x + 1, y: y + 1 },  // Top-Right
                { x: x - 1, y: y + 1 },  // Top-Left
                { x: x + 1, y: y - 1 },  // Bottom-Right
                { x: x - 1, y: y - 1 }   // Bottom-Left
            ];

            neighbours.forEach(n => {
                const nk = `${n.x},${n.y}`;
                if (!visited.has(nk) && grid[nk] !== 'boundary') {
                    stack.push(n);
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
        return ['Step', 'X', 'Y', 'Action', 'Stack Size']; 
    },

    formatStep(step) {
        return [step.step, step.x, step.y, step.action, step.stackSize]; 
    },

    getDescription() {
        return `
            <h3>Boundary Fill Algorithm (8-Connected DFS)</h3>
            <p>Starts from an interior seed point and fills outward using a Stack and 8-connected neighbours (including diagonals) until a solid square boundary is reached.</p>
            <div class="formula">
                <code>If pixel ≠ boundary and ≠ fill → fill it</code>
                <code>Push 8 neighbours (N, S, E, W, NE, NW, SE, SW) to Stack</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.BoundaryFillAlgorithm = BoundaryFillAlgorithm;
}