/**
 * 2D Transformations Algorithm
 * Handles Translation, Scaling, Rotation, Shearing, and Reflection.
 */

const Transform2DAlgorithm = {
    name: '2D Transformations',

    calculate(vertices, type, params) {
        const steps = [];
        const transformedPolygon = [];
        let stepNum = 0;

        // Helper to format numbers nicely
        const format = (num) => Math.round(num * 100) / 100;

        vertices.forEach(v => {
            let nx = v.x;
            let ny = v.y;
            let action = '';
            let matrix = '';

            switch (type) {
                case 'translate':
                    nx = v.x + params.tx;
                    ny = v.y + params.ty;
                    action = `Translated by (${params.tx}, ${params.ty})`;
                    matrix = `[x+tx, y+ty]`;
                    break;
                case 'scale':
                    nx = v.x * params.sx;
                    ny = v.y * params.sy;
                    action = `Scaled by (${params.sx}, ${params.sy})`;
                    matrix = `[x*sx, y*sy]`;
                    break;
                case 'rotate':
                    const rad = params.angle * (Math.PI / 180);
                    const cos = Math.cos(rad);
                    const sin = Math.sin(rad);
                    nx = v.x * cos - v.y * sin;
                    ny = v.x * sin + v.y * cos;
                    action = `Rotated by ${params.angle}°`;
                    matrix = `[x*cos-y*sin, x*sin+y*cos]`;
                    break;
                case 'shear':
                    nx = v.x + params.shx * v.y;
                    ny = v.y + params.shy * v.x;
                    action = `Sheared by (${params.shx}, ${params.shy})`;
                    matrix = `[x+shx*y, y+shy*x]`;
                    break;
                case 'reflect':
                    if (params.axis === 'x') { nx = v.x; ny = -v.y; action = 'Reflect across X-axis'; }
                    else if (params.axis === 'y') { nx = -v.x; ny = v.y; action = 'Reflect across Y-axis'; }
                    else if (params.axis === 'origin') { nx = -v.x; ny = -v.y; action = 'Reflect across Origin'; }
                    else if (params.axis === 'xy') { nx = v.y; ny = v.x; action = 'Reflect across Y=X'; }
                    matrix = `Varies by axis`;
                    break;
            }

            nx = format(nx);
            ny = format(ny);
            
            transformedPolygon.push({ x: nx, y: ny });

            steps.push({
                step: stepNum++,
                orig: `(${v.x}, ${v.y})`,
                newPoint: `(${nx}, ${ny})`,
                action: action,
                formula: matrix
            });
        });

        return {
            originalPolygon: vertices,
            transformedPolygon: transformedPolygon,
            steps: steps,
            points: [] // Empty because we draw polygons, not pixel-by-pixel for this one
        };
    },

    getTableHeaders() {
        return ['Step', 'Original (x,y)', 'Transformed (x,y)', 'Formula', 'Action'];
    },

    formatStep(step) {
        return [step.step, step.orig, step.newPoint, step.formula, step.action];
    },

    getDescription() {
        return `
            <h3>2D Transformations</h3>
            <p>Applies mathematical operations to change the position, size, orientation, or shape of an object.</p>
            <ul style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 1.5rem; margin-top: 0.5rem;">
                <li><strong>Translate:</strong> Shifts object by adding to coordinates.</li>
                <li><strong>Scale:</strong> Resizes object by multiplying coordinates.</li>
                <li><strong>Rotate:</strong> Tilts object using Trigonometry (Sin/Cos).</li>
                <li><strong>Shear:</strong> Skews the object along an axis.</li>
                <li><strong>Reflect:</strong> Flips the object across a defined axis.</li>
            </ul>
        `;
    }
};

if (typeof window !== 'undefined') window.Transform2DAlgorithm = Transform2DAlgorithm;