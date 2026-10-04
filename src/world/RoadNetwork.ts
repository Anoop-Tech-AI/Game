import * as THREE from 'three';
import { RoadGraph, RoadSegment, IntersectionNode } from './RoadGraph';
import { RoadCategory, CITY_CONFIG } from './CityConfig';
import { Materials } from '../rendering/Materials';
import { TextureGenerator } from '../rendering/TextureGenerator';
import { CollisionBox } from '../vehicle/CarController';
export class RoadNetwork {
    public group: THREE.Group;
    public roadGraph: RoadGraph;
    public colliders: CollisionBox[] = [];
    constructor(roadGraph: RoadGraph) {
        this.group = new THREE.Group();
        this.group.name = 'RoadNetwork';
        this.roadGraph = roadGraph;
        this.buildCityTerrainBase();
        this.buildAllRoadSegments();
        this.buildAllIntersections();
    }
    private buildCityTerrainBase() {
        const terrainGeo = new THREE.PlaneGeometry(1000, 1000);
        terrainGeo.rotateX(-Math.PI / 2);
        const terrainMat = new THREE.MeshStandardMaterial({
            color: 0x14171c,
            roughness: 0.92,
            metalness: 0.08
        });
        const terrain = new THREE.Mesh(terrainGeo, terrainMat);
        terrain.position.set(0, -0.06, 0);
        terrain.receiveShadow = true;
        this.group.add(terrain);
    }
    private buildAllRoadSegments() {
        this.roadGraph.segments.forEach(seg => {
            this.buildRoadSegment(seg);
        });
    }
    private buildRoadSegment(seg: RoadSegment) {
        const startNode = this.roadGraph.nodes.get(seg.startNodeId)!;
        const endNode = this.roadGraph.nodes.get(seg.endNodeId)!;
        const p1 = new THREE.Vector3(startNode.x, 0, startNode.z);
        const p2 = new THREE.Vector3(endNode.x, 0, endNode.z);
        const segVec = new THREE.Vector3().subVectors(p2, p1);
        const length = segVec.length();
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const angle = Math.atan2(segVec.x, segVec.z);
        const segGroup = new THREE.Group();
        segGroup.position.copy(midPoint);
        segGroup.rotation.y = angle;
        const roadWidth = seg.width;
        const swWidth = CITY_CONFIG.SIDEWALK_WIDTH;
        const curbW = CITY_CONFIG.CURB_WIDTH;
        const curbH = CITY_CONFIG.CURB_HEIGHT;
        const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
        roadGeo.rotateX(-Math.PI / 2);
        const roadMesh = new THREE.Mesh(roadGeo, Materials.asphalt);
        roadMesh.position.y = 0.01;
        roadMesh.receiveShadow = true;
        segGroup.add(roadMesh);
        const markGeo = new THREE.PlaneGeometry(roadWidth, length);
        markGeo.rotateX(-Math.PI / 2);
        const markMesh = new THREE.Mesh(markGeo, Materials.roadMarkings);
        markMesh.position.y = 0.018;
        markMesh.receiveShadow = true;
        segGroup.add(markMesh);
        [-1, 1].forEach(side => {
            const curbX = side * (roadWidth / 2 + curbW / 2);
            const swX = side * (roadWidth / 2 + curbW + swWidth / 2);
            const curbGeo = new THREE.BoxGeometry(curbW, curbH, length);
            const curb = new THREE.Mesh(curbGeo, Materials.curb);
            curb.position.set(curbX, curbH / 2, 0);
            curb.receiveShadow = true;
            segGroup.add(curb);
            const swGeo = new THREE.BoxGeometry(swWidth, curbH, length);
            const sw = new THREE.Mesh(swGeo, Materials.sidewalk);
            sw.position.set(swX, curbH / 2, 0);
            sw.receiveShadow = true;
            segGroup.add(sw);
        });
        if (seg.category === RoadCategory.HIGHWAY) {
            const barrierGeo = new THREE.BoxGeometry(0.6, 0.9, length);
            const barrier = new THREE.Mesh(barrierGeo, Materials.curb);
            barrier.position.set(0, 0.45, 0);
            barrier.castShadow = true;
            segGroup.add(barrier);
            const halfL = length / 2;
            this.colliders.push({
                minX: midPoint.x - (angle === 0 ? 0.4 : halfL),
                maxX: midPoint.x + (angle === 0 ? 0.4 : halfL),
                minZ: midPoint.z - (angle === 0 ? halfL : 0.4),
                maxZ: midPoint.z + (angle === 0 ? halfL : 0.4),
                height: 1.0
            });
        }
        this.group.add(segGroup);
    }
    private buildAllIntersections() {
        this.roadGraph.nodes.forEach(node => {
            this.buildIntersection(node);
        });
    }
    private buildIntersection(node: IntersectionNode) {
        const intGroup = new THREE.Group();
        intGroup.position.set(node.x, 0, node.z);
        const intSize = CITY_CONFIG.ROAD_WIDTH[RoadCategory.MAJOR_AVENUE] + CITY_CONFIG.SIDEWALK_WIDTH * 2;
        const juncGeo = new THREE.PlaneGeometry(intSize, intSize);
        juncGeo.rotateX(-Math.PI / 2);
        const junc = new THREE.Mesh(juncGeo, Materials.asphalt);
        junc.position.y = 0.012;
        junc.receiveShadow = true;
        intGroup.add(junc);
        const cwW = CITY_CONFIG.ROAD_WIDTH[RoadCategory.MAJOR_AVENUE];
        const cwGeo = new THREE.PlaneGeometry(cwW, 4.2);
        cwGeo.rotateX(-Math.PI / 2);
        const halfRoad = cwW / 2 + 2.5;
        const cwN = new THREE.Mesh(cwGeo, Materials.crosswalk);
        cwN.position.set(0, 0.022, halfRoad);
        intGroup.add(cwN);
        const cwS = new THREE.Mesh(cwGeo, Materials.crosswalk);
        cwS.position.set(0, 0.022, -halfRoad);
        cwS.rotation.y = Math.PI;
        intGroup.add(cwS);
        const cwE = new THREE.Mesh(cwGeo, Materials.crosswalk);
        cwE.position.set(halfRoad, 0.022, 0);
        cwE.rotation.y = Math.PI / 2;
        intGroup.add(cwE);
        const cwWst = new THREE.Mesh(cwGeo, Materials.crosswalk);
        cwWst.position.set(-halfRoad, 0.022, 0);
        cwWst.rotation.y = -Math.PI / 2;
        intGroup.add(cwWst);
        const manholeGeo = new THREE.CircleGeometry(0.48, 24);
        manholeGeo.rotateX(-Math.PI / 2);
        const manhole = new THREE.Mesh(manholeGeo, Materials.manhole);
        manhole.position.set(0, 0.024, 0);
        manhole.receiveShadow = true;
        intGroup.add(manhole);
        this.group.add(intGroup);
    }
}
