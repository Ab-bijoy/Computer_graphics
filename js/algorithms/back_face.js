/**
 * Back Face Detection Algorithm
 * Determines visibility of polygon faces using the dot product
 * of the face normal with the view direction vector.
 */

const BackFaceAlgorithm = {
    name: 'Back Face Detection',

    /**
     * Predefined 3D scene: a cube
     */
    getCubeScene() {
        const s = 4;
        const vertices = [
            { x: -s, y: -s, z: -s }, // 0: front-bottom-left
            { x:  s, y: -s, z: -s }, // 1: front-bottom-right
            { x:  s, y:  s, z: -s }, // 2: front-top-right
            { x: -s, y:  s, z: -s }, // 3: front-top-left
            { x: -s, y: -s, z:  s }, // 4: back-bottom-left
            { x:  s, y: -s, z:  s }, // 5: back-bottom-right
            { x:  s, y:  s, z:  s }, // 6: back-top-right
            { x: -s, y:  s, z:  s }  // 7: back-top-left
        ];

        // Faces defined with outward normals (vertices in CCW order when viewed from outside)
        const faces = [
            { name: 'Front',  verts: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 } },
            { name: 'Back',   verts: [5, 4, 7, 6], normal: { x: 0, y: 0, z: 1 } },
            { name: 'Left',   verts: [4, 0, 3, 7], normal: { x: -1, y: 0, z: 0 } },
            { name: 'Right',  verts: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 } },
            { name: 'Top',    verts: [3, 2, 6, 7], normal: { x: 0, y: 1, z: 0 } },
            { name: 'Bottom', verts: [4, 5, 1, 0], normal: { x: 0, y: -1, z: 0 } }
        ];

        return { vertices, faces };
    },

    /**
     * Run back-face detection
     * @param {number} vx - View direction X
     * @param {number} vy - View direction Y
     * @param {number} vz - View direction Z
     * @returns {Object}
     */
    calculate(vx, vy, vz) {
        vx = vx ?? 0;
        vy = vy ?? 0;
        vz = vz ?? -1;

        const scene = this.getCubeScene();
        const steps = [];
        const visibleFaces = [];
        const hiddenFaces = [];

        scene.faces.forEach((face, index) => {
            const n = face.normal;
            const dot = n.x * vx + n.y * vy + n.z * vz;
            const visible = dot < 0;  // Normal pointing away from viewer = visible

            steps.push({
                step: index,
                face: face.name,
                normal: `(${n.x}, ${n.y}, ${n.z})`,
                viewDir: `(${vx}, ${vy}, ${vz})`,
                dotProduct: dot.toFixed(2),
                result: visible ? '✅ Visible' : '❌ Hidden'
            });

            if (visible) {
                visibleFaces.push({ ...face, index });
            } else {
                hiddenFaces.push({ ...face, index });
            }
        });

        // Project visible faces to 2D for canvas display (simple orthographic)
        const points = [];
        const projectedFaces = [];

        visibleFaces.forEach(face => {
            const projected = face.verts.map(vi => {
                const v = scene.vertices[vi];
                return { x: Math.round(v.x + v.z * 0.35), y: Math.round(v.y + v.z * 0.35) };
            });
            projectedFaces.push({ name: face.name, vertices: projected });

            // Plot edges
            for (let i = 0; i < projected.length; i++) {
                const a = projected[i];
                const b = projected[(i + 1) % projected.length];
                this.bresenhamLine(a.x, a.y, b.x, b.y).forEach(p => {
                    points.push({ ...p, type: 'edge', face: face.name });
                });
            }
        });

        return {
            points,
            steps,
            visibleFaces: visibleFaces.map(f => f.name),
            hiddenFaces: hiddenFaces.map(f => f.name),
            projectedFaces,
            metadata: {
                totalFaces: scene.faces.length,
                visibleCount: visibleFaces.length,
                hiddenCount: hiddenFaces.length,
                viewDirection: `(${vx}, ${vy}, ${vz})`
            }
        };
    },

    /**
     * Simple Bresenham line for edge drawing
     */
    bresenhamLine(x1, y1, x2, y2) {
        const pts = [];
        let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
        let sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        let x = x1, y = y1;

        while (true) {
            pts.push({ x, y });
            if (x === x2 && y === y2) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x += sx; }
            if (e2 < dx)  { err += dx; y += sy; }
        }
        return pts;
    },

    getTableHeaders() {
        return ['Face', 'Normal', 'View Dir', 'N·V', 'Result'];
    },

    formatStep(step) {
        return [step.face, step.normal, step.viewDir, step.dotProduct, step.result];
    },

    getDescription() {
        return `
            <h3>Back Face Detection</h3>
            <p>Determines face visibility by computing the dot product of each polygon's outward normal with the view direction. If N·V < 0, the face is visible.</p>
            <div class="formula">
                <code>N·V = Nₓ·Vₓ + Nᵧ·Vᵧ + N_z·V_z</code>
                <code>If N·V < 0 → Face is visible</code>
                <code>If N·V ≥ 0 → Face is hidden (back face)</code>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.BackFaceAlgorithm = BackFaceAlgorithm;
}
