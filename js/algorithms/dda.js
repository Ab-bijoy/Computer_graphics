/**
 * DDA (Digital Differential Analyzer) Line Drawing Algorithm
 * Uses floating-point arithmetic to calculate intermediate points
 */

const DDAAlgorithm = {
    name: 'DDA Line Drawing',
    
    /**
     * Calculate all points using DDA algorithm
     * @param {number} x1 - Start x coordinate
     * @param {number} y1 - Start y coordinate
     * @param {number} x2 - End x coordinate
     * @param {number} y2 - End y coordinate
     * @returns {Object} - Points array and calculation steps
     */
    calculate(x1, y1, x2, y2) {
        const points = [];
        const steps = [];
        
        // Calculate differences
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Determine number of steps
        const stepsCount = Math.max(Math.abs(dx), Math.abs(dy));
        
        // Calculate increment for each step
        const xIncrement = dx / stepsCount;
        const yIncrement = dy / stepsCount;
        
        // Initial values
        let x = x1;
        let y = y1;
        
        // Add starting point
        points.push({ x: Math.round(x), y: Math.round(y) });
        steps.push({
            step: 0,
            xFloat: x.toFixed(2),
            yFloat: y.toFixed(2),
            xPlot: Math.round(x),
            yPlot: Math.round(y)
        });
        
        // Calculate subsequent points
        for (let i = 1; i <= stepsCount; i++) {
            x += xIncrement;
            y += yIncrement;
            
            const xRound = Math.round(x);
            const yRound = Math.round(y);
            
            points.push({ x: xRound, y: yRound });
            steps.push({
                step: i,
                xFloat: x.toFixed(2),
                yFloat: y.toFixed(2),
                xPlot: xRound,
                yPlot: yRound
            });
        }
        
        return {
            points,
            steps,
            metadata: {
                dx,
                dy,
                stepsCount,
                xIncrement: xIncrement.toFixed(4),
                yIncrement: yIncrement.toFixed(4)
            }
        };
    },
    
    /**
     * Get table headers for this algorithm
     */
    getTableHeaders() {
        return ['Step', 'X (float)', 'Y (float)', 'X (plot)', 'Y (plot)'];
    },
    
    /**
     * Format a step for table display
     */
    formatStep(step) {
        return [
            step.step,
            step.xFloat,
            step.yFloat,
            step.xPlot,
            step.yPlot
        ];
    },
    
    /**
     * Get algorithm description HTML
     */
    getDescription() {
        return `
            <h3>DDA Algorithm</h3>
            <p>Digital Differential Analyzer uses floating-point arithmetic to calculate intermediate points of a line by incrementing coordinates uniformly.</p>
            <div class="formula">
                <code>Steps = max(|Δx|, |Δy|)</code>
                <code>x<sub>i+1</sub> = x<sub>i</sub> + Δx/Steps</code>
                <code>y<sub>i+1</sub> = y<sub>i</sub> + Δy/Steps</code>
            </div>
        `;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DDAAlgorithm = DDAAlgorithm;
}
