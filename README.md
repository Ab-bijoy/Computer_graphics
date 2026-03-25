# 🎨 Computer Graphics Algorithms Simulator

An interactive, browser-based simulator that visualizes **10 fundamental Computer Graphics algorithms** with step-by-step animation, calculation tables, and a premium dark-themed UI.

> **Open `index.html`** in any modern browser — no build step or server required.

---

## 📐 1. DDA Line Drawing Algorithm

### Concept
The **Digital Differential Analyzer (DDA)** draws a line between two endpoints by calculating intermediate pixel positions using **floating-point increments**. It determines the number of steps as `max(|Δx|, |Δy|)`, then increments both x and y by their respective fractions each step.

### Key Formulas
```
Steps = max(|Δx|, |Δy|)
x_increment = Δx / Steps
y_increment = Δy / Steps
x(i+1) = x(i) + x_increment
y(i+1) = y(i) + y_increment
```

### Example
**Input:** Line from **(2, 3)** to **(8, 6)**

```
Δx = 6,  Δy = 3,  Steps = max(6, 3) = 6
x_inc = 6/6 = 1.0,  y_inc = 3/6 = 0.5

Step 0: x=2.00, y=3.00 → Plot (2, 3)
Step 1: x=3.00, y=3.50 → Plot (3, 4)
Step 2: x=4.00, y=4.00 → Plot (4, 4)
Step 3: x=5.00, y=4.50 → Plot (5, 5)
Step 4: x=6.00, y=5.00 → Plot (6, 5)
Step 5: x=7.00, y=5.50 → Plot (7, 6)
Step 6: x=8.00, y=6.00 → Plot (8, 6)
```

**Pros:** Simple to implement.  
**Cons:** Uses floating-point arithmetic (slower than integer-only methods).

---

## 📏 2. Bresenham's Line Drawing Algorithm

### Concept
**Bresenham's algorithm** draws a line using **only integer addition and subtraction**, making it faster than DDA. It maintains a **decision parameter** `P` that determines whether the next pixel should step in one axis or both.

### Key Formulas
```
P_initial = 2Δy - Δx

If P < 0:  next P = P + 2Δy          (step x only)
If P ≥ 0:  next P = P + 2(Δy - Δx)   (step both x and y)
```

### Example
**Input:** Line from **(2, 3)** to **(8, 6)**

```
Δx = 6,  Δy = 3
P_initial = 2(3) - 6 = 0

Step 0: (2,3)  P=0
Step 1: P=0 ≥ 0 → x=3, y=4, P = 0 + 2(3-6) = -6
Step 2: P=-6 < 0 → x=4, y=4, P = -6 + 2(3) = 0
Step 3: P=0 ≥ 0 → x=5, y=5, P = 0 + 2(3-6) = -6
Step 4: P=-6 < 0 → x=6, y=5, P = -6 + 6 = 0
Step 5: P=0 ≥ 0 → x=7, y=6, P = -6
Step 6: P=-6 < 0 → x=8, y=6, P = 0
```

**Pros:** Integer-only arithmetic, very efficient.  
**Cons:** Slightly more complex logic than DDA.

---

## ⭕ 3. Midpoint Circle Drawing Algorithm

### Concept
Draws a circle by computing pixels in the **first octant** only (from 0° to 45°), then reflecting them into all **8 symmetric octants**. A decision parameter decides whether the next pixel is East (E) or South-East (SE).

### Key Formulas
```
P_initial = 1 - R

If P < 0: choose E,  P_next = P + 2x + 1
If P ≥ 0: choose SE, y--, P_next = P + 2x + 1 - 2y
```

### Example
**Input:** Circle with **center (0, 0)**, **radius = 5**

```
P_initial = 1 - 5 = -4

Step 0: (0,5)  P=-4 → E
Step 1: (1,5)  P=-1 → E
Step 2: (2,5)  P= 4 → SE, y=4
Step 3: (3,4)  P= 1 → SE, y=3
Step 4: (4,3)  → x ≥ y, stop

Each (x,y) generates 8 symmetric points:
  (x,y) (-x,y) (x,-y) (-x,-y) (y,x) (-y,x) (y,-x) (-y,-x)
```

**Total plotted:** 8 points per octant step = very efficient.

---

## 🔲 4. Boundary Fill Algorithm

### Concept
Starting from an **interior seed point**, the algorithm fills outward by visiting **4-connected neighbours** (N, S, E, W). A pixel is filled if it is **not already filled** and **not a boundary pixel**. Uses BFS/DFS traversal.

### Key Logic
```
BoundaryFill(x, y):
    if pixel(x,y) ≠ boundary_colour AND pixel(x,y) ≠ fill_colour:
        setPixel(x, y, fill_colour)
        BoundaryFill(x+1, y)   // East
        BoundaryFill(x-1, y)   // West
        BoundaryFill(x, y+1)   // North
        BoundaryFill(x, y-1)   // South
```

