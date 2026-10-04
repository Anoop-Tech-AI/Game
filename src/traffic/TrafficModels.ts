import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { TextureGenerator } from '../rendering/TextureGenerator';
export type TrafficVehicleType = 'sedan' | 'suv' | 'hatchback' | 'truck';
export interface TrafficModelInstance {
    group: THREE.Group;
    wheels: THREE.Group[];
    frontPivots: THREE.Group[];
    taillightMesh?: THREE.Mesh;
    headlightMesh?: THREE.Mesh;
    bodyMesh: THREE.Mesh;
    length: number;
    width: number;
    height: number;
}
const VEHICLE_COLORS = [
    0x1e293b,
    0xf8fafc,
    0x0f172a,
    0x64748b,
    0x1e3a8a,
    0x991b1b,
    0x065f46,
    0x78350f,
    0x374151
];
export class TrafficModels {
    public static createVehicle(type: TrafficVehicleType = 'sedan', colorHex?: number): TrafficModelInstance {
        const color = colorHex !== undefined ? colorHex : VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];
        const group = new THREE.Group();
        const wheels: THREE.Group[] = [];
        const frontPivots: THREE.Group[] = [];
        const paintMat = new THREE.MeshPhysicalMaterial({
            color,
            metalness: 0.75,
            roughness: 0.18,
            clearcoat: 0.9,
            clearcoatRoughness: 0.05
        });
        let length = 4.4;
        let width = 1.95;
        let height = 1.38;
        let bodyMesh: THREE.Mesh;
        let taillightMesh: THREE.Mesh;
        if (type === 'suv') {
            length = 4.7;
            width = 2.05;
            height = 1.68;
            const bodyGeo = new THREE.BoxGeometry(width - 0.1, 0.55, length);
            bodyMesh = new THREE.Mesh(bodyGeo, paintMat);
            bodyMesh.position.y = 0.55;
            bodyMesh.castShadow = true;
            group.add(bodyMesh);
            const cabinGeo = new THREE.BoxGeometry(width - 0.25, 0.65, length * 0.62);
            const cabin = new THREE.Mesh(cabinGeo, Materials.carTintedGlass);
            cabin.position.set(0, 1.15, -0.3);
            cabin.castShadow = true;
            group.add(cabin);
            [-0.7, 0.7].forEach(rx => {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, length * 0.55), Materials.carChrome);
                rail.position.set(rx, 1.5, -0.3);
                group.add(rail);
            });
        }
        else if (type === 'hatchback') {
            length = 3.9;
            width = 1.85;
            height = 1.42;
            const bodyGeo = new THREE.BoxGeometry(width - 0.1, 0.48, length);
            bodyMesh = new THREE.Mesh(bodyGeo, paintMat);
            bodyMesh.position.y = 0.48;
            bodyMesh.castShadow = true;
            group.add(bodyMesh);
            const cabinGeo = new THREE.BoxGeometry(width - 0.22, 0.58, length * 0.55);
            const cabin = new THREE.Mesh(cabinGeo, Materials.carTintedGlass);
            cabin.position.set(0, 1.0, -0.25);
            cabin.castShadow = true;
            group.add(cabin);
        }
        else if (type === 'truck') {
            length = 6.8;
            width = 2.25;
            height = 2.45;
            const cabGeo = new THREE.BoxGeometry(width - 0.15, 1.4, 2.2);
            bodyMesh = new THREE.Mesh(cabGeo, paintMat);
            bodyMesh.position.set(0, 1.1, 1.8);
            bodyMesh.castShadow = true;
            group.add(bodyMesh);
            const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.7, 1.1), Materials.carTintedGlass);
            cabGlass.position.set(0, 1.5, 2.0);
            group.add(cabGlass);
            const boxGeo = new THREE.BoxGeometry(width, 2.2, 4.4);
            const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(0, 1.5, -1.1);
            box.castShadow = true;
            group.add(box);
        }
        else {
            length = 4.5;
            width = 1.95;
            height = 1.38;
            const bodyGeo = new THREE.BoxGeometry(width - 0.1, 0.45, length);
            bodyMesh = new THREE.Mesh(bodyGeo, paintMat);
            bodyMesh.position.y = 0.48;
            bodyMesh.castShadow = true;
            group.add(bodyMesh);
            const cabinGeo = new THREE.BoxGeometry(width - 0.24, 0.52, length * 0.52);
            const cabin = new THREE.Mesh(cabinGeo, Materials.carTintedGlass);
            cabin.position.set(0, 0.98, -0.2);
            cabin.castShadow = true;
            group.add(cabin);
            const trunkGeo = new THREE.BoxGeometry(width - 0.15, 0.22, 0.9);
            const trunk = new THREE.Mesh(trunkGeo, paintMat);
            trunk.position.set(0, 0.65, -1.65);
            group.add(trunk);
        }
        const wheelRadius = type === 'truck' ? 0.42 : (type === 'suv' ? 0.38 : 0.33);
        const halfTrack = (width - 0.15) / 2;
        const halfBase = (length - 1.2) / 2;
        const wheelPos = [
            { x: -halfTrack, z: halfBase, isFront: true },
            { x: halfTrack, z: halfBase, isFront: true },
            { x: -halfTrack, z: -halfBase, isFront: false },
            { x: halfTrack, z: -halfBase, isFront: false },
        ];
        wheelPos.forEach(p => {
            const pivot = new THREE.Group();
            pivot.position.set(p.x, wheelRadius, p.z);
            group.add(pivot);
            if (p.isFront) {
                frontPivots.push(pivot);
            }
            const spinGroup = new THREE.Group();
            pivot.add(spinGroup);
            const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.24, 18);
            tireGeo.rotateZ(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, Materials.carTireRubber);
            tire.castShadow = true;
            spinGroup.add(tire);
            const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, 0.245, 12);
            rimGeo.rotateZ(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeo, Materials.carWheelAlloy);
            spinGroup.add(rim);
            wheels.push(spinGroup);
        });
        const hlGeo = new THREE.PlaneGeometry(0.32, 0.14);
        hlGeo.rotateY(Math.PI / 2);
        const hlL = new THREE.Mesh(hlGeo, Materials.carHeadlightCluster);
        hlL.position.set(-width / 2 + 0.18, 0.52, length / 2 + 0.01);
        group.add(hlL);
        const hlR = new THREE.Mesh(hlGeo, Materials.carHeadlightCluster);
        hlR.position.set(width / 2 - 0.18, 0.52, length / 2 + 0.01);
        group.add(hlR);
        const tlGeo = new THREE.BoxGeometry(width - 0.35, 0.08, 0.04);
        taillightMesh = new THREE.Mesh(tlGeo, Materials.carTaillightLit);
        taillightMesh.position.set(0, 0.58, -length / 2 - 0.02);
        group.add(taillightMesh);
        return {
            group,
            wheels,
            frontPivots,
            taillightMesh,
            bodyMesh,
            length,
            width,
            height
        };
    }
}
