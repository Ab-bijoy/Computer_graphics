/**
 * Boundary Fill Algorithm (8-Connected Stack / DFS implementation)
 * * THE GOAL: Start at a specific pixel (the "seed point") and color it. 
 * Then, color its neighbors, and their neighbors, spreading outwards in 
 * all 8 directions (including diagonals) until you hit a solid boundary wall.
 */

const BoundaryFillAlgorithm = {
    name: 'Boundary Fill',

    calculate(seedX, seedY, size) {
        // 'r' is the radius (or distance from the center to the wall). 
        // If no size is provided, it defaults to 6.
        const r = size || 6;

        // ==========================================
        // STEP 1: SAFETY CHECK (Are we inside the room?)
        // ==========================================
        // We are drawing a square room. The walls are at 'r' and '-r'.
        // If the starting point's X or Y is equal to or bigger than 'r', 
        // the user clicked on the wall or outside of it.
        // Example: If r=6, and the user clicks (6, 0), they clicked the wall.
        if (Math.abs(seedX) >= r || Math.abs(seedY) >= r) {
            return {
                error: `Please select a starting Seed Point strictly inside the square region (X and Y must be between -${r - 1} and ${r - 1}).`,
                points: [],
                steps: [],
                boundaryPoints: []
            };
        }

        // ==========================================
        // STEP 2: BUILD THE WORLD
        // ==========================================
        const grid = {};         // Our map of the canvas. Keeps track of what is a 'boundary' or 'fill'.
        const points = [];       // A list of the pixels we actually painted.
        const steps = [];        // A step-by-step diary of everything we did (for the UI table).
        const boundaryPoints = []; // A list of the wall pixels.

        // Draw the square walls. We loop through all possible X and Y coordinates.
        // If the coordinate is at the extreme edge (equal to r or -r), it becomes a wall.
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                if (Math.abs(x) === r || Math.abs(y) === r) {
                    const key = `${x},${y}`; // Create a text label for the coordinate, like "6,6"
                    if (!grid[key]) {
                        grid[key] = 'boundary'; // Mark it as a wall on our map
                        boundaryPoints.push({ x, y });
                    }
                }
            }
        }

        // ==========================================
        // STEP 3: PREPARE FOR PAINTING
        // ==========================================
        // 'stack' is our To-Do List of sticky notes. We start by writing our seed point on a note.
        const stack = [{ x: seedX, y: seedY }];
        
        // 'visited' is our Notebook. We write down every coordinate we check so we don't check it twice.
        const visited = new Set();
        let stepNum = 0;

        // ==========================================
        // STEP 4: THE MAIN LOOP (The Painting Process)
        // ==========================================
        // As long as we have sticky notes on our To-Do list, keep working!
        while (stack.length > 0) {
            
            // 1. Take the TOP sticky note off the pile. (This is what makes it Depth-First Search).
            const { x, y } = stack.pop(); 
            const key = `${x},${y}`;

            // 2. Did we already check this exact spot? If yes, throw the note away and move on.
            if (visited.has(key)) continue;
            
            // 3. Is this spot a wall?
            if (grid[key] === 'boundary') {
                steps.push({ step: stepNum++, x, y, action: 'Boundary hit – skip', stackSize: stack.length });
                continue; // Throw the note away and move on.
            }

            // 4. Safety net: Did the algorithm somehow escape the room? If it went too far, stop it.
            if (Math.abs(x) > r + 2 || Math.abs(y) > r + 2) continue;

            // 5. PAINT IT!
            // It's not visited, and it's not a wall. So, write it in our Notebook as visited...
            visited.add(key);
            // ...mark it as painted on our map...
            grid[key] = 'fill';
            // ...and save it to show the user.
            points.push({ x, y, type: 'fill' });
            steps.push({ step: stepNum++, x, y, action: 'Fill pixel', stackSize: stack.length });

            // 6. FIND NEIGHBORS
            // Look at all 8 squares immediately surrounding the one we just painted.
            const neighbours = [
                { x: x + 1, y },         // Right
                { x: x - 1, y },         // Left
                { x, y: y + 1 },         // Up
                { x, y: y - 1 },         // Down
                { x: x + 1, y: y + 1 },  // Top-Right diagonal
                { x: x - 1, y: y + 1 },  // Top-Left diagonal
                { x: x + 1, y: y - 1 },  // Bottom-Right diagonal
                { x: x - 1, y: y - 1 }   // Bottom-Left diagonal
            ];

            // For every neighbor, ask: "Is it a wall?" and "Have I visited it?"
            // If the answer is NO to both, write its coordinates on a new sticky note 
            // and put it on top of our To-Do list stack.
            neighbours.forEach(n => {
                const nk = `${n.x},${n.y}`;
                if (!visited.has(nk) && grid[nk] !== 'boundary') {
                    stack.push(n);
                }
            });
            // The loop now restarts, grabs the top note off the stack, and repeats!
        }

        // ==========================================
        // STEP 5: RETURN THE RESULTS
        // ==========================================
        return {
            points,
            steps,
            boundaryPoints,
            metadata: { seedX, seedY, boundarySize: r, filledPixels: points.length, boundaryPixels: boundaryPoints.length }
        };
    },

    // ... (UI helper functions below remain the same)
};