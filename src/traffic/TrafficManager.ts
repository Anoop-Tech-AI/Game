import * as THREE from 'three';
import { TrafficVehicle } from './TrafficVehicle';
import { TrafficModels, TrafficVehicleType } from './TrafficModels';
import { RoadGraph, RoadSegment } from '../world/RoadGraph';
import { CITY_CONFIG, DistrictType } from '../world/CityConfig';
export class TrafficManager {
    public group: THREE.Group;
    public vehicles: TrafficVehicle[] = [];
    public parkedCarsGroup: THREE.Group;
    public roadGraph: RoadGraph;
    private spawnCooldown: number = 0;
    constructor(roadGraph: RoadGraph) {
        this.group = new THREE.Group();
        this.group.name = 'TrafficSystem';
        this.roadGraph = roadGraph;
        this.parkedCarsGroup = new THREE.Group();
        this.parkedCarsGroup.name = 'ParkedVehicles';
        this.group.add(this.parkedCarsGroup);
        this.initPool();
        this.populateParkedVehicles();
    }
    private initPool() {
        const types: TrafficVehicleType[] = ['sedan', 'sedan', 'suv', 'hatchback', 'sedan', 'truck'];
        for (let i = 0; i < CITY_CONFIG.TRAFFIC_MAX_VEHICLES; i++) {
            const type = types[i % types.length];
            const vehicle = new TrafficVehicle(type);
            vehicle.isActive = false;
            vehicle.model.group.visible = false;
            this.vehicles.push(vehicle);
            this.group.add(vehicle.model.group);
        }
    }
    private populateParkedVehicles() {
        const parkedTypes: TrafficVehicleType[] = ['sedan', 'suv', 'hatchback'];
        const curbSpots = [
            { x: -110, z: -40, heading: 0 },
            { x: -110, z: -20, heading: 0 },
            { x: -110, z: 30, heading: 0 },
            { x: -110, z: 50, heading: 0 },
            { x: 110, z: -45, heading: Math.PI },
            { x: 110, z: -25, heading: Math.PI },
            { x: 110, z: 40, heading: Math.PI },
            { x: -40, z: 110, heading: Math.PI / 2 },
            { x: 20, z: 110, heading: Math.PI / 2 },
            { x: 45, z: 110, heading: Math.PI / 2 },
            { x: 68, z: 15, heading: 0 },
            { x: 74, z: 15, heading: 0 },
            { x: 80, z: 15, heading: 0 },
            { x: 86, z: 15, heading: 0 },
            { x: 68, z: 28, heading: Math.PI },
            { x: 74, z: 28, heading: Math.PI },
            { x: 80, z: 28, heading: Math.PI }
        ];
        curbSpots.forEach((spot, i) => {
            const type = parkedTypes[i % parkedTypes.length];
            const car = TrafficModels.createVehicle(type);
            car.group.position.set(spot.x, 0, spot.z);
            car.group.rotation.y = spot.heading;
            this.parkedCarsGroup.add(car.group);
        });
    }
    public update(dt: number, playerPos: THREE.Vector3) {
        this.spawnCooldown -= dt;
        let activeCount = 0;
        this.vehicles.forEach(vehicle => {
            if (!vehicle.isActive)
                return;
            const distToPlayer = vehicle.position.distanceTo(playerPos);
            if (distToPlayer > CITY_CONFIG.TRAFFIC_DESPAWN_RADIUS) {
                vehicle.isActive = false;
                vehicle.model.group.visible = false;
                return;
            }
            activeCount++;
            vehicle.model.group.visible = true;
            vehicle.update(dt, this.roadGraph, this.vehicles, playerPos);
        });
        if (this.spawnCooldown <= 0 && activeCount < CITY_CONFIG.TRAFFIC_MAX_VEHICLES) {
            this.trySpawnVehicle(playerPos);
            this.spawnCooldown = 1.0;
        }
    }
    private trySpawnVehicle(playerPos: THREE.Vector3) {
        const inactiveVehicle = this.vehicles.find(v => !v.isActive);
        if (!inactiveVehicle)
            return;
        const segList = Array.from(this.roadGraph.segments.values());
        const validSegments: RoadSegment[] = [];
        segList.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId)!;
            const endNode = this.roadGraph.nodes.get(seg.endNodeId)!;
            const mid = new THREE.Vector3(startNode.x + endNode.x, 0, startNode.z + endNode.z).multiplyScalar(0.5);
            const d = mid.distanceTo(playerPos);
            if (d >= 50.0 && d <= CITY_CONFIG.TRAFFIC_SPAWN_RADIUS) {
                validSegments.push(seg);
            }
        });
        if (validSegments.length === 0)
            return;
        const seg = validSegments[Math.floor(Math.random() * validSegments.length)];
        const isForward = Math.random() > 0.5;
        const laneIndex = 0;
        inactiveVehicle.spawn(seg, isForward, laneIndex, Math.random() * 0.7 + 0.15);
    }
    public getActiveTrafficPositions(): {
        x: number;
        z: number;
        heading: number;
    }[] {
        const result: {
            x: number;
            z: number;
            heading: number;
        }[] = [];
        this.vehicles.forEach(v => {
            if (v.isActive) {
                result.push({ x: v.position.x, z: v.position.z, heading: v.heading });
            }
        });
        return result;
    }
}
