import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
export class Vegetation {
    public group: THREE.Group;
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'Vegetation';
        this.placeStreetTrees();
        this.placeSidewalkPlanters();
    }
    private placeStreetTrees() {
        const treeLocations = [
            { x: -9.5, z: -48, scale: 1.05, rot: 0.2 },
            { x: 9.5, z: -28, scale: 0.95, rot: 1.4 },
            { x: -9.5, z: -5, scale: 1.12, rot: 2.8 },
            { x: 9.5, z: 15, scale: 1.0, rot: 0.8 },
            { x: -9.5, z: 55, scale: 0.92, rot: 2.1 },
            { x: 9.5, z: 72, scale: 1.08, rot: 3.5 },
            { x: -9.5, z: 88, scale: 0.98, rot: 1.1 }
        ];
        treeLocations.forEach(loc => {
            const tree = this.createTree(loc.scale, loc.rot);
            tree.position.set(loc.x, 0, loc.z);
            this.group.add(tree);
            const grate = this.createTreeGrate();
            grate.position.set(loc.x, 0.185, loc.z);
            this.group.add(grate);
        });
    }
    private createTree(scale: number, rotY: number): THREE.Group {
        const tree = new THREE.Group();
        tree.rotation.y = rotY;
        tree.scale.set(scale, scale, scale);
        const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 4.2, 12);
        const trunk = new THREE.Mesh(trunkGeo, Materials.treeBark);
        trunk.position.y = 2.1;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);
        const rootGeo = new THREE.CylinderGeometry(0.36, 0.52, 0.45, 12);
        const root = new THREE.Mesh(rootGeo, Materials.treeBark);
        root.position.y = 0.22;
        tree.add(root);
        const branchGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 8);
        const b1 = new THREE.Mesh(branchGeo, Materials.treeBark);
        b1.position.set(0.45, 3.8, 0.25);
        b1.rotation.z = -0.58;
        b1.castShadow = true;
        tree.add(b1);
        const b2 = new THREE.Mesh(branchGeo, Materials.treeBark);
        b2.position.set(-0.4, 3.9, -0.32);
        b2.rotation.z = 0.55;
        b2.rotation.y = 0.85;
        b2.castShadow = true;
        tree.add(b2);
        const b3 = new THREE.Mesh(branchGeo, Materials.treeBark);
        b3.position.set(0.12, 4.0, 0.48);
        b3.rotation.x = 0.52;
        b3.castShadow = true;
        tree.add(b3);
        const b4 = new THREE.Mesh(branchGeo, Materials.treeBark);
        b4.position.set(-0.15, 4.1, -0.42);
        b4.rotation.x = -0.48;
        b4.castShadow = true;
        tree.add(b4);
        const leafClusters = [
            { x: 0.0, y: 5.8, z: 0.0, rx: 2.2, ry: 1.8, rz: 2.2, col: 0x2d7a3e },
            { x: 1.1, y: 5.2, z: 0.5, rx: 1.7, ry: 1.5, rz: 1.6, col: 0x389e52 },
            { x: -1.0, y: 5.3, z: -0.6, rx: 1.8, ry: 1.5, rz: 1.7, col: 0x246633 },
            { x: 0.3, y: 5.4, z: 1.2, rx: 1.6, ry: 1.4, rz: 1.6, col: 0x348e4b },
            { x: -0.5, y: 5.5, z: -1.1, rx: 1.6, ry: 1.4, rz: 1.5, col: 0x277437 },
            { x: 0.0, y: 6.8, z: 0.2, rx: 1.6, ry: 1.4, rz: 1.5, col: 0x3ea95c },
            { x: 0.7, y: 6.2, z: -0.5, rx: 1.4, ry: 1.3, rz: 1.4, col: 0x2d7a3e },
            { x: -0.6, y: 6.3, z: 0.6, rx: 1.5, ry: 1.3, rz: 1.4, col: 0x389e52 }
        ];
        leafClusters.forEach(c => {
            const folGeo = new THREE.SphereGeometry(1.0, 12, 10);
            folGeo.scale(c.rx, c.ry, c.rz);
            const folMat = new THREE.MeshStandardMaterial({
                color: c.col,
                roughness: 0.65,
                metalness: 0.05
            });
            const folMesh = new THREE.Mesh(folGeo, folMat);
            folMesh.position.set(c.x, c.y, c.z);
            folMesh.castShadow = true;
            folMesh.receiveShadow = true;
            tree.add(folMesh);
        });
        return tree;
    }
    private createTreeGrate(): THREE.Group {
        const grate = new THREE.Group();
        const frameGeo = new THREE.BoxGeometry(1.8, 0.02, 1.8);
        const frame = new THREE.Mesh(frameGeo, Materials.darkSteel);
        grate.add(frame);
        const soilGeo = new THREE.CircleGeometry(0.55, 16);
        soilGeo.rotateX(-Math.PI / 2);
        const soil = new THREE.Mesh(soilGeo, Materials.soil);
        soil.position.y = 0.015;
        grate.add(soil);
        return grate;
    }
    private placeSidewalkPlanters() {
        const planterLocations = [
            { x: -10.2, z: -22 },
            { x: 10.2, z: -48 },
            { x: -10.2, z: 35 },
            { x: 10.2, z: 88 }
        ];
        planterLocations.forEach(loc => {
            const planter = new THREE.Group();
            planter.position.set(loc.x, 0.18, loc.z);
            const boxGeo = new THREE.BoxGeometry(1.6, 0.55, 3.2);
            const box = new THREE.Mesh(boxGeo, Materials.curb);
            box.position.y = 0.275;
            box.castShadow = true;
            box.receiveShadow = true;
            planter.add(box);
            const soilGeo = new THREE.PlaneGeometry(1.3, 2.9);
            soilGeo.rotateX(-Math.PI / 2);
            const soil = new THREE.Mesh(soilGeo, Materials.soil);
            soil.position.y = 0.52;
            planter.add(soil);
            for (let s = -0.9; s <= 0.9; s += 0.9) {
                const shrubGeo = new THREE.SphereGeometry(0.48, 10, 8);
                shrubGeo.scale(1.2, 0.85, 1.0);
                const shrub = new THREE.Mesh(shrubGeo, Materials.shrubFoliage);
                shrub.position.set(0, 0.8, s);
                shrub.castShadow = true;
                planter.add(shrub);
            }
            this.group.add(planter);
        });
    }
}
