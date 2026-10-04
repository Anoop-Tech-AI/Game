import * as THREE from 'three';
import { RoadGraph } from './RoadGraph';
import { RoadNetwork } from './RoadNetwork';
import { BuildingSystem } from './BuildingSystem';
import { SpecializedDistricts } from './SpecializedDistricts';
import { PropsManager } from './PropsManager';
import { TrafficManager } from '../traffic/TrafficManager';
import { PedestrianSystem } from './PedestrianSystem';
import { SkyEnvironment } from '../rendering/SkyEnvironment';
import { CollisionBox } from '../vehicle/CarController';
import { CITY_CONFIG } from './CityConfig';
export class CityWorld {
    public group: THREE.Group;
    public roadGraph: RoadGraph;
    public roadNetwork: RoadNetwork;
    public buildingSystem: BuildingSystem;
    public specializedDistricts: SpecializedDistricts;
    public propsManager: PropsManager;
    public trafficManager: TrafficManager;
    public pedestrianSystem: PedestrianSystem;
    public colliders: CollisionBox[] = [];
    constructor(skyEnv: SkyEnvironment) {
        this.group = new THREE.Group();
        this.group.name = 'CityWorld';
        this.roadGraph = new RoadGraph();
        this.roadNetwork = new RoadNetwork(this.roadGraph);
        this.group.add(this.roadNetwork.group);
        this.buildingSystem = new BuildingSystem();
        this.group.add(this.buildingSystem.group);
        this.specializedDistricts = new SpecializedDistricts();
        this.group.add(this.specializedDistricts.group);
        this.propsManager = new PropsManager(this.roadGraph, skyEnv);
        this.group.add(this.propsManager.group);
        this.trafficManager = new TrafficManager(this.roadGraph);
        this.group.add(this.trafficManager.group);
        this.pedestrianSystem = new PedestrianSystem();
        this.group.add(this.pedestrianSystem.group);
        this.colliders.push(...this.roadNetwork.colliders);
        this.colliders.push(...this.buildingSystem.colliders);
        this.colliders.push(...this.specializedDistricts.colliders);
    }
    public update(dt: number, playerPos: THREE.Vector3) {
        this.roadGraph.updateTrafficSignals(dt);
        this.trafficManager.update(dt, playerPos);
        this.pedestrianSystem.update(dt, playerPos);
        this.specializedDistricts.update(dt);
    }
}
