/**
 * Bresenham's Line Drawing Algorithm
 * Uses only integer arithmetic for efficient line drawing
 */

const BresenhamAlgorithm = {
    name: "Bresenham's Line Drawing",

    /**
     * Calculate all points using Bresenham's algorithm
     * @param {number} x1 - Start x coordinate
     * @param {number} y1 - Start y coordinate
     * @param {number} x2 - End x coordinate
     * @param {number} y2 - End y coordinate
     * @returns {Object} - Points array and calculation steps
     */
    calculate(x1, y1, x2, y2) {
        const points = [];
        const steps = [];

        // Calculate absolute differences
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);

        // Determine step direction
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;

        // Determine if slope is steep
        const steep = dy > dx;

        if (steep) {
            // Swap dx and dy for steep lines
            [dx, dy] = [dy, dx];
        }

        // Initial decision parameter
        let p = 2 * dy - dx;
        const p1 = 2 * dy;          // Increment when p < 0
        const p2 = 2 * (dy - dx);   // Increment when p >= 0

        let x = x1;
        let y = y1;

        // Add starting point
        points.push({ x, y });
        steps.push({
            step: 0,
            x,
            y,
            p: p,
            decision: 'Start'
        });

        // Calculate subsequent points
        for (let i = 1; i <= dx; i++) {
            const prevP = p;
            let decision;

            if (steep) {
                // For steep lines, always increment y
                y += sy;
                if (p < 0) {
                    p += p1;
                    decision = `p=${prevP} < 0 → p += ${p1}`;
                } else {
                    x += sx;
                    p += p2;
                    decision = `p=${prevP} ≥ 0 → x += ${sx}, p += ${p2}`;
                }
            } else {
                // For gentle lines, always increment x
                x += sx;
                if (p < 0) {
                    p += p1;
                    decision = `p=${prevP} < 0 → p += ${p1}`;
                } else {
                    y += sy;
                    p += p2;
                    decision = `p=${prevP} ≥ 0 → y += ${sy}, p += ${p2}`;
                }
            }

            points.push({ x, y });
            steps.push({
                step: i,
                x,
                y,
                p,
                decision
            });
        }

        return {
            points,
            steps,
            metadata: {
                dx: Math.abs(x2 - x1),
                dy: Math.abs(y2 - y1),
                initialP: 2 * dy - dx,
                p1,
                p2,
                steep
            }
        };
    },

    /**
     * Get table headers for this algorithm
     */
    getTableHeaders() {
        return ['Step', 'X', 'Y', 'P', 'Decision'];
    },

    /**
     * Format a step for table display
     */
    formatStep(step) {
        return [
            step.step,
            step.x,
            step.y,
            step.p,
            step.decision
        ];
    },

    /**
     * Get algorithm description HTML
     */
    getDescription() {
        return `
            <h3>Bresenham's Algorithm</h3>
            <p>Uses only integer arithmetic by tracking a decision parameter to determine the closest pixel. More efficient than DDA.</p>
            <div class="formula">
                <code>P<sub>initial</sub> = 2Δy - Δx</code>
                <code>If P < 0: P<sub>next</sub> = P + 2Δy</code>
                <code>If P ≥ 0: P<sub>next</sub> = P + 2(Δy - Δx)</code>
            </div>
        `;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BresenhamAlgorithm = BresenhamAlgorithm;
}
