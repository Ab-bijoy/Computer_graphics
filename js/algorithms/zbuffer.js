/**
 * Z-Buffer (Depth Buffer) Algorithm
 * Resolves visibility by maintaining a depth value per pixel
 * and only rendering the closest surface fragment.
 */

const ZBufferAlgorithm = {
    name: 'Z-Buffer Algorithm',

    /**
     * Generate overlapping polygons projected to 2D with depth
     * @param {number} sceneId - Predefined scene index (0-2)
     * @returns {Object}
     */
    calculate(sceneId) {
        sceneId = sceneId ?? 0;
        const scenes = this.getScenes();
        const scene = scenes[Math.min(sceneId, scenes.length - 1)];

        const steps = [];
        const zBuffer = {};  // key "x,y" → depth
        const colorBuffer = {}; // key "x,y" → polygon name
        const points = [];
        let stepNum = 0;

        // Process each polygon
        scene.polygons.forEach((poly, polyIdx) => {
            const pixels = this.rasterizePolygon(poly.vertices);

            pixels.forEach(pixel => {
                const key = `${pixel.x},${pixel.y}`;
                const z = this.interpolateZ(pixel, poly);
                const prevZ = zBuffer[key] ?? Infinity;
                const prevPoly = colorBuffer[key] ?? '—';

                if (z < prevZ) {
                    zBuffer[key] = z;
                    colorBuffer[key] = poly.name;

                    steps.push({
                        step: stepNum++,
                        x: pixel.x,
                        y: pixel.y,
                        polygon: poly.name,
                        zNew: z.toFixed(2),
                        zOld: prevZ === Infinity ? '∞' : prevZ.toFixed(2),
                        action: prevZ === Infinity ? 'Write (empty)' : `Overwrite (${prevPoly})`
                    });
                } else {
                    steps.push({
                        step: stepNum++,
                        x: pixel.x,
                        y: pixel.y,
                        polygon: poly.name,
                        zNew: z.toFixed(2),
                        zOld: prevZ.toFixed(2),
                        action: `Skip (behind ${prevPoly})`
                    });
                }
            });
        });

        // Build visible points from colorBuffer
        const polyColors = {};
        scene.polygons.forEach((p, i) => { polyColors[p.name] = i; });

        Object.keys(colorBuffer).forEach(key => {
            const [x, y] = key.split(',').map(Number);
            points.push({ x, y, type: 'zbuf', polygon: colorBuffer[key], polyIndex: polyColors[colorBuffer[key]] });
        });

        return {
            points,
            steps: steps.slice(0, 200), // cap for table display
            metadata: {
                polygons: scene.polygons.length,
                totalPixels: Object.keys(colorBuffer).length,
                totalTests: stepNum,
                sceneName: scene.name
            }
        };
    },

    /**
     * Predefined scenes with overlapping polygons
     */
    getScenes() {
        return [
            {
                name: 'Overlapping Triangles',
                polygons: [
                    {
                        name: 'Red △',
                        vertices: [
                            { x: -6, y: -4, z: 5 },
                            { x: 0, y: 6, z: 5 },
                            { x: 6, y: -4, z: 5 }
                        ]
                    },
                    {
                        name: 'Blue △',
                        vertices: [
                            { x: -4, y: -5, z: 3 },
                            { x: 2, y: 5, z: 3 },
                            { x: 8, y: -5, z: 7 }
                        ]
                    },
                    {
                        name: 'Green △',
                        vertices: [
                            { x: -7, y: -2, z: 4 },
                            { x: -1, y: 7, z: 6 },
                            { x: 5, y: -2, z: 2 }
                        ]
                    }
                ]
            }
        ];
    },

    /**
     * Rasterize a triangle into pixel coordinates using scanline
     */
    rasterizePolygon(verts) {
        const pixels = [];
        const yMin = Math.floor(Math.min(...verts.map(v => v.y)));
        const yMax = Math.ceil(Math.max(...verts.map(v => v.y)));

        for (let y = yMin; y <= yMax; y++) {
            const intersections = [];
            for (let i = 0; i < verts.length; i++) {
                const a = verts[i];
                const b = verts[(i + 1) % verts.length];
                if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
                    const t = (y - a.y) / (b.y - a.y);
                    intersections.push(Math.round(a.x + t * (b.x - a.x)));
                }
            }
            intersections.sort((a, b) => a - b);
            for (let i = 0; i < intersections.length - 1; i += 2) {
                for (let x = intersections[i]; x <= intersections[i + 1]; x++) {
                    pixels.push({ x, y });
                }
            }
        }
        return pixels;
    },

    /**
     * Interpolate Z for a pixel within a triangle (barycentric-like average)
     */
    interpolateZ(pixel, poly) {
        const verts = poly.vertices;
        // Simple plane equation z-interpolation
        const v0 = verts[0], v1 = verts[1], v2 = verts[2];
        const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
        if (Math.abs(denom) < 0.001) return (v0.z + v1.z + v2.z) / 3;
        const w0 = ((v1.y - v2.y) * (pixel.x - v2.x) + (v2.x - v1.x) * (pixel.y - v2.y)) / denom;
        const w1 = ((v2.y - v0.y) * (pixel.x - v2.x) + (v0.x - v2.x) * (pixel.y - v2.y)) / denom;
        const w2 = 1 - w0 - w1;
        return w0 * v0.z + w1 * v1.z + w2 * v2.z;
    },

    getTableHeaders() {
        return ['Step', 'X', 'Y', 'Polygon', 'Z-new', 'Z-old', 'Action'];
    },

    formatStep(step) {
        return [step.step, step.x, step.y, step.polygon, step.zNew, step.zOld, step.action];
    },

    getDescription() {
        return `
            <h3>Z-Buffer Algorithm</h3>
            <p>Maintains a depth buffer initialised to ∞. For each pixel of each polygon, if its depth is less than the stored value, it overwrites both colour and depth buffers.</p>
            <div class="formula">
                <code>Initialise: Z-buffer[x,y] = ∞</code>
                <code>For each polygon pixel (x,y,z):</code>
                <code>  If z < Z-buffer[x,y] → update</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.ZBufferAlgorithm = ZBufferAlgorithm;
}
