import * as THREE from 'three';
import { RoadGraph } from '../world/RoadGraph';
import { ProfileSystem } from '../progression/ProfileSystem';
import { CarController } from '../vehicle/CarController';

export interface MapPOI {
    id: string;
    name: string;
    type: 'garage' | 'race' | 'airport' | 'park' | 'harbor' | 'landmark';
    pos: THREE.Vector3;
    icon: string;
    description: string;
}

export class WorldMapUI {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    public isOpen: boolean = false;

    private roadGraph: RoadGraph;
    private profile: ProfileSystem;
    private carController: CarController;
    private selectedPoi: MapPOI | null = null;

    public onFastTravel?: (pos: THREE.Vector3, heading: number) => void;

    public pois: MapPOI[] = [
        { id: 'apex_garage', name: 'Apex Performance Garage', type: 'garage', pos: new THREE.Vector3(55, 0, 0), icon: '🏎️', description: 'Central vehicle tuning hub, showroom & upgrade bay.' },
        { id: 'downtown_gp', name: 'Downtown Grand Prix', type: 'race', pos: new THREE.Vector3(0, 0, -45), icon: '🏁', description: 'High-speed urban circuit race through skyscraper canyons.' },
        { id: 'airport_runway', name: 'Metro Airport Runway 09L', type: 'airport', pos: new THREE.Vector3(240, 0, 70), icon: '✈️', description: '320m drag strip with 45m control tower and radar dish.' },
        { id: 'botanical_park', name: 'Central Botanical Lake', type: 'park', pos: new THREE.Vector3(-120, 0, 0), icon: '🌲', description: 'Scenic ornamental lake with arched stone bridge & pavilion.' },
        { id: 'harbor_docks', name: 'Harbor Container Terminal', type: 'harbor', pos: new THREE.Vector3(-180, 0, -110), icon: '🏗️', description: 'Industrial container maze with heavy-duty yellow gantry crane.' },
        { id: 'highway_overpass', name: 'Interstate Highway Overpass', type: 'landmark', pos: new THREE.Vector3(60, 0, 220), icon: '🛣️', description: 'Elevated interstate freeway corridor with overhead gantry.' }
    ];

