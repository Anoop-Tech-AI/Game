import * as THREE from 'three';
import { RoadSystem } from './RoadSystem';
import { BuildingGenerator } from './BuildingGenerator';
import { UrbanProps } from './UrbanProps';
import { Vegetation } from './Vegetation';
import { SkyEnvironment } from '../rendering/SkyEnvironment';
import { CollisionBox } from '../vehicle/CarController';
export class CityStreet {
    public group: THREE.Group;
    public roadSystem: RoadSystem;
    public buildingGenerator: BuildingGenerator;
    public urbanProps: UrbanProps;
    public vegetation: Vegetation;
    public colliders: CollisionBox[] = [];
    constructor(skyEnv: SkyEnvironment) {
        this.group = new THREE.Group();
        this.group.name = 'CityStreet';
        this.roadSystem = new RoadSystem();
        this.group.add(this.roadSystem.group);
        this.buildingGenerator = new BuildingGenerator();
        this.group.add(this.buildingGenerator.group);
        this.urbanProps = new UrbanProps(skyEnv);
        this.group.add(this.urbanProps.group);
        this.vegetation = new Vegetation();
        this.group.add(this.vegetation.group);
        this.colliders.push(...this.roadSystem.colliders);
        this.colliders.push(...this.buildingGenerator.colliders);
    }
}
