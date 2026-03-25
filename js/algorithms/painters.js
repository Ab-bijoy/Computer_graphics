/**
 * Painter's Algorithm
 * Renders polygons in back-to-front order (farthest first)
 * so that closer polygons naturally overwrite farther ones.
 */

const PaintersAlgorithm = {
    name: "Painter's Algorithm",

    /**
     * Run the Painter's Algorithm on a predefined 3D scene
     * @param {number} sceneId - Scene index
     * @returns {Object}
     */
    calculate(sceneId) {
        sceneId = sceneId ?? 0;
        const scene = this.getScene();
        const steps = [];

        // Calculate average Z (depth) for each polygon
        const polysWithDepth = scene.polygons.map((poly, idx) => {
            const avgZ = poly.vertices.reduce((sum, v) => sum + v.z, 0) / poly.vertices.length;
            return { ...poly, avgZ, originalIndex: idx };
        });

        // Sort by depth: farthest first (highest Z = farthest)
        const sorted = [...polysWithDepth].sort((a, b) => b.avgZ - a.avgZ);

        // Record sorting steps
        steps.push({
            step: 0,
            action: 'Calculate average depths',
            details: polysWithDepth.map(p => `${p.name}: z̄=${p.avgZ.toFixed(2)}`).join(', '),
            polygon: '—',
            depth: '—',
            order: '—'
        });

        sorted.forEach((poly, renderOrder) => {
            steps.push({
                step: renderOrder + 1,
                action: `Render #${renderOrder + 1}`,
                polygon: poly.name,
                depth: poly.avgZ.toFixed(2),
                order: `${renderOrder + 1} of ${sorted.length}`,
                details: renderOrder === sorted.length - 1 ? 'Closest — rendered last (on top)' : 'Farther — rendered first (behind)'
            });
        });

        // Rasterize in sorted order to build points
        const points = [];
        const rendered = {};

        sorted.forEach((poly, renderOrder) => {
            const pixels = this.rasterizePolygon(poly.vertices);
            pixels.forEach(pixel => {
                const key = `${pixel.x},${pixel.y}`;
                rendered[key] = { polyIndex: renderOrder, polygon: poly.name };
                points.push({ x: pixel.x, y: pixel.y, type: 'painter', polyIndex: renderOrder, polygon: poly.name });
            });
        });

        // Deduplicate: keep only the last-rendered pixel at each position
        const finalPoints = [];
        const seen = new Set();
        for (let i = points.length - 1; i >= 0; i--) {
            const key = `${points[i].x},${points[i].y}`;
            if (!seen.has(key)) {
                seen.add(key);
                finalPoints.push(points[i]);
            }
        }

        return {
            points: finalPoints.reverse(),
            steps,
            sortedOrder: sorted.map(p => p.name),
            metadata: {
                polygons: scene.polygons.length,
                renderOrder: sorted.map(p => p.name).join(' → '),
                totalPixels: finalPoints.length
            }
        };
    },

    getScene() {
        return {
            name: 'Layered Triangles',
            polygons: [
                {
                    name: 'Red △',
                    vertices: [
                        { x: -6, y: -4, z: 3 },
                        { x: 0, y: 6, z: 3 },
                        { x: 6, y: -4, z: 3 }
                    ],
                    color: '#ef4444'
                },
                {
                    name: 'Blue △',
                    vertices: [
                        { x: -4, y: -5, z: 6 },
                        { x: 2, y: 5, z: 6 },
                        { x: 8, y: -5, z: 6 }
                    ],
                    color: '#3b82f6'
                },
                {
                    name: 'Green △',
                    vertices: [
                        { x: -7, y: -2, z: 9 },
                        { x: -1, y: 7, z: 9 },
                        { x: 5, y: -2, z: 9 }
                    ],
                    color: '#10b981'
                }
            ]
        };
    },

    /**
     * Rasterize a triangle (2D projection using x,y, ignoring z)
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

    getTableHeaders() {
        return ['Step', 'Action', 'Polygon', 'Avg Z', 'Order'];
    },

    formatStep(step) {
        return [step.step, step.action, step.polygon, step.depth, step.order];
    },

    getDescription() {
        return `
            <h3>Painter's Algorithm</h3>
            <p>Sorts polygons by their average depth (farthest first) and renders them back-to-front, allowing closer polygons to overwrite farther ones naturally — like a painter painting layers.</p>
            <div class="formula">
                <code>1. Calculate avg-Z for each polygon</code>
                <code>2. Sort: farthest (largest Z) first</code>
                <code>3. Render in sorted order</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.PaintersAlgorithm = PaintersAlgorithm;
}