    constructor(roadGraph: RoadGraph, profile: ProfileSystem, carController: CarController) {
        this.roadGraph = roadGraph;
        this.profile = profile;
        this.carController = carController;

        this.container = document.createElement('div');
        this.container.id = 'world-map-modal';
        this.container.className = 'world-map-modal hidden';

        this.container.innerHTML = `
            <div class="map-card">
                <div class="map-header">
                    <div class="map-title-box">
                        <h2>🗺️ METROPOLITAN GPS NAVIGATION</h2>
                        <p>EXPLORE DISTRICTS • LOCATE RACES • FAST TRAVEL</p>
                    </div>
                    <div class="map-header-actions">
                        <span class="district-badge-txt" id="map-current-district">DISTRICT: DOWNTOWN</span>
                        <button class="btn-close-map" id="btn-close-map">EXIT MAP [M/ESC]</button>
                    </div>
                </div>

                <div class="map-body">
                    <div class="map-canvas-wrapper">
                        <canvas id="map-fullscreen-canvas" width="800" height="600"></canvas>
                        <div class="map-overlay-hint">CLICK ANY DISCOVERED LOCATION TO FAST TRAVEL</div>
                    </div>

                    <div class="map-sidebar">
                        <div class="poi-info-card" id="poi-info-card">
                            <h3 id="poi-title">SELECT A LOCATION</h3>
                            <p id="poi-desc">Click an icon on the radar map to view details and fast travel.</p>
                            <div class="fast-travel-btn-box">
                                <button class="btn-fast-travel" id="btn-fast-travel" disabled>⚡ FAST TRAVEL</button>
                            </div>
                        </div>

                        <div class="map-legend">
                            <h4>LEGEND</h4>
                            <div class="legend-row"><span>🏎️ Garage Hub</span><span>🏁 Street Race</span></div>
                            <div class="legend-row"><span>✈️ Airport Terminal</span><span>🌲 Botanical Park</span></div>
                            <div class="legend-row"><span>🏗️ Harbor Docks</span><span>📍 Player Position</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);
        this.canvas = document.getElementById('map-fullscreen-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.setupEvents();
    }

    private setupEvents() {
        document.getElementById('btn-close-map')?.addEventListener('click', () => {
            this.toggle(false);
        });

        document.getElementById('btn-fast-travel')?.addEventListener('click', () => {
            if (this.selectedPoi) {
                if (this.onFastTravel) {
                    this.onFastTravel(this.selectedPoi.pos, 0);
                } else {
                    this.carController.resetPosition(this.selectedPoi.pos.x, this.selectedPoi.pos.z, 0);
                }
                this.toggle(false);
            }
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const mapSize = 520;
            const originX = this.canvas.width / 2;
            const originY = this.canvas.height / 2;
            const scale = (this.canvas.width * 0.8) / mapSize;

            for (const poi of this.pois) {
                const screenX = originX + poi.pos.x * scale;
                const screenY = originY + poi.pos.z * scale;
                const dist = Math.hypot(clickX - screenX, clickY - screenY);

                if (dist < 18) {
                    this.selectPoi(poi);
                    this.renderMap();
                    return;
                }
            }
        });
    }

    private selectPoi(poi: MapPOI) {
        this.selectedPoi = poi;
        const titleElem = document.getElementById('poi-title');
        const descElem = document.getElementById('poi-desc');
        const btnElem = document.getElementById('btn-fast-travel') as HTMLButtonElement;

        if (titleElem) titleElem.textContent = `${poi.icon} ${poi.name.toUpperCase()}`;
        if (descElem) descElem.textContent = poi.description;
        if (btnElem) {
            btnElem.disabled = false;
            btnElem.textContent = `⚡ FAST TRAVEL TO ${poi.name.toUpperCase()}`;
        }
    }

    public fastTravelTo(poi: MapPOI) {
        this.selectedPoi = poi;
        if (this.onFastTravel) {
            this.onFastTravel(poi.pos, 0);
        } else {
            this.carController.resetPosition(poi.pos.x, poi.pos.z, 0);
        }
        this.toggle(false);
    }

    public toggle(open?: boolean) {
        this.isOpen = open !== undefined ? open : !this.isOpen;
        if (this.isOpen) {
            this.container.classList.remove('hidden');
            this.renderMap();
        } else {
            this.container.classList.add('hidden');
        }
    }

    public renderMap() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, w, h);

        const mapSize = 520;
        const originX = w / 2;
        const originY = h / 2;
        const scale = (w * 0.8) / mapSize;

        // Draw District Backdrop Zones
        ctx.fillStyle = 'rgba(30, 58, 138, 0.12)'; // Downtown
        ctx.fillRect(originX - 100 * scale, originY - 100 * scale, 200 * scale, 200 * scale);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.10)'; // Park
        ctx.fillRect(originX - 180 * scale, originY - 60 * scale, 80 * scale, 120 * scale);

        ctx.fillStyle = 'rgba(14, 165, 233, 0.10)'; // Airport
        ctx.fillRect(originX + 100 * scale, originY + 20 * scale, 140 * scale, 100 * scale);

        ctx.fillStyle = 'rgba(249, 115, 22, 0.10)'; // Harbor
        ctx.fillRect(originX - 220 * scale, originY - 160 * scale, 100 * scale, 90 * scale);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Draw Roads
        ctx.lineWidth = 6 * scale;
        ctx.strokeStyle = '#1e293b';
        ctx.lineCap = 'round';
        this.roadGraph.segments.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId);
            const endNode = this.roadGraph.nodes.get(seg.endNodeId);
            if (!startNode || !endNode) return;
            const sx = originX + startNode.x * scale;
            const sy = originY + startNode.z * scale;
            const ex = originX + endNode.x * scale;
            const ey = originY + endNode.z * scale;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        });

        // Road Centerlines
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = '#334155';
        this.roadGraph.segments.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId);
            const endNode = this.roadGraph.nodes.get(seg.endNodeId);
            if (!startNode || !endNode) return;
            const sx = originX + startNode.x * scale;
            const sy = originY + startNode.z * scale;
            const ex = originX + endNode.x * scale;
            const ey = originY + endNode.z * scale;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        });

        // Draw POIs
        this.pois.forEach(poi => {
            const px = originX + poi.pos.x * scale;
            const py = originY + poi.pos.z * scale;
            const isSelected = this.selectedPoi?.id === poi.id;

            ctx.beginPath();
            ctx.arc(px, py, isSelected ? 16 : 12, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#00f5ff' : 'rgba(15, 23, 42, 0.9)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = isSelected ? '#ffffff' : '#00f5ff';
            ctx.stroke();

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(poi.icon, px, py);
        });

        // Draw Player Marker
        const playerPos = this.carController.position;
        const playerX = originX + playerPos.x * scale;
        const playerY = originY + playerPos.z * scale;
        const heading = this.carController.currentHeading;

        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.rotate(-heading);

        // Player cone
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(7, 8);
        ctx.lineTo(0, 4);
        ctx.lineTo(-7, 8);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
