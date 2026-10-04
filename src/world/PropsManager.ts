import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { RoadGraph, SignalVisuals } from './RoadGraph';
import { SkyEnvironment } from '../rendering/SkyEnvironment';
import { CITY_CONFIG } from './CityConfig';
export class PropsManager {
    public group: THREE.Group;
    private roadGraph: RoadGraph;
    private skyEnv: SkyEnvironment;
    private localStreetLightPool: THREE.SpotLight[] = [];
    constructor(roadGraph: RoadGraph, skyEnv: SkyEnvironment) {
        this.group = new THREE.Group();
        this.group.name = 'PropsManager';
        this.roadGraph = roadGraph;
        this.skyEnv = skyEnv;
        this.placeIntersectionSignals();
        this.placeGridStreetLamps();
        this.placeStreetFurnitureAndSigns();
        this.placeVegetation();
        this.initLocalStreetLights();
    }
    private initLocalStreetLights() {
        for (let i = 0; i < 2; i++) {
            const spot = new THREE.SpotLight(0xfff3e0, 3.2, 28, Math.PI / 3.5, 0.5, 1.2);
            spot.position.set(0, 8.0, 0);
            spot.target.position.set(0, 0, 0);
            spot.castShadow = i === 0;
            if (spot.castShadow) {
                spot.shadow.mapSize.width = 512;
                spot.shadow.mapSize.height = 512;
                spot.shadow.bias = -0.001;
            }
            this.localStreetLightPool.push(spot);
            this.group.add(spot);
            this.group.add(spot.target);
            this.skyEnv.registerStreetLight(spot);
        }
    }
    public update(playerPos: THREE.Vector3) {
        if (this.localStreetLightPool.length >= 2) {
            this.localStreetLightPool[0].position.set(playerPos.x + 8.0, 8.0, playerPos.z + 14.0);
            this.localStreetLightPool[0].target.position.set(playerPos.x, 0, playerPos.z + 14.0);
            this.localStreetLightPool[1].position.set(playerPos.x - 8.0, 8.0, playerPos.z - 14.0);
            this.localStreetLightPool[1].target.position.set(playerPos.x, 0, playerPos.z - 14.0);
        }
    }
    private placeIntersectionSignals() {
        this.roadGraph.nodes.forEach(node => {
            const gantryGroup = new THREE.Group();
            gantryGroup.position.set(node.x, 0, node.z);
            const visuals: SignalVisuals = {
                nsRed: [],
                nsYellow: [],
                nsGreen: [],
                ewRed: [],
                ewYellow: [],
                ewGreen: []
            };
            const corners = [
                { x: 11.5, z: -11.5, rotY: 0, isNS: true },
                { x: -11.5, z: 11.5, rotY: Math.PI, isNS: true },
                { x: 11.5, z: 11.5, rotY: -Math.PI / 2, isNS: false },
                { x: -11.5, z: -11.5, rotY: Math.PI / 2, isNS: false }
            ];
            corners.forEach(c => {
                const post = this.createSignalGantry(c.isNS, visuals);
                post.position.set(c.x, 0, c.z);
                post.rotation.y = c.rotY;
                gantryGroup.add(post);
            });
            this.group.add(gantryGroup);
            this.roadGraph.registerSignalVisuals(node.id, visuals);
        });
    }
    private createSignalGantry(isNS: boolean, visuals: SignalVisuals): THREE.Group {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 8.0, 10), Materials.trafficPoleYellow);
        pole.position.y = 4.0;
        pole.castShadow = true;
        group.add(pole);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 8.5, 8), Materials.trafficPoleYellow);
        arm.rotateZ(Math.PI / 2);
        arm.position.set(-4.0, 7.5, 0);
        arm.castShadow = true;
        group.add(arm);
        const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.25, 0.35), Materials.trafficSignalHousing);
        headBox.position.set(-3.5, 7.0, 0);
        group.add(headBox);
        const rMat = Materials.signalRed.clone();
        const yMat = Materials.signalAmber.clone();
        const gMat = Materials.signalGreen.clone();
        if (isNS) {
            visuals.nsRed.push(rMat);
            visuals.nsYellow.push(yMat);
            visuals.nsGreen.push(gMat);
        }
        else {
            visuals.ewRed.push(rMat);
            visuals.ewYellow.push(yMat);
            visuals.ewGreen.push(gMat);
        }
        const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), rMat);
        redLens.rotateX(Math.PI / 2);
        redLens.position.set(-3.5, 7.38, 0.18);
        group.add(redLens);
        const yellowLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), yMat);
        yellowLens.rotateX(Math.PI / 2);
        yellowLens.position.set(-3.5, 7.0, 0.18);
        group.add(yellowLens);
        const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), gMat);
        greenLens.rotateX(Math.PI / 2);
        greenLens.position.set(-3.5, 6.62, 0.18);
        group.add(greenLens);
        return group;
    }
    private placeGridStreetLamps() {
        this.roadGraph.segments.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId)!;
            const endNode = this.roadGraph.nodes.get(seg.endNodeId)!;
            const p1 = new THREE.Vector3(startNode.x, 0, startNode.z);
            const p2 = new THREE.Vector3(endNode.x, 0, endNode.z);
            const dir = new THREE.Vector3().subVectors(p2, p1);
            const length = dir.length();
            const normDir = dir.clone().normalize();
            const right = new THREE.Vector3(-normDir.z, 0, normDir.x);
            const lampSpacing = 42.0;
            const count = Math.floor(length / lampSpacing);
            const halfWidth = seg.width / 2 + 1.2;
            for (let i = 1; i <= count; i++) {
                const t = (i * lampSpacing) / length;
                if (t > 0.88 || t < 0.12)
                    continue;
                const center = new THREE.Vector3().lerpVectors(p1, p2, t);
                const side = i % 2 === 0 ? 1 : -1;
                const lampPos = center.clone().addScaledVector(right, side * halfWidth);
                const lampAngle = Math.atan2(normDir.x, normDir.z) + (side > 0 ? -Math.PI / 2 : Math.PI / 2);
                this.createStreetLamp(lampPos.x, lampPos.z, lampAngle);
            }
        });
    }
    private createStreetLamp(x: number, z: number, rotY: number) {
        const lamp = new THREE.Group();
        lamp.position.set(x, 0, z);
        lamp.rotation.y = rotY;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 8.0, 8), Materials.darkSteel);
        pole.position.y = 4.0;
        pole.castShadow = true;
        lamp.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 2.8), Materials.darkSteel);
        arm.position.set(0, 8.0, 1.2);
        arm.rotation.x = -0.15;
        lamp.add(arm);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.9), Materials.darkSteel);
        head.position.set(0, 8.2, 2.4);
        lamp.add(head);
        const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.7), new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffeedd,
            emissiveIntensity: 2.8
        }));
        lens.rotateX(Math.PI / 2);
        lens.position.set(0, 8.13, 2.4);
        lamp.add(lens);
        this.group.add(lamp);
    }
    private placeStreetFurnitureAndSigns() {
        const streetSigns = [
            { x: -11.5, z: -25, text: '5TH AVENUE' },
            { x: 11.5, z: 25, text: 'GRAND AVENUE' },
            { x: -11.5, z: 85, text: 'COMMERCE WAY' },
            { x: 121.5, z: 25, text: 'BROADWAY' }
        ];
        streetSigns.forEach(s => {
            const signGroup = this.createStreetNameSign(s.text);
            signGroup.position.set(s.x, 0, s.z);
            this.group.add(signGroup);
        });
        const shelterPositions = [
            { x: -11.8, z: -35, rotY: Math.PI / 2 },
            { x: 11.8, z: 75, rotY: -Math.PI / 2 },
            { x: 98.0, z: 11.8, rotY: 0 }
        ];
        shelterPositions.forEach(p => {
            const shelter = this.createBusShelter();
            shelter.position.set(p.x, 0, p.z);
            shelter.rotation.y = p.rotY;
            this.group.add(shelter);
        });
        [-1, 1].forEach(side => {
            for (let z = -80; z <= 80; z += 40) {
                if (Math.abs(z) < 15)
                    continue;
                const x = side * 11.5;
                const hyd = this.createHydrant();
                hyd.position.set(x, 0, z);
                this.group.add(hyd);
                const bench = this.createBench();
                bench.position.set(x + side * 1.5, 0, z + 8);
                bench.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
                this.group.add(bench);
            }
        });
    }
    private createStreetNameSign(streetName: string): THREE.Group {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 8), Materials.darkSteel);
        pole.position.y = 1.7;
        group.add(pole);
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 500, 116);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(streetName, 256, 64);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }));
        sign.position.set(0, 3.1, 0.05);
        group.add(sign);
        return group;
    }
    private createBusShelter(): THREE.Group {
        const shelter = new THREE.Group();
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 2.2), Materials.darkSteel);
        roof.position.set(0, 2.6, 0);
        roof.castShadow = true;
        shelter.add(roof);
        const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 0.06), Materials.glassShelter);
        rearGlass.position.set(0, 1.2, -1.0);
        shelter.add(rearGlass);
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.45), Materials.benchWood);
        bench.position.set(0, 0.48, -0.6);
        shelter.add(bench);
        return shelter;
    }
    private createHydrant(): THREE.Group {
        const hyd = new THREE.Group();
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.75, 10), Materials.fireHydrantRed);
        barrel.position.y = 0.38;
        barrel.castShadow = true;
        hyd.add(barrel);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), Materials.fireHydrantRed);
        dome.position.y = 0.75;
        hyd.add(dome);
        return hyd;
    }
    private createBench(): THREE.Group {
        const bench = new THREE.Group();
        const legGeo = new THREE.BoxGeometry(0.08, 0.65, 0.6);
        const legL = new THREE.Mesh(legGeo, Materials.darkSteel);
        legL.position.set(-0.9, 0.32, 0);
        bench.add(legL);
        const legR = new THREE.Mesh(legGeo, Materials.darkSteel);
        legR.position.set(0.9, 0.32, 0);
        bench.add(legR);
        for (let i = 0; i < 4; i++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.1), Materials.benchWood);
            slat.position.set(0, 0.45, -0.2 + i * 0.12);
            slat.castShadow = true;
            bench.add(slat);
        }
        return bench;
    }
    private placeVegetation() {
        this.roadGraph.segments.forEach(seg => {
            const startNode = this.roadGraph.nodes.get(seg.startNodeId)!;
            const endNode = this.roadGraph.nodes.get(seg.endNodeId)!;
            const p1 = new THREE.Vector3(startNode.x, 0, startNode.z);
            const p2 = new THREE.Vector3(endNode.x, 0, endNode.z);
            const dir = new THREE.Vector3().subVectors(p2, p1);
            const length = dir.length();
            const normDir = dir.clone().normalize();
            const right = new THREE.Vector3(-normDir.z, 0, normDir.x);
            const treeSpacing = 35.0;
            const count = Math.floor(length / treeSpacing);
            const offsetDist = seg.width / 2 + 2.4;
            for (let i = 1; i <= count; i++) {
                const t = (i * treeSpacing) / length;
                if (t > 0.85 || t < 0.15)
                    continue;
                const center = new THREE.Vector3().lerpVectors(p1, p2, t);
                [-1, 1].forEach(side => {
                    const treePos = center.clone().addScaledVector(right, side * offsetDist);
                    this.createTree(treePos.x, treePos.z);
                });
            }
        });
    }
    private createTree(x: number, z: number) {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 4.2, 10), Materials.treeBark);
        trunk.position.y = 2.1;
        trunk.castShadow = true;
        tree.add(trunk);
        const grate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.02, 1.8), Materials.darkSteel);
        grate.position.y = 0.185;
        tree.add(grate);
        const clusters = [
            { x: 0, y: 5.6, z: 0, r: 2.2, col: 0x2d7a3e },
            { x: 1.0, y: 5.2, z: 0.4, r: 1.6, col: 0x389e52 },
            { x: -0.9, y: 5.3, z: -0.5, r: 1.7, col: 0x246633 },
            { x: 0.2, y: 6.6, z: 0.1, r: 1.5, col: 0x3ea95c }
        ];
        clusters.forEach(c => {
            const folMat = new THREE.MeshStandardMaterial({ color: c.col, roughness: 0.65 });
            const fol = new THREE.Mesh(new THREE.SphereGeometry(c.r, 10, 8), folMat);
            fol.position.set(c.x, c.y, c.z);
            fol.castShadow = true;
            tree.add(fol);
        });
        this.group.add(tree);
    }
}
