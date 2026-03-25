/**
 * Cohen–Sutherland Line Clipping Algorithm
 * Efficiently clips a line segment to a rectangular window
 * using region codes (outcodes).
 */

const CohenSutherlandAlgorithm = {
    name: 'Cohen–Sutherland Line Clipping',

    // Region code bit masks
    INSIDE: 0, // 0000
    LEFT:   1, // 0001
    RIGHT:  2, // 0010
    BOTTOM: 4, // 0100
    TOP:    8, // 1000

    /**
     * Compute the region code for a point relative to the clip window
     */
    computeCode(x, y, xMin, yMin, xMax, yMax) {
        let code = this.INSIDE;
        if (x < xMin) code |= this.LEFT;
        else if (x > xMax) code |= this.RIGHT;
        if (y < yMin) code |= this.BOTTOM;
        else if (y > yMax) code |= this.TOP;
        return code;
    },

    /**
     * Format a 4-bit outcode as a binary string
     */
    formatCode(code) {
        return code.toString(2).padStart(4, '0');
    },

    /**
     * Run the Cohen-Sutherland algorithm
     * @param {number} x1 - Line start X
     * @param {number} y1 - Line start Y
     * @param {number} x2 - Line end X
     * @param {number} y2 - Line end Y
     * @param {number} xMin - Window left
     * @param {number} yMin - Window bottom
     * @param {number} xMax - Window right
     * @param {number} yMax - Window top
     * @returns {Object}
     */
    calculate(x1, y1, x2, y2, xMin, yMin, xMax, yMax) {
        xMin = xMin ?? -5;
        yMin = yMin ?? -5;
        xMax = xMax ?? 5;
        yMax = yMax ?? 5;

        const steps = [];
        const originalLine = { x1, y1, x2, y2 };
        const clipWindow = { xMin, yMin, xMax, yMax };

        let code1 = this.computeCode(x1, y1, xMin, yMin, xMax, yMax);
        let code2 = this.computeCode(x2, y2, xMin, yMin, xMax, yMax);
        let accept = false;
        let stepNum = 0;

        steps.push({
            step: stepNum++,
            x1: x1.toFixed(2), y1: y1.toFixed(2),
            x2: x2.toFixed(2), y2: y2.toFixed(2),
            code1: this.formatCode(code1),
            code2: this.formatCode(code2),
            action: 'Initial outcodes'
        });

        while (true) {
            if (!(code1 | code2)) {
                // Both inside – trivially accept
                accept = true;
                steps.push({
                    step: stepNum++,
                    x1: x1.toFixed(2), y1: y1.toFixed(2),
                    x2: x2.toFixed(2), y2: y2.toFixed(2),
                    code1: this.formatCode(code1),
                    code2: this.formatCode(code2),
                    action: 'Trivially ACCEPTED'
                });
                break;
            } else if (code1 & code2) {
                // Both in same outside region – trivially reject
                steps.push({
                    step: stepNum++,
                    x1: x1.toFixed(2), y1: y1.toFixed(2),
                    x2: x2.toFixed(2), y2: y2.toFixed(2),
                    code1: this.formatCode(code1),
                    code2: this.formatCode(code2),
                    action: 'Trivially REJECTED'
                });
                break;
            } else {
                // Needs clipping
                const codeOut = code1 !== 0 ? code1 : code2;
                let x, y, region;

                if (codeOut & this.TOP) {
                    x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1);
                    y = yMax;
                    region = 'TOP';
                } else if (codeOut & this.BOTTOM) {
                    x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1);
                    y = yMin;
                    region = 'BOTTOM';
                } else if (codeOut & this.RIGHT) {
                    y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1);
                    x = xMax;
                    region = 'RIGHT';
                } else {
                    y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1);
                    x = xMin;
                    region = 'LEFT';
                }

                if (codeOut === code1) {
                    x1 = x; y1 = y;
                    code1 = this.computeCode(x1, y1, xMin, yMin, xMax, yMax);
                } else {
                    x2 = x; y2 = y;
                    code2 = this.computeCode(x2, y2, xMin, yMin, xMax, yMax);
                }

                steps.push({
                    step: stepNum++,
                    x1: x1.toFixed(2), y1: y1.toFixed(2),
                    x2: x2.toFixed(2), y2: y2.toFixed(2),
                    code1: this.formatCode(code1),
                    code2: this.formatCode(code2),
                    action: `Clip ${region} edge`
                });
            }

            if (stepNum > 20) break; // safety limit
        }

        // Build points for visualisation
        const points = [];
        // Window border pixels
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
            accept,
            clippedLine: accept ? { x1, y1, x2, y2 } : null,
            originalLine,
            clipWindow,
            metadata: {
                accepted: accept,
                iterations: stepNum,
                windowSize: `[${xMin},${yMin}] to [${xMax},${yMax}]`
            }
        };
    },

    getTableHeaders() {
        return ['Step', 'X₁,Y₁', 'X₂,Y₂', 'Code₁', 'Code₂', 'Action'];
    },

    formatStep(step) {
        return [
            step.step,
            `${step.x1}, ${step.y1}`,
            `${step.x2}, ${step.y2}`,
            step.code1,
            step.code2,
            step.action
        ];
    },

    getDescription() {
        return `
            <h3>Cohen–Sutherland Clipping</h3>
            <p>Clips a line to a rectangular window using 4-bit region/outcodes for each endpoint to quickly accept or reject, then clips against boundary edges.</p>
            <div class="formula">
                <code>Outcode = TBRL (Top, Bottom, Right, Left)</code>
                <code>code₁ | code₂ == 0 → Accept</code>
                <code>code₁ & code₂ ≠ 0 → Reject</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.CohenSutherlandAlgorithm = CohenSutherlandAlgorithm;
}
