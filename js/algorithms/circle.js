/**
 * Midpoint Circle Drawing Algorithm
 * Uses 8-way symmetry and integer arithmetic
 */

const MidpointCircleAlgorithm = {
    name: 'Midpoint Circle Drawing',

    /**
     * Calculate all points using Midpoint Circle algorithm
     * @param {number} cx - Center x coordinate
     * @param {number} cy - Center y coordinate
     * @param {number} radius - Circle radius
     * @returns {Object} - Points array and calculation steps
     */
    calculate(cx, cy, radius) {
        const points = [];
        const steps = [];
        const octantPoints = []; // Points in first octant only

        let x = 0;
        let y = radius;

        // Initial decision parameter
        let p = 1 - radius;

        // Add initial point in all octants
        this.plotSymmetricPoints(cx, cy, x, y, points);
        octantPoints.push({ x, y });

        steps.push({
            step: 0,
            x,
            y,
            p,
            decision: 'Start',
            symmetricPoints: this.getSymmetricCoords(cx, cy, x, y)
        });

        let stepNum = 1;

        // Continue until x >= y (first octant only)
        while (x < y) {
            x++;
            const prevP = p;
            let decision;

            if (p < 0) {
                // Midpoint is inside circle, choose E pixel
                p = p + 2 * x + 1;
                decision = `p=${prevP} < 0 → Choose E, p = p + 2x + 1`;
            } else {
                // Midpoint is outside circle, choose SE pixel
                y--;
                p = p + 2 * x + 1 - 2 * y;
                decision = `p=${prevP} ≥ 0 → Choose SE, y--, p = p + 2x + 1 - 2y`;
            }

            // Plot all 8 symmetric points
            this.plotSymmetricPoints(cx, cy, x, y, points);
            octantPoints.push({ x, y });

            steps.push({
                step: stepNum++,
                x,
                y,
                p,
                decision,
                symmetricPoints: this.getSymmetricCoords(cx, cy, x, y)
            });
        }

        return {
            points,
            steps,
            octantPoints,
            metadata: {
                center: { x: cx, y: cy },
                radius,
                initialP: 1 - radius,
                totalPoints: points.length,
                octantSteps: octantPoints.length
            }
        };
    },

    /**
     * Get symmetric coordinates for 8 octants
     */
    getSymmetricCoords(cx, cy, x, y) {
        return [
            { x: cx + x, y: cy + y },
            { x: cx - x, y: cy + y },
            { x: cx + x, y: cy - y },
            { x: cx - x, y: cy - y },
            { x: cx + y, y: cy + x },
            { x: cx - y, y: cy + x },
            { x: cx + y, y: cy - x },
            { x: cx - y, y: cy - x }
        ];
    },

    /**
     * Plot all 8 symmetric points
     */
    plotSymmetricPoints(cx, cy, x, y, points) {
        const coords = this.getSymmetricCoords(cx, cy, x, y);

        // Use Set to avoid duplicate points (when x=0, y=0, or x=y)
        const seen = new Set();

        coords.forEach(coord => {
            const key = `${coord.x},${coord.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                points.push(coord);
            }
        });
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
            step.decision.split('→')[0].trim()
        ];
    },

    /**
     * Get algorithm description HTML
     */
    getDescription() {
        return `
            <h3>Midpoint Circle Algorithm</h3>
            <p>Uses the midpoint between two candidate pixels to decide which is closer to the true circle. Exploits 8-way symmetry for efficiency.</p>
            <div class="formula">
                <code>P<sub>initial</sub> = 1 - R</code>
                <code>If P < 0: P<sub>next</sub> = P + 2x + 1</code>
                <code>If P ≥ 0: y--, P<sub>next</sub> = P + 2x + 1 - 2y</code>
            </div>
        `;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MidpointCircleAlgorithm = MidpointCircleAlgorithm;
}
