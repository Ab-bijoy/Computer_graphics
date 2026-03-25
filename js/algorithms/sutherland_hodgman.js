/**
 * Sutherland–Hodgman Polygon Clipping Algorithm
 * Clips a polygon against each edge of a rectangular clip window sequentially.
 */

const SutherlandHodgmanAlgorithm = {
    name: 'Sutherland–Hodgman Polygon Clipping',

    /**
     * Compute intersection of edge from p1 to p2 with a clip boundary
     */
    intersect(p1, p2, edge, value) {
        let x, y;
        if (edge === 'left' || edge === 'right') {
            x = value;
            y = p1.y + (p2.y - p1.y) * (value - p1.x) / (p2.x - p1.x);
        } else {
            y = value;
            x = p1.x + (p2.x - p1.x) * (value - p1.y) / (p2.y - p1.y);
        }
        return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
    },

    /**
     * Check if point is inside relative to clip edge
     */
    isInside(p, edge, value) {
        switch (edge) {
            case 'left':   return p.x >= value;
            case 'right':  return p.x <= value;
            case 'bottom': return p.y >= value;
            case 'top':    return p.y <= value;
        }
    },

    /**
     * Clip polygon against one edge
     */
    clipEdge(polygon, edge, value, steps, stepNum) {
        const output = [];
        const n = polygon.length;
        if (n === 0) return { output, stepNum };

        for (let i = 0; i < n; i++) {
            const current = polygon[i];
            const next = polygon[(i + 1) % n];
            const currInside = this.isInside(current, edge, value);
            const nextInside = this.isInside(next, edge, value);

            let action = '';

            if (currInside && nextInside) {
                // Both inside → add next
                output.push(next);
                action = `Both inside → add (${next.x}, ${next.y})`;
            } else if (currInside && !nextInside) {
                // Leaving → add intersection
                const inter = this.intersect(current, next, edge, value);
                output.push(inter);
                action = `Leaving → add intersection (${inter.x}, ${inter.y})`;
            } else if (!currInside && nextInside) {
                // Entering → add intersection + next
                const inter = this.intersect(current, next, edge, value);
                output.push(inter);
                output.push(next);
                action = `Entering → add (${inter.x}, ${inter.y}) & (${next.x}, ${next.y})`;
            } else {
                // Both outside → add nothing
                action = 'Both outside → skip';
            }

            steps.push({
                step: stepNum++,
                edge: edge.toUpperCase(),
                current: `(${current.x}, ${current.y})`,
                next: `(${next.x}, ${next.y})`,
                action
            });
        }

        return { output, stepNum };
    },

    /**
     * Run the algorithm
     * @param {Array} polygon - Array of {x,y} vertices
     * @param {number} xMin
     * @param {number} yMin
     * @param {number} xMax
     * @param {number} yMax
     * @returns {Object}
     */
    calculate(polygon, xMin, yMin, xMax, yMax) {
        xMin = xMin ?? -5;
        yMin = yMin ?? -5;
        xMax = xMax ?? 5;
        yMax = yMax ?? 5;

        // Default polygon: a triangle that extends outside
        if (!polygon || polygon.length === 0) {
            polygon = [
                { x: -8, y: 0 },
                { x: 0, y: 8 },
                { x: 8, y: -3 }
            ];
        }

        const steps = [];
        let stepNum = 0;
        const originalPolygon = [...polygon];
        let clipped = [...polygon];

        // Clip against each edge sequentially
        const edges = [
            { edge: 'left',   value: xMin },
            { edge: 'right',  value: xMax },
            { edge: 'bottom', value: yMin },
            { edge: 'top',    value: yMax }
        ];

        for (const { edge, value } of edges) {
            const result = this.clipEdge(clipped, edge, value, steps, stepNum);
            clipped = result.output;
            stepNum = result.stepNum;
        }

        // Build display points: clip window border
        const points = [];
        for (let x = xMin; x <= xMax; x++) {
            points.push({ x, y: yMin, type: 'window' });
            points.push({ x, y: yMax, type: 'window' });
        }
        for (let y = yMin + 1; y < yMax; y++) {
            points.push({ x: xMin, y, type: 'window' });
            points.push({ x: xMax, y, type: 'window' });
        }

        return {
            points,
            steps,
            originalPolygon,
            clippedPolygon: clipped,
            clipWindow: { xMin, yMin, xMax, yMax },
            metadata: {
                originalVertices: originalPolygon.length,
                clippedVertices: clipped.length,
                windowSize: `[${xMin},${yMin}] to [${xMax},${yMax}]`
            }
        };
    },

    getTableHeaders() {
        return ['Step', 'Edge', 'Current', 'Next', 'Action'];
    },

    formatStep(step) {
        return [step.step, step.edge, step.current, step.next, step.action];
    },

    getDescription() {
        return `
            <h3>Sutherland–Hodgman Clipping</h3>
            <p>Clips a polygon by processing it against each clip-window edge (left, right, bottom, top) sequentially. Each edge outputs a new vertex list.</p>
            <div class="formula">
                <code>For each window edge:</code>
                <code>  Inside→Inside: output next vertex</code>
                <code>  Inside→Outside: output intersection</code>
                <code>  Outside→Inside: output intersection + next</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.SutherlandHodgmanAlgorithm = SutherlandHodgmanAlgorithm;
}
