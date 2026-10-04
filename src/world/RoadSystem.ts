import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { TextureGenerator } from '../rendering/TextureGenerator';
import { CollisionBox } from '../vehicle/CarController';
export class RoadSystem {
    public group: THREE.Group;
    public colliders: CollisionBox[] = [];
    public readonly roadLength = 240;
    public readonly roadWidth = 16;
    public readonly sidewalkWidth = 4.5;
    public readonly curbHeight = 0.18;
    public readonly curbWidth = 0.28;
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'RoadSystem';
        this.buildCityGroundBase();
        this.buildMainRoad();
        this.buildSidewalks();
        this.buildIntersection();
        this.buildRoadDetails();
    }
    private buildCityGroundBase() {
        const groundGeo = new THREE.PlaneGeometry(500, 500);
        groundGeo.rotateX(-Math.PI / 2);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x181a1f,
            roughness: 0.9,
            metalness: 0.1
        });
        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.position.set(0, -0.05, 0);
        groundMesh.receiveShadow = true;
        this.group.add(groundMesh);
    }
    private buildMainRoad() {
        const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.roadLength, 8, 32);
        roadGeo.rotateX(-Math.PI / 2);
        const roadMesh = new THREE.Mesh(roadGeo, Materials.asphalt);
        roadMesh.receiveShadow = true;
        roadMesh.position.set(0, 0.01, 0);
        this.group.add(roadMesh);
        const markingGeo = new THREE.PlaneGeometry(this.roadWidth, this.roadLength);
        markingGeo.rotateX(-Math.PI / 2);
        const markingMesh = new THREE.Mesh(markingGeo, Materials.roadMarkings);
        markingMesh.position.set(0, 0.018, 0);
        markingMesh.receiveShadow = true;
        this.group.add(markingMesh);
    }
    private buildSidewalks() {
        const halfRoad = this.roadWidth / 2;
        const sidePositions = [-1, 1];
        sidePositions.forEach(side => {
            const sidewalkCenterX = side * (halfRoad + this.curbWidth + this.sidewalkWidth / 2);
            const curbX = side * (halfRoad + this.curbWidth / 2);
            const swGeo = new THREE.BoxGeometry(this.sidewalkWidth, this.curbHeight, this.roadLength);
            const swMesh = new THREE.Mesh(swGeo, Materials.sidewalk);
            swMesh.position.set(sidewalkCenterX, this.curbHeight / 2, 0);
            swMesh.receiveShadow = true;
            this.group.add(swMesh);
            const curbGeo = new THREE.BoxGeometry(this.curbWidth, this.curbHeight, this.roadLength);
            const curbMesh = new THREE.Mesh(curbGeo, Materials.curb);
            curbMesh.position.set(curbX, this.curbHeight / 2, 0);
            curbMesh.receiveShadow = true;
            this.group.add(curbMesh);
        });
    }
    private buildIntersection() {
        const intersectionZ = 25;
        const crossRoadWidth = 14;
        const crossRoadGeo = new THREE.PlaneGeometry(160, crossRoadWidth);
        crossRoadGeo.rotateX(-Math.PI / 2);
        const crossRoadMesh = new THREE.Mesh(crossRoadGeo, Materials.asphalt);
        crossRoadMesh.position.set(0, 0.012, intersectionZ);
        crossRoadMesh.receiveShadow = true;
        this.group.add(crossRoadMesh);
        const cwGeo = new THREE.PlaneGeometry(this.roadWidth, 4.5);
        cwGeo.rotateX(-Math.PI / 2);
        const crosswalkSouth = new THREE.Mesh(cwGeo, Materials.crosswalk);
        crosswalkSouth.position.set(0, 0.022, intersectionZ - crossRoadWidth / 2 - 2.5);
        crosswalkSouth.receiveShadow = true;
        this.group.add(crosswalkSouth);
        const crosswalkNorth = new THREE.Mesh(cwGeo, Materials.crosswalk);
        crosswalkNorth.position.set(0, 0.022, intersectionZ + crossRoadWidth / 2 + 2.5);
        crosswalkNorth.rotation.y = Math.PI;
        crosswalkNorth.receiveShadow = true;
        this.group.add(crosswalkNorth);
        [-this.roadWidth / 2 - 1.2, this.roadWidth / 2 + 1.2].forEach(x => {
            [intersectionZ - crossRoadWidth / 2 - 2.5, intersectionZ + crossRoadWidth / 2 + 2.5].forEach(z => {
                const tactileGeo = new THREE.PlaneGeometry(1.6, 2.4);
                tactileGeo.rotateX(-Math.PI / 2);
                const tactileMesh = new THREE.Mesh(tactileGeo, Materials.tactilePaving);
                tactileMesh.position.set(x, this.curbHeight + 0.005, z);
                tactileMesh.receiveShadow = true;
                this.group.add(tactileMesh);
            });
        });
        const arrowStraightTex = TextureGenerator.createRoadArrowTexture('straight');
        const arrowRightTex = TextureGenerator.createRoadArrowTexture('right');
        const arrowMatStraight = new THREE.MeshStandardMaterial({
            map: arrowStraightTex,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1.2,
            polygonOffsetUnits: -1.2
        });
        const arrowMatRight = new THREE.MeshStandardMaterial({
            map: arrowRightTex,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1.2,
            polygonOffsetUnits: -1.2
        });
        const arrowGeo = new THREE.PlaneGeometry(2.4, 4.8);
        arrowGeo.rotateX(-Math.PI / 2);
        const arrow1 = new THREE.Mesh(arrowGeo, arrowMatStraight);
        arrow1.position.set(2.2, 0.022, intersectionZ - 22);
        this.group.add(arrow1);
        const arrow2 = new THREE.Mesh(arrowGeo, arrowMatRight);
        arrow2.position.set(6.0, 0.022, intersectionZ - 22);
        this.group.add(arrow2);
        const arrow3 = new THREE.Mesh(arrowGeo, arrowMatStraight);
        arrow3.position.set(-2.2, 0.022, intersectionZ + 22);
        arrow3.rotation.y = Math.PI;
        this.group.add(arrow3);
    }
    private buildRoadDetails() {
        const manholeGeo = new THREE.CircleGeometry(0.45, 24);
        manholeGeo.rotateX(-Math.PI / 2);
        const manholePositions = [
            { x: 2.2, z: -55 },
            { x: -2.2, z: -15 },
            { x: 2.2, z: 65 },
            { x: -2.2, z: 95 }
        ];
        manholePositions.forEach(pos => {
            const manhole = new THREE.Mesh(manholeGeo, Materials.manhole);
            manhole.position.set(pos.x, 0.02, pos.z);
            manhole.receiveShadow = true;
            this.group.add(manhole);
        });
        const drainGeo = new THREE.PlaneGeometry(0.8, 1.4);
        drainGeo.rotateX(-Math.PI / 2);
        const drainZ = [-70, -35, 2, 48, 85];
        drainZ.forEach(z => {
            const drainL = new THREE.Mesh(drainGeo, Materials.stormDrain);
            drainL.position.set(-this.roadWidth / 2 + 0.45, 0.019, z);
            this.group.add(drainL);
            const drainR = new THREE.Mesh(drainGeo, Materials.stormDrain);
            drainR.position.set(this.roadWidth / 2 - 0.45, 0.019, z);
            this.group.add(drainR);
        });
    }
}
