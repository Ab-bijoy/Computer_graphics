/**
 * Flood Fill Algorithm (8-Connected Stack / DFS implementation)
 * Fills all connected pixels of the same target colour with a new colour,
 * starting from a seed point.
 */

const FloodFillAlgorithm = {
    name: 'Flood Fill',

    calculate(seedX, seedY, size) {
        const r = size || 6;
        const grid = {};
        const points = [];
        const steps = [];
        const regionPoints = [];
        const boundaryPoints = []; // NEW: Array to store our multi-colored walls

        // A palette to generate the multi-colored boundary
        const wallColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

        // ==========================================
        // 1. BUILD THE WORLD (Multi-Colored Square)
        // ==========================================
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                const key = `${x},${y}`;
                
                // If it's the edge, make it a multi-colored boundary wall
                if (Math.abs(x) === r || Math.abs(y) === r) {
                    grid[key] = 'wall';
                    // Pick a random color from our palette for this specific pixel
                    const randomColor = wallColors[Math.floor(Math.random() * wallColors.length)];
                    boundaryPoints.push({ x, y, color: randomColor });
                } 
                // If it's inside, paint it with the target background color
                else {
                    grid[key] = 'target';
                    regionPoints.push({ x, y });
                }
            }
        }

        // ==========================================
        // 2. ERROR CHECK (Are we clicking the target color?)
        // ==========================================
        // If the starting point is NOT the 'target' color, abort immediately.
        if (grid[`${seedX},${seedY}`] !== 'target') {
            return {
                error: `Invalid Seed Point. You must click inside the background 'target' region to flood fill it.`,
                points: [],
                steps: [],
                boundaryPoints: [],
                regionPoints: []
            };
        }

        // ==========================================
        // 3. DFS STACK & 8-CONNECTED LOGIC
        // ==========================================
        // Changed from Queue to Stack for Depth-First Search
        const stack = [{ x: seedX, y: seedY }];
        const visited = new Set();
        let stepNum = 0;

        while (stack.length > 0) {
            // Using POP() instead of shift() for Stack behavior
            const { x, y } = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            
            // Note: Flood fill asks "Is this NOT the target?" 
            // It doesn't care if it's a wall, out of bounds, or previously painted.
            if (grid[key] !== 'target') {
                steps.push({
                    step: stepNum++,
                    x,
                    y,
                    action: 'Not target colour – skip',
                    stackSize: stack.length // Updated label
                });
                continue;
            }

            visited.add(key);
            grid[key] = 'filled'; // Replace the target color
            points.push({ x, y, type: 'fill' });

            steps.push({
                step: stepNum++,
                x,
                y,
                action: 'Replace colour',
                stackSize: stack.length // Updated label
            });

            // Changed to 8-connected neighbours
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
                if (!visited.has(nk)) stack.push(n);
            });
        }

        return {
            points,
            steps,
            regionPoints,
            boundaryPoints, // Returning the boundary points so app.js can draw them
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
        return ['Step', 'X', 'Y', 'Action', 'Stack Size']; // Updated header
    },

    formatStep(step) {
        return [step.step, step.x, step.y, step.action, step.stackSize]; // Updated property
    },

    getDescription() {
        return `
            <h3>Flood Fill Algorithm (8-Connected DFS)</h3>
            <p>Replaces all 8-connected pixels of the exact same target colour with a new colour, starting from a seed point. It ignores the colour of the boundary walls entirely.</p>
            <div class="formula">
                <code>If pixel colour == target colour → replace</code>
                <code>Push 8 neighbours (N, S, E, W, NE, NW, SE, SW) to Stack</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.FloodFillAlgorithm = FloodFillAlgorithm;
}