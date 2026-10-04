import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { TextureGenerator } from '../rendering/TextureGenerator';
import { CollisionBox } from '../vehicle/CarController';
export interface BuildingConfig {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    floors: number;
    style: 'modern_glass' | 'corporate' | 'apartment' | 'brick';
    storeName?: string;
    storeColor?: string;
    hasBalconies?: boolean;
    hasCanopy?: boolean;
    hasWaterTower?: boolean;
}
export class BuildingGenerator {
    public group: THREE.Group;
    public colliders: CollisionBox[] = [];
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'Buildings';
        this.generateStreetBuildings();
        this.generateSkylineBackdrop();
    }
    private generateStreetBuildings() {
        const buildings: BuildingConfig[] = [
            {
                x: -24,
                z: -62,
                width: 22,
                depth: 32,
                height: 56,
                floors: 14,
                style: 'modern_glass',
                storeName: 'ZENITH FINANCIAL',
                storeColor: '#00e5ff',
                hasCanopy: true
            },
            {
                x: -23,
                z: -22,
                width: 20,
                depth: 28,
                height: 36,
                floors: 9,
                style: 'apartment',
                storeName: 'CAFE VERONA',
                storeColor: '#f59e0b',
                hasBalconies: true
            },
            {
                x: -24,
                z: 52,
                width: 22,
                depth: 30,
                height: 68,
                floors: 17,
                style: 'corporate',
                storeName: 'NEXUS TOWER',
                storeColor: '#38bdf8',
                hasCanopy: true
            },
            {
                x: -22,
                z: 88,
                width: 18,
                depth: 26,
                height: 28,
                floors: 7,
                style: 'brick',
                storeName: 'METRO BISTRO',
                storeColor: '#ef4444',
                hasWaterTower: true
            },
            {
                x: 24,
                z: -64,
                width: 22,
                depth: 30,
                height: 62,
                floors: 15,
                style: 'corporate',
                storeName: 'THE VANGUARD',
                storeColor: '#eab308',
                hasCanopy: true
            },
            {
                x: 23,
                z: -25,
                width: 20,
                depth: 28,
                height: 32,
                floors: 8,
                style: 'modern_glass',
                storeName: 'MODA STUDIOS',
                storeColor: '#ec4899',
                hasCanopy: false
            },
            {
                x: 24,
                z: 50,
                width: 22,
                depth: 28,
                height: 52,
                floors: 13,
                style: 'modern_glass',
                storeName: 'HORIZON LABS',
                storeColor: '#06b6d4',
                hasCanopy: true
            },
            {
                x: 23,
                z: 86,
                width: 20,
                depth: 28,
                height: 40,
                floors: 10,
                style: 'apartment',
                storeName: 'APEX RESIDENCES',
                storeColor: '#10b981',
                hasBalconies: true,
                hasWaterTower: true
            }
        ];
        buildings.forEach(cfg => {
            this.createBuilding(cfg);
        });
    }
    private createBuilding(cfg: BuildingConfig) {
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(cfg.x, 0, cfg.z);
        const isWest = cfg.x < 0;
        let facadeMat: THREE.Material = Materials.modernGlassBuilding;
        if (cfg.style === 'apartment')
            facadeMat = Materials.apartmentBuilding;
        else if (cfg.style === 'brick')
            facadeMat = Materials.brickBuilding;
        else if (cfg.style === 'corporate')
            facadeMat = Materials.corporateBuilding;
        const wallMat = Materials.corporateBuilding;
        const materials = [
            isWest ? facadeMat : wallMat,
            isWest ? wallMat : facadeMat,
            Materials.roofGravel,
            wallMat,
            wallMat,
            wallMat
        ];
        const mainHeight = cfg.height - 5.5;
        const coreGeo = new THREE.BoxGeometry(cfg.width, mainHeight, cfg.depth);
        const coreMesh = new THREE.Mesh(coreGeo, materials);
        coreMesh.position.set(0, 5.5 + mainHeight / 2, 0);
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        buildingGroup.add(coreMesh);
        const streetFacingX = (cfg.width / 2 + 0.12) * (isWest ? 1 : -1);
        const floorH = mainHeight / cfg.floors;
        for (let f = 1; f < cfg.floors; f++) {
            const corniceGeo = new THREE.BoxGeometry(0.24, 0.25, cfg.depth);
            const cornice = new THREE.Mesh(corniceGeo, Materials.curb);
            cornice.position.set(streetFacingX, 5.5 + f * floorH, 0);
            cornice.castShadow = true;
            buildingGroup.add(cornice);
        }
        const storeHeight = 5.5;
        const storeGeo = new THREE.BoxGeometry(cfg.width, storeHeight, cfg.depth);
        const storeMesh = new THREE.Mesh(storeGeo, Materials.darkSteel);
        storeMesh.position.set(0, storeHeight / 2, 0);
        storeMesh.castShadow = true;
        storeMesh.receiveShadow = true;
        buildingGroup.add(storeMesh);
        if (cfg.storeName) {
            const storeTex = TextureGenerator.createStorefrontTexture(cfg.storeName, cfg.storeColor || '#38bdf8');
            const storeMat = new THREE.MeshStandardMaterial({
                map: storeTex,
                roughness: 0.2,
                metalness: 0.2
            });
            const storeFaceGeo = new THREE.PlaneGeometry(cfg.depth - 2, storeHeight - 0.4);
            const storeFace = new THREE.Mesh(storeFaceGeo, storeMat);
            if (isWest) {
                storeFace.rotation.y = Math.PI / 2;
                storeFace.position.set(cfg.width / 2 + 0.06, storeHeight / 2, 0);
            }
            else {
                storeFace.rotation.y = -Math.PI / 2;
                storeFace.position.set(-cfg.width / 2 - 0.06, storeHeight / 2, 0);
            }
            buildingGroup.add(storeFace);
        }
        if (cfg.hasCanopy) {
            const canopyW = 4.4;
            const canopyD = 8.5;
            const canopyGeo = new THREE.BoxGeometry(canopyW, 0.25, canopyD);
            const canopy = new THREE.Mesh(canopyGeo, Materials.darkSteel);
            const canX = isWest ? (cfg.width / 2 + canopyW / 2) : (-cfg.width / 2 - canopyW / 2);
            canopy.position.set(canX, 4.6, 0);
            canopy.castShadow = true;
            buildingGroup.add(canopy);
            const entranceLight = new THREE.PointLight(0xffeedd, 2.5, 12, 1.5);
            entranceLight.position.set(canX, 4.2, 0);
            buildingGroup.add(entranceLight);
        }
        if (cfg.hasBalconies) {
            const balconyFloors = [10, 16, 22, 28];
            balconyFloors.forEach(bY => {
                if (bY < cfg.height - 4) {
                    [-5, 5].forEach(bZ => {
                        const balGeo = new THREE.BoxGeometry(1.8, 0.16, 4.5);
                        const balMesh = new THREE.Mesh(balGeo, Materials.curb);
                        const balX = isWest ? (cfg.width / 2 + 0.9) : (-cfg.width / 2 - 0.9);
                        balMesh.position.set(balX, bY, bZ);
                        balMesh.castShadow = true;
                        buildingGroup.add(balMesh);
                        const railGeo = new THREE.BoxGeometry(1.8, 1.0, 4.5);
                        const railMesh = new THREE.Mesh(railGeo, Materials.carTintedGlass);
                        railMesh.position.set(balX, bY + 0.58, bZ);
                        buildingGroup.add(railMesh);
                    });
                }
            });
        }
        const parapetH = 1.3;
        const parapetGeo = new THREE.BoxGeometry(cfg.width + 0.4, parapetH, cfg.depth + 0.4);
        const parapetMesh = new THREE.Mesh(parapetGeo, Materials.curb);
        parapetMesh.position.set(0, cfg.height + parapetH / 2, 0);
        buildingGroup.add(parapetMesh);
        const phGeo = new THREE.BoxGeometry(6.5, 4.0, 7.5);
        const phMesh = new THREE.Mesh(phGeo, Materials.corporateBuilding);
        phMesh.position.set(0, cfg.height + 2.0, 0);
        phMesh.castShadow = true;
        buildingGroup.add(phMesh);
        [-cfg.width / 4, cfg.width / 4].forEach(hx => {
            const hvacGeo = new THREE.BoxGeometry(3.4, 2.4, 4.0);
            const hvac = new THREE.Mesh(hvacGeo, Materials.roofEquipmentMetal);
            hvac.position.set(hx, cfg.height + 1.2, cfg.depth / 4);
            hvac.castShadow = true;
            buildingGroup.add(hvac);
            const fanGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.22, 16);
            const fan = new THREE.Mesh(fanGeo, Materials.darkSteel);
            fan.position.set(hx, cfg.height + 2.4, cfg.depth / 4);
            buildingGroup.add(fan);
        });
        if (cfg.hasWaterTower) {
            const wtGroup = new THREE.Group();
            wtGroup.position.set(0, cfg.height + 0.2, -cfg.depth / 4);
            const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 6);
            [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(legGeo, Materials.darkSteel);
                leg.position.set(lx, 1.9, lz);
                wtGroup.add(leg);
            });
            const tankGeo = new THREE.CylinderGeometry(1.9, 1.9, 3.0, 16);
            const tank = new THREE.Mesh(tankGeo, Materials.benchWood);
            tank.position.set(0, 4.6, 0);
            wtGroup.add(tank);
            const roofConeGeo = new THREE.ConeGeometry(2.1, 1.1, 16);
            const cone = new THREE.Mesh(roofConeGeo, Materials.darkSteel);
            cone.position.set(0, 6.6, 0);
            wtGroup.add(cone);
            buildingGroup.add(wtGroup);
        }
        const mastGeo = new THREE.CylinderGeometry(0.06, 0.15, 8.5, 8);
        const mast = new THREE.Mesh(mastGeo, Materials.roofEquipmentMetal);
        mast.position.set(0, cfg.height + 4.25 + 4.0, 0);
        buildingGroup.add(mast);
        const beaconGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const beacon = new THREE.Mesh(beaconGeo, Materials.signalRed);
        beacon.position.set(0, cfg.height + 8.5 + 4.0, 0);
        buildingGroup.add(beacon);
        this.group.add(buildingGroup);
        this.colliders.push({
            minX: cfg.x - cfg.width / 2,
            maxX: cfg.x + cfg.width / 2,
            minZ: cfg.z - cfg.depth / 2,
            maxZ: cfg.z + cfg.depth / 2,
            height: cfg.height
        });
    }
    private generateSkylineBackdrop() {
        const skylineData = [
            { x: -50, z: 145, w: 32, d: 32, h: 95 },
            { x: -14, z: 155, w: 26, d: 26, h: 110 },
            { x: 18, z: 155, w: 28, d: 28, h: 85 },
            { x: 55, z: 145, w: 34, d: 34, h: 105 },
            { x: -50, z: -130, w: 30, d: 30, h: 88 },
            { x: -12, z: -140, w: 25, d: 25, h: 102 },
            { x: 16, z: -140, w: 28, d: 28, h: 92 },
            { x: 52, z: -130, w: 32, d: 32, h: 80 }
        ];
        skylineData.forEach(s => {
            const bGeo = new THREE.BoxGeometry(s.w, s.h, s.d);
            const bMesh = new THREE.Mesh(bGeo, Materials.corporateBuilding);
            bMesh.position.set(s.x, s.h / 2, s.z);
            bMesh.castShadow = true;
            this.group.add(bMesh);
            this.colliders.push({
                minX: s.x - s.w / 2,
                maxX: s.x + s.w / 2,
                minZ: s.z - s.d / 2,
                maxZ: s.z + s.d / 2,
                height: s.h
            });
        });
    }
}