### Example
**Input:** Diamond boundary with vertices at (±6, 0) and (0, ±6), seed at **(0, 0)**

```
Step 0: Fill (0,0)  → push 4 neighbours
Step 1: Fill (1,0)  → push 4 neighbours
Step 2: Fill (-1,0) → push 4 neighbours
Step 3: Fill (0,1)  → push 4 neighbours
...
(boundary pixels like (6,0) are skipped)
...fills until all interior pixels covered
```

**Use case:** Filling enclosed shapes when boundary colour is known.

---

## 🪣 5. Flood Fill Algorithm

### Concept
Similar to Boundary Fill but works differently: it replaces all connected pixels of the **same target colour** with a **new colour**. This is the algorithm behind the **paint-bucket tool** in image editors.

### Key Logic
```
FloodFill(x, y, targetColour, newColour):
    if pixel(x,y) == targetColour:
        setPixel(x, y, newColour)
        FloodFill(x+1, y, ...)
        FloodFill(x-1, y, ...)
        FloodFill(x, y+1, ...)
        FloodFill(x, y-1, ...)
```

### Example
**Input:** Circular region (radius 6) of target colour, seed at **(0, 0)**

```
Step 0: (0,0) colour=target → replace with fill colour
Step 1: (1,0) colour=target → replace
Step 2: (-1,0) colour=target → replace
...
Step N: (7,0) colour=none → skip (not target colour)

Result: Entire circular region recoloured
```

**Difference from Boundary Fill:** Flood Fill checks for *target colour*, not boundary colour.

---

## 📎 6. Cohen–Sutherland Line Clipping Algorithm

### Concept
Clips a line segment against a **rectangular clip window** using **4-bit region codes (outcodes)** assigned to each endpoint. The bits represent: `Top | Bottom | Right | Left`.

### Key Logic
```
Outcode bits:  T B R L  (bit 3 to bit 0)

If code1 | code2 == 0000  → Both inside, ACCEPT
If code1 & code2 ≠ 0000  → Both in same outside region, REJECT
Otherwise                 → Clip against an edge, recompute codes
```

### Example
**Input:** Line from **(-8, -6)** to **(8, 7)**, window **[-5,-5] to [5,5]**

```
Point 1: (-8,-6) → outcode = 0101 (Bottom, Left)
Point 2: (8, 7)  → outcode = 1010 (Top, Right)

code1 & code2 = 0000 → cannot trivially reject
code1 | code2 ≠ 0000 → cannot trivially accept → clip

Iteration 1: Clip LEFT edge (x=-5) → new P1=(-5, -3.375), code=0100
Iteration 2: Clip BOTTOM edge (y=-5) → new P1=(-2.375, -5), code=0000
Iteration 3: Clip TOP edge (y=5) → new P2=(5.385, 5), code=0010
Iteration 4: Clip RIGHT edge (x=5) → new P2=(5, 4.688), code=0000

Both codes 0000 → ACCEPT clipped line (-2.375, -5) to (5, 4.688)
```

---

## 🔷 7. Sutherland–Hodgman Polygon Clipping Algorithm

### Concept
Clips a **polygon** against a rectangular window by processing it against **each window edge sequentially** (Left → Right → Bottom → Top). For each edge, it examines every consecutive pair of vertices and applies one of four rules:

### Four Cases (per edge)
| Current → Next | Action |
|----------------|--------|
| Inside → Inside | Output next vertex |
| Inside → Outside | Output intersection point |
| Outside → Inside | Output intersection + next vertex |
| Outside → Outside | Output nothing |

### Example
**Input:** Triangle **(-8,0), (0,8), (8,-3)**, window **[-5,-5] to [5,5]**

```
Clip against LEFT (x=-5):
  Edge (-8,0)→(0,8):  Outside→Inside → output (-5,5) and (0,8)
  Edge (0,8)→(8,-3):  Inside→Inside → output (8,-3)
  Edge (8,-3)→(-8,0): Inside→Outside → output (-5,-1.875)
  → Polygon: (-5,5), (0,8), (8,-3), (-5,-1.875)

Clip against RIGHT (x=5):
  ... similar process ...

Clip against BOTTOM, then TOP:
  ... produces final clipped polygon inside window
```

---

## 🧊 8. Back Face Detection Algorithm

### Concept
Determines which faces of a 3D object are **visible** from a given viewpoint by computing the **dot product** of each face's outward **normal vector** with the **view direction vector**. If the result is negative, the face points toward the viewer and is visible.

