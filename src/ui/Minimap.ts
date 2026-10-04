import * as THREE from 'three';
import { RoadGraph } from '../world/RoadGraph';
import { TrafficManager } from '../traffic/TrafficManager';
import { BuildingSystem } from '../world/BuildingSystem';
import { CITY_CONFIG, DistrictType, getDistrictForPosition } from '../world/CityConfig';
export class Minimap {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private roadGraph: RoadGraph;
    private trafficManager: TrafficManager;
    private buildingSystem: BuildingSystem;
    private districtElem: HTMLElement | null;
    private readonly mapRadiusMeters: number = 130.0;
    private readonly size: number = 180;
    constructor(roadGraph: RoadGraph, trafficManager: TrafficManager, buildingSystem: BuildingSystem) {
        this.roadGraph = roadGraph;
        this.trafficManager = trafficManager;
        this.buildingSystem = buildingSystem;
        this.districtElem = document.getElementById('district-label');
        let canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'minimap-canvas';
            canvas.width = this.size * 2;
            canvas.height = this.size * 2;
            canvas.style.width = `${this.size}px`;
            canvas.style.height = `${this.size}px`;
            const minimapContainer = document.getElementById('minimap-container');
            if (minimapContainer) {
                minimapContainer.appendChild(canvas);
            }
            else {
                document.getElementById('hud-container')?.appendChild(canvas);
            }
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }
    public update(playerPos: THREE.Vector3, playerHeading: number) {
        const ctx = this.ctx;
        const s = this.size * 2;
        const center = s / 2;
        const scale = center / this.mapRadiusMeters;
        ctx.clearRect(0, 0, s, s);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, center - 6, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = 'rgba(11, 16, 26, 0.85)';
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1.5;
        [0.35, 0.7, 1.0].forEach(rRatio => {
            ctx.beginPath();
            ctx.arc(center, center, (center - 10) * rRatio, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-playerHeading);
        ctx.lineCap = 'round';
        this.roadGraph.segments.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId)!;
            const endNode = this.roadGraph.nodes.get(seg.endNodeId)!;
            const p1X = (startNode.x - playerPos.x) * scale;
            const p1Y = (startNode.z - playerPos.z) * scale;
            const p2X = (endNode.x - playerPos.x) * scale;
            const p2Y = (endNode.z - playerPos.z) * scale;
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.95)';
            ctx.lineWidth = seg.width * scale * 0.9;
            ctx.beginPath();
            ctx.moveTo(p1X, p1Y);
            ctx.lineTo(p2X, p2Y);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
            ctx.lineWidth = 2.0;
            ctx.stroke();
        });
        this.buildingSystem.landmarks.forEach(lm => {
            const lx = (lm.position.x - playerPos.x) * scale;
            const lz = (lm.position.z - playerPos.z) * scale;
            if (Math.hypot(lx, lz) < center - 12) {
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(lx, lz, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(lm.name, lx + 7, lz + 4);
            }
        });
        const specialLandmarks = [
            { name: '✈️ AIRPORT', x: 230, z: 70, color: '#38bdf8' },
            { name: '🏎️ GARAGE', x: 55, z: 0, color: '#00f5ff' },
            { name: '🌲 PARK', x: -110, z: 25, color: '#22c55e' },
            { name: '⚓ DOCKS', x: -180, z: -150, color: '#eab308' }
        ];
        specialLandmarks.forEach(lm => {
            const lx = (lm.x - playerPos.x) * scale;
            const lz = (lm.z - playerPos.z) * scale;
            if (Math.hypot(lx, lz) < center - 12) {
                ctx.fillStyle = lm.color;
                ctx.beginPath();
                ctx.arc(lx, lz, 5.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText(lm.name, lx + 7, lz + 4);
            }
        });
        const traffic = this.trafficManager.getActiveTrafficPositions();
        ctx.fillStyle = '#f97316';
        traffic.forEach(t => {
            const tx = (t.x - playerPos.x) * scale;
            const tz = (t.z - playerPos.z) * scale;
            if (Math.hypot(tx, tz) < center - 10) {
                ctx.beginPath();
                ctx.arc(tx, tz, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
        ctx.save();
        ctx.translate(center, center);
        const sightGrad = ctx.createRadialGradient(0, 0, 4, 0, -45, 45);
        sightGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
        sightGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
        ctx.fillStyle = sightGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 45, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#00e5ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(6, 7);
        ctx.lineTo(0, 4);
        ctx.lineTo(-6, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center, center, center - 6, 0, Math.PI * 2);
        ctx.stroke();
        const northAngle = -playerHeading - Math.PI / 2;
        const nx = center + Math.cos(northAngle) * (center - 14);
        const ny = center + Math.sin(northAngle) * (center - 14);
        ctx.fillStyle = '#ff3344';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', nx, ny);
        this.updateDistrictLabel(playerPos);
    }
    private updateDistrictLabel(playerPos: THREE.Vector3) {
        const district = getDistrictForPosition(playerPos.x, playerPos.z);
        if (this.districtElem) {
            this.districtElem.textContent = district;
        }
    }
}
