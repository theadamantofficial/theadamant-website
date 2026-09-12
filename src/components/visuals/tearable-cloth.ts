/** Bounded Verlet fabric with permanent breakable links and real missing faces. */
export class TearableCloth {
    readonly positions: Float32Array;
    readonly previous: Float32Array;
    readonly indices: Uint16Array;
    readonly uvs: Float32Array;
    readonly pins: Uint8Array;
    readonly links: {a: number; b: number; length: number; limit: number; broken: boolean}[] = [];
    private readonly faces: {a: number; b: number; c: number; links: number[]}[] = [];
    private readonly rest: Float32Array;
    private readonly grabs = new Map<number, {
        x: number; y: number; targetX: number; targetY: number;
        points: {id: number; dx: number; dy: number; weight: number}[];
    }>();
    brokenCount = 0;
    drawCount = 0;
    dropped = false;
    constructor(readonly width: number, readonly height: number, readonly columns: number, readonly rows: number) {
        const count = (columns + 1) * (rows + 1);
        this.positions = new Float32Array(count * 3);
        this.previous = new Float32Array(count * 3);
        this.uvs = new Float32Array(count * 2);
        this.pins = new Uint8Array(count);
        this.indices = new Uint16Array(columns * rows * 6);
        const horizontal = new Int32Array(count).fill(-1);
        const vertical = new Int32Array(count).fill(-1);
        const link = (a: number, b: number) => {
            const length = Math.hypot(this.positions[a * 3] - this.positions[b * 3],
                this.positions[a * 3 + 1] - this.positions[b * 3 + 1]);
            const index = this.links.length;
            const variation = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
            this.links.push({a, b, length, limit: length * (1.7 + (variation - Math.floor(variation)) * .4), broken: false});
            return index;
        };
        for (let row = 0; row <= rows; row++) {
            for (let column = 0; column <= columns; column++) {
                const id = row * (columns + 1) + column;
                this.positions[id * 3] = column / columns * width - width / 2;
                this.positions[id * 3 + 1] = height / 2 - row / rows * height;
                this.uvs[id * 2] = column / columns;
                this.uvs[id * 2 + 1] = 1 - row / rows;
                this.pins[id] = Number(row === 0 || row === rows || column === 0 || column === columns);
            }
        }
        this.rest = this.positions.slice();
        this.previous.set(this.positions);
        for (let row = 0; row <= rows; row++) {
            for (let column = 0; column <= columns; column++) {
                const id = row * (columns + 1) + column;
                if (column < columns) horizontal[id] = link(id, id + 1);
                if (row < rows) vertical[id] = link(id, id + columns + 1);
            }
        }
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const a = row * (columns + 1) + column, b = a + columns + 1, c = a + 1, d = b + 1;
                this.faces.push({a, b, c, links: [vertical[a], horizontal[a]]},
                    {a: b, b: d, c, links: [horizontal[b], vertical[c]]});
            }
        }
        this.rebuildIndex();
    }
    grab(slot: number, x: number, y: number, radius: number) {
        const points: {id: number; dx: number; dy: number; weight: number}[] = [];
        for (let id = 0; id < this.pins.length; id++) {
            const dx = this.positions[id * 3] - x, dy = this.positions[id * 3 + 1] - y;
            const distance = Math.hypot(dx, dy);
            if (distance < radius) {
                points.push({id, dx, dy, weight: .35 + .65 * (1 - distance / radius)});
                this.pins[id] = 0;
            }
        }
        this.grabs.set(slot, {x, y, targetX: x, targetY: y, points});
    }
    move(slot: number, x: number, y: number) {
        const grab = this.grabs.get(slot);
        if (grab) { grab.targetX = x; grab.targetY = y; }
    }
    release(slot?: number) {
        if (slot === undefined) this.grabs.clear();
        else this.grabs.delete(slot);
    }
    private applyGrabs() {
        for (const grab of this.grabs.values()) {
            const pull = Math.hypot(grab.targetX - grab.x, grab.targetY - grab.y);
            for (const point of grab.points) {
                const i = point.id * 3, strength = .72 * point.weight;
                this.positions[i] += (grab.targetX + point.dx - this.positions[i]) * strength;
                this.positions[i + 1] += (grab.targetY + point.dy - this.positions[i + 1]) * strength;
                // A small initial lift makes the material visibly pucker under a pinch.
                this.positions[i + 2] += (Math.min(.38, .055 + pull * .25) * point.weight - this.positions[i + 2]) * strength;
                this.previous[i] = this.positions[i];
                this.previous[i + 1] = this.positions[i + 1];
                this.previous[i + 2] = this.positions[i + 2];
            }
        }
    }
    step() {
        let energy = 0, topologyChanged = false;
        const gravity = this.dropped ? .008 : this.brokenCount ? .00035 : 0;
        for (let id = 0; id < this.pins.length; id++) {
            const i = id * 3;
            if (this.pins[id]) {
                for (let axis = 0; axis < 3; axis++) this.positions[i + axis] = this.previous[i + axis] = this.rest[i + axis];
                continue;
            }
            for (let axis = 0; axis < 3; axis++) {
                const current = this.positions[i + axis], velocity = (current - this.previous[i + axis]) * .94;
                this.previous[i + axis] = current;
                this.positions[i + axis] += velocity - (axis === 1 ? gravity : 0);
                energy += velocity * velocity;
            }
        }
        this.applyGrabs();
        for (let iteration = 0; iteration < 3; iteration++) {
            for (const link of this.links) {
                if (link.broken) continue;
                const a = link.a * 3, b = link.b * 3;
                const dx = this.positions[b] - this.positions[a], dy = this.positions[b + 1] - this.positions[a + 1],
                    dz = this.positions[b + 2] - this.positions[a + 2];
                const distance = Math.hypot(dx, dy, dz);
                if (!this.dropped && distance > link.limit) {
                    link.broken = true;
                    this.brokenCount++;
                    topologyChanged = true;
                    continue;
                }
                if (distance < .00001) continue;
                const freeA = 1 - this.pins[link.a], freeB = 1 - this.pins[link.b], free = freeA + freeB;
                if (!free) continue;
                const correction = (distance - link.length) / distance * .55 / free;
                this.positions[a] += dx * correction * freeA;
                this.positions[a + 1] += dy * correction * freeA;
                this.positions[a + 2] += dz * correction * freeA;
                this.positions[b] -= dx * correction * freeB;
                this.positions[b + 1] -= dy * correction * freeB;
                this.positions[b + 2] -= dz * correction * freeB;
            }
            this.applyGrabs();
        }
        if (topologyChanged) this.rebuildIndex();
        return energy;
    }
    private rebuildIndex() {
        let count = 0;
        for (const face of this.faces) {
            if (face.links.some(index => this.links[index].broken)) continue;
            this.indices[count++] = face.a;
            this.indices[count++] = face.b;
            this.indices[count++] = face.c;
        }
        this.drawCount = count;
    }
    drop() { this.dropped = true; this.pins.fill(0); this.release(); }
    get tearRatio() { return this.brokenCount / this.links.length; }
    get hasGrabs() { return this.grabs.size > 0; }
    get offscreen() {
        for (let id = 0; id < this.pins.length; id++) {
            if (this.positions[id * 3 + 1] > -this.height * .6) return false;
        }
        return true;
    }
}