### Key Formula
```
N · V = Nx*Vx + Ny*Vy + Nz*Vz

If N · V < 0  → Face is VISIBLE  (normal points toward viewer)
If N · V ≥ 0  → Face is HIDDEN   (back face)
```

### Example
**Input:** Cube (6 faces), View direction **(0, 0, -1)** (looking into screen)

| Face | Normal | N · V | Result |
|------|--------|-------|--------|
| Front | (0, 0, -1) | 0·0 + 0·0 + (-1)·(-1) = **1** | ❌ Hidden |
| Back | (0, 0, 1) | 0 + 0 + 1·(-1) = **-1** | ✅ Visible |
| Left | (-1, 0, 0) | -1·0 + 0 + 0 = **0** | ❌ Hidden |
| Right | (1, 0, 0) | 1·0 + 0 + 0 = **0** | ❌ Hidden |
| Top | (0, 1, 0) | 0 + 1·0 + 0 = **0** | ❌ Hidden |
| Bottom | (0, -1, 0) | 0 + (-1)·0 + 0 = **0** | ❌ Hidden |

> **Note:** In this simulator the convention is that the view direction points *into* the screen, so the **Back** face (whose normal points along +Z) has N·V < 0 and is visible.

---

## 📊 9. Z-Buffer (Depth Buffer) Algorithm

### Concept
The most widely used **hidden surface removal** algorithm. It maintains a **depth buffer** (same size as the screen) initialised to ∞. For every pixel of every polygon, it compares the fragment's depth against the stored depth — if closer, it overwrites both the **colour buffer** and the **depth buffer**.

### Key Logic
```
Initialise:  Z-buffer[x,y] = ∞  for all pixels

For each polygon P:
    For each pixel (x, y) of P:
        z = depth of P at (x, y)
        if z < Z-buffer[x,y]:
            Z-buffer[x,y] = z
            ColourBuffer[x,y] = colour of P
```

### Example
**Input:** 3 overlapping triangles at different depths

```
Red △ at z=5, Blue △ at z=3, Green △ at z=4

Pixel (2, 1):
  Process Red:  z=5 < ∞   → write Red,  Z-buf=5
  Process Blue: z=3 < 5   → write Blue, Z-buf=3
  Process Green: z=4 > 3  → skip (Blue is closer)

  Final colour at (2,1) = Blue
```

**Pros:** Handles any scene complexity, no sorting needed.  
**Cons:** O(n) memory for depth buffer; no transparency support without extra work.

---

## 🖌️ 10. Painter's Algorithm

### Concept
A simpler visibility approach that works like a real painter: render objects **back-to-front** (farthest first). Closer objects naturally **overwrite** (paint over) farther ones on the screen.

### Key Steps
```
1. Calculate average depth (z̄) of each polygon
2. Sort polygons by depth: farthest (largest z̄) first
3. Render polygons in sorted order
```

### Example
**Input:** 3 triangles

| Polygon | Avg Depth | Render Order |
|---------|-----------|-------------|
| Green △ | z̄ = 9.0 | 1st (farthest → painted first) |
| Blue △ | z̄ = 6.0 | 2nd |
| Red △ | z̄ = 3.0 | 3rd (closest → painted last, on top) |

```
Step 1: Render Green △ (z̄=9) → fills background
Step 2: Render Blue △ (z̄=6) → overwrites part of Green
Step 3: Render Red △ (z̄=3) → overwrites parts of Blue & Green

Result: Red appears on top where they overlap
```

**Pros:** Simple, handles transparency naturally.  
**Cons:** Fails with **cyclic overlaps** (polygon A in front of B, B in front of C, C in front of A).

---

## 🚀 How to Run

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Select an algorithm from the left panel
4. Enter input parameters
5. Click **Draw** to see the animated visualization
6. View the step-by-step calculation table on the right panel

## 🛠️ Project Structure

```
Computer_graphics/
├── index.html                          # Main page
├── README.md                           # This file
├── css/
│   └── styles.css                      # Dark-themed UI styles
└── js/
    ├── app.js                          # Application controller
    ├── canvas.js                       # Canvas rendering engine
    └── algorithms/
        ├── dda.js                      # DDA Line Drawing
        ├── bresenham.js                # Bresenham's Line Drawing
        ├── circle.js                   # Midpoint Circle Drawing
        ├── boundary_fill.js            # Boundary Fill
        ├── flood_fill.js               # Flood Fill
        ├── cohen_sutherland.js         # Cohen–Sutherland Line Clipping
        ├── sutherland_hodgman.js        # Sutherland–Hodgman Polygon Clipping
        ├── back_face.js                # Back Face Detection
        ├── zbuffer.js                  # Z-Buffer
        └── painters.js                # Painter's Algorithm
```

## 📜 License

Built for learning purposes. Free to use and modify.
