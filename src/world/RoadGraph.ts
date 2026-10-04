import * as THREE from 'three';
import { RoadCategory, CITY_CONFIG } from './CityConfig';
export enum SignalPhase {
    NS_GREEN = 'NS_GREEN',
    NS_YELLOW = 'NS_YELLOW',
    ALL_RED_1 = 'ALL_RED_1',
    EW_GREEN = 'EW_GREEN',
    EW_YELLOW = 'EW_YELLOW',
    ALL_RED_2 = 'ALL_RED_2'
}
export interface SignalVisuals {
    nsRed: THREE.MeshStandardMaterial[];
    nsYellow: THREE.MeshStandardMaterial[];
    nsGreen: THREE.MeshStandardMaterial[];
    ewRed: THREE.MeshStandardMaterial[];
    ewYellow: THREE.MeshStandardMaterial[];
    ewGreen: THREE.MeshStandardMaterial[];
}
export interface IntersectionNode {
    id: string;
    x: number;
    z: number;
    gridCol: number;
    gridRow: number;
    signalPhase: SignalPhase;
    phaseTimer: number;
    phaseDurations: Record<SignalPhase, number>;
    connectedSegmentIds: string[];
    visuals?: SignalVisuals;
}
export interface RoadSegment {
    id: string;
    startNodeId: string;
    endNodeId: string;
    category: RoadCategory;
    width: number;
    lanesPerDirection: number;
    speedLimit: number;
    waypointsForward: THREE.Vector3[][];
    waypointsBackward: THREE.Vector3[][];
}
export class RoadGraph {
    public nodes: Map<string, IntersectionNode> = new Map();
    public segments: Map<string, RoadSegment> = new Map();
    constructor() {
        this.buildSymmetricalGridGraph();
    }
    private buildSymmetricalGridGraph() {
        const indices = CITY_CONFIG.GRID_INDICES;
        const blockSize = CITY_CONFIG.BLOCK_SIZE;
        for (let c of indices) {
            for (let r of indices) {
                const x = c * blockSize;
                const z = r * blockSize;
                const id = `int_${c}_${r}`;
                const node: IntersectionNode = {
                    id,
                    x,
                    z,
                    gridCol: c,
                    gridRow: r,
                    signalPhase: (c + r) % 2 === 0 ? SignalPhase.NS_GREEN : SignalPhase.EW_GREEN,
                    phaseTimer: Math.random() * 4.0,
                    phaseDurations: {
                        [SignalPhase.NS_GREEN]: 12.0,
                        [SignalPhase.NS_YELLOW]: 3.0,
                        [SignalPhase.ALL_RED_1]: 1.5,
                        [SignalPhase.EW_GREEN]: 12.0,
                        [SignalPhase.EW_YELLOW]: 3.0,
                        [SignalPhase.ALL_RED_2]: 1.5,
                    },
                    connectedSegmentIds: []
                };
                this.nodes.set(id, node);
            }
        }
        for (let r of indices) {
            for (let i = 0; i < indices.length - 1; i++) {
                const c1 = indices[i];
                const c2 = indices[i + 1];
                const startId = `int_${c1}_${r}`;
                const endId = `int_${c2}_${r}`;
                const segId = `road_h_${c1}_${r}`;
                let cat = RoadCategory.BOULEVARD;
                if (r === 0)
                    cat = RoadCategory.MAJOR_AVENUE;
                else if (r === 2)
                    cat = RoadCategory.HIGHWAY;
                else if (r === -2)
                    cat = RoadCategory.INDUSTRIAL_ROAD;
                else if (r === 1)
                    cat = RoadCategory.RESIDENTIAL_STREET;
                this.createSegment(segId, startId, endId, cat);
            }
        }
        for (let c of indices) {
            for (let i = 0; i < indices.length - 1; i++) {
                const r1 = indices[i];
                const r2 = indices[i + 1];
                const startId = `int_${c}_${r1}`;
                const endId = `int_${c}_${r2}`;
                const segId = `road_v_${c}_${r1}`;
                let cat = RoadCategory.BOULEVARD;
                if (c === 0)
                    cat = RoadCategory.MAJOR_AVENUE;
                else if (c === 1)
                    cat = RoadCategory.BOULEVARD;
                else if (c === -1)
                    cat = RoadCategory.RESIDENTIAL_STREET;
                else if (c === -2)
                    cat = RoadCategory.INDUSTRIAL_ROAD;
                this.createSegment(segId, startId, endId, cat);
            }
        }
    }
    private createSegment(segId: string, startId: string, endId: string, category: RoadCategory) {
        const startNode = this.nodes.get(startId)!;
        const endNode = this.nodes.get(endId)!;
        const width = CITY_CONFIG.ROAD_WIDTH[category];
        const lanesPerDir = category === RoadCategory.MAJOR_AVENUE || category === RoadCategory.HIGHWAY ? 2 : 1;
        const speedLimit = CITY_CONFIG.TRAFFIC_SPEED_LIMITS[category];
        const p1 = new THREE.Vector3(startNode.x, 0, startNode.z);
        const p2 = new THREE.Vector3(endNode.x, 0, endNode.z);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const right = new THREE.Vector3(-dir.z, 0, dir.x);
        const waypointsForward: THREE.Vector3[][] = [];
        const waypointsBackward: THREE.Vector3[][] = [];
        const laneWidth = CITY_CONFIG.LANE_WIDTH;
        for (let l = 0; l < lanesPerDir; l++) {
            const offsetDist = (l + 0.6) * laneWidth;
            const f1 = p1.clone().addScaledVector(right, offsetDist).addScaledVector(dir, 10);
            const f2 = p2.clone().addScaledVector(right, offsetDist).addScaledVector(dir, -10);
            waypointsForward.push([f1, f2]);
            const b1 = p2.clone().addScaledVector(right, -offsetDist).addScaledVector(dir, -10);
            const b2 = p1.clone().addScaledVector(right, -offsetDist).addScaledVector(dir, 10);
            waypointsBackward.push([b1, b2]);
        }
        const segment: RoadSegment = {
            id: segId,
            startNodeId: startId,
            endNodeId: endId,
            category,
            width,
            lanesPerDirection: lanesPerDir,
            speedLimit,
            waypointsForward,
            waypointsBackward
        };
        this.segments.set(segId, segment);
        startNode.connectedSegmentIds.push(segId);
        endNode.connectedSegmentIds.push(segId);
    }
    public updateTrafficSignals(dt: number) {
        this.nodes.forEach(node => {
            node.phaseTimer += dt;
            const currentDuration = node.phaseDurations[node.signalPhase];
            if (node.phaseTimer >= currentDuration) {
                node.phaseTimer = 0;
                switch (node.signalPhase) {
                    case SignalPhase.NS_GREEN:
                        node.signalPhase = SignalPhase.NS_YELLOW;
                        break;
                    case SignalPhase.NS_YELLOW:
                        node.signalPhase = SignalPhase.ALL_RED_1;
                        break;
                    case SignalPhase.ALL_RED_1:
                        node.signalPhase = SignalPhase.EW_GREEN;
                        break;
                    case SignalPhase.EW_GREEN:
                        node.signalPhase = SignalPhase.EW_YELLOW;
                        break;
                    case SignalPhase.EW_YELLOW:
                        node.signalPhase = SignalPhase.ALL_RED_2;
                        break;
                    case SignalPhase.ALL_RED_2:
                        node.signalPhase = SignalPhase.NS_GREEN;
                        break;
                }
                this.updateSignalVisuals(node);
            }
        });
    }
    public registerSignalVisuals(nodeId: string, visuals: SignalVisuals) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.visuals = visuals;
            this.updateSignalVisuals(node);
        }
    }
    private updateSignalVisuals(node: IntersectionNode) {
        if (!node.visuals)
            return;
        const v = node.visuals;
        const setMat = (mats: THREE.MeshStandardMaterial[], lit: boolean, intensity: number) => {
            mats.forEach(m => {
                m.emissiveIntensity = lit ? intensity : 0.08;
            });
        };
        const isNS = node.signalPhase.startsWith('NS_');
        const isEW = node.signalPhase.startsWith('EW_');
        setMat(v.nsGreen, node.signalPhase === SignalPhase.NS_GREEN, 2.5);
        setMat(v.nsYellow, node.signalPhase === SignalPhase.NS_YELLOW, 2.2);
        setMat(v.nsRed, !isNS || node.signalPhase === SignalPhase.ALL_RED_1 || node.signalPhase === SignalPhase.ALL_RED_2, 2.6);
        setMat(v.ewGreen, node.signalPhase === SignalPhase.EW_GREEN, 2.5);
        setMat(v.ewYellow, node.signalPhase === SignalPhase.EW_YELLOW, 2.2);
        setMat(v.ewRed, !isEW || node.signalPhase === SignalPhase.ALL_RED_1 || node.signalPhase === SignalPhase.ALL_RED_2, 2.6);
    }
    public getSignalStateForDirection(nodeId: string, approachVector: THREE.Vector3): 'GREEN' | 'YELLOW' | 'RED' {
        const node = this.nodes.get(nodeId);
        if (!node)
            return 'GREEN';
        const isNorthSouth = Math.abs(approachVector.z) >= Math.abs(approachVector.x);
        if (isNorthSouth) {
            if (node.signalPhase === SignalPhase.NS_GREEN)
                return 'GREEN';
            if (node.signalPhase === SignalPhase.NS_YELLOW)
                return 'YELLOW';
            return 'RED';
        }
        else {
            if (node.signalPhase === SignalPhase.EW_GREEN)
                return 'GREEN';
            if (node.signalPhase === SignalPhase.EW_YELLOW)
                return 'YELLOW';
            return 'RED';
        }
    }
    public getNearestSegment(pos: THREE.Vector3): {
        segment: RoadSegment;
        distance: number;
    } | null {
        let bestDist = Infinity;
        let bestSeg: RoadSegment | null = null;
        this.segments.forEach(seg => {
            const startNode = this.nodes.get(seg.startNodeId)!;
            const endNode = this.nodes.get(seg.endNodeId)!;
            const lineStart = new THREE.Vector2(startNode.x, startNode.z);
            const lineEnd = new THREE.Vector2(endNode.x, endNode.z);
            const p = new THREE.Vector2(pos.x, pos.z);
            const l2 = lineStart.distanceToSquared(lineEnd);
            let t = ((p.x - lineStart.x) * (lineEnd.x - lineStart.x) + (p.y - lineStart.y) * (lineEnd.y - lineStart.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const proj = new THREE.Vector2(lineStart.x + t * (lineEnd.x - lineStart.x), lineStart.y + t * (lineEnd.y - lineStart.y));
            const d = p.distanceTo(proj);
            if (d < bestDist) {
                bestDist = d;
                bestSeg = seg;
            }
        });
        return bestSeg ? { segment: bestSeg, distance: bestDist } : null;
    }
    public getOutgoingSegments(nodeId: string, incomingSegmentId?: string): RoadSegment[] {
        const node = this.nodes.get(nodeId);
        if (!node)
            return [];
        const result: RoadSegment[] = [];
        node.connectedSegmentIds.forEach(id => {
            if (id !== incomingSegmentId) {
                const seg = this.segments.get(id);
                if (seg)
                    result.push(seg);
            }
        });
        if (result.length === 0 && incomingSegmentId) {
            const seg = this.segments.get(incomingSegmentId);
            if (seg)
                result.push(seg);
        }
        return result;
    }
}
