import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { TextureGenerator } from '../rendering/TextureGenerator';
import { DistrictType, CITY_CONFIG, getDistrictForBlock } from './CityConfig';
import { CollisionBox } from '../vehicle/CarController';
export interface LandmarkInfo {
    name: string;
    position: THREE.Vector3;
    type: string;
}
export class BuildingSystem {
    public group: THREE.Group;
    public colliders: CollisionBox[] = [];
    public landmarks: LandmarkInfo[] = [];
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'BuildingSystem';
        this.generateAllDistrictBlocks();
        this.buildLandmarks();
    }
    private generateAllDistrictBlocks() {
        const cols = CITY_CONFIG.GRID_COLS;
        const rows = CITY_CONFIG.GRID_ROWS;
        const blockSize = CITY_CONFIG.BLOCK_SIZE;
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const district = getDistrictForBlock(c, r);
                const blockCenterX = (c - cols / 2 + 0.5) * blockSize;
                const blockCenterZ = (r - rows / 2 + 0.5) * blockSize;
                if (c === 2 && r === 2) {
                    this.buildDowntownCenterBlock(blockCenterX, blockCenterZ);
                    continue;
                }
                switch (district) {
                    case DistrictType.DOWNTOWN:
                        this.buildDowntownBlock(blockCenterX, blockCenterZ, c, r);
                        break;
                    case DistrictType.COMMERCIAL:
                        this.buildCommercialBlock(blockCenterX, blockCenterZ, c, r);
                        break;
                    case DistrictType.RESIDENTIAL:
                        this.buildResidentialBlock(blockCenterX, blockCenterZ, c, r);
                        break;
                    case DistrictType.INDUSTRIAL:
                        this.buildIndustrialBlock(blockCenterX, blockCenterZ, c, r);
                        break;
                    case DistrictType.SUBURBAN:
                        this.buildSuburbanBlock(blockCenterX, blockCenterZ, c, r);
                        break;
                }
            }
        }
    }
    private buildDowntownCenterBlock(cx: number, cz: number) {
        this.createBuilding({
            x: cx - 26, z: cz - 24, w: 24, d: 34, h: 65,
            style: 'modern_glass', storeName: 'ZENITH FINANCIAL', storeColor: '#00e5ff', hasCanopy: true
        });
        this.createBuilding({
            x: cx - 26, z: cz + 24, w: 24, d: 34, h: 72,
            style: 'corporate', storeName: 'NEXUS TOWER', storeColor: '#38bdf8', hasCanopy: true
        });
        this.createBuilding({
            x: cx + 26, z: cz - 24, w: 24, d: 34, h: 58,
            style: 'corporate', storeName: 'THE VANGUARD', storeColor: '#eab308', hasCanopy: true
        });
        this.createBuilding({
            x: cx + 26, z: cz + 24, w: 24, d: 34, h: 52,
            style: 'modern_glass', storeName: 'HORIZON LABS', storeColor: '#06b6d4', hasCanopy: true
        });
    }
    private buildDowntownBlock(cx: number, cz: number, col: number, row: number) {
        const seed = (col * 31 + row * 17);
        const h1 = 55 + (seed % 35);
        const h2 = 65 + ((seed * 3) % 40);
        const h3 = 50 + ((seed * 7) % 30);
        const h4 = 60 + ((seed * 5) % 35);
        this.createBuilding({ x: cx - 24, z: cz - 24, w: 26, d: 28, h: h1, style: 'modern_glass', storeName: 'APEX METRO', storeColor: '#38bdf8' });
        this.createBuilding({ x: cx + 24, z: cz - 24, w: 26, d: 28, h: h2, style: 'corporate', storeName: 'GLOBAL BANK', storeColor: '#10b981', hasCanopy: true });
        this.createBuilding({ x: cx - 24, z: cz + 24, w: 26, d: 28, h: h3, style: 'corporate', storeName: 'ORION SUITES', storeColor: '#f59e0b' });
        this.createBuilding({ x: cx + 24, z: cz + 24, w: 26, d: 28, h: h4, style: 'modern_glass', storeName: 'TECH CORP', storeColor: '#6366f1', hasCanopy: true });
    }
    private buildCommercialBlock(cx: number, cz: number, col: number, row: number) {
        const seed = (col * 19 + row * 23);
        const h1 = 28 + (seed % 18);
        const h2 = 32 + ((seed * 2) % 16);
        const h3 = 26 + ((seed * 4) % 14);
        this.createBuilding({
            x: cx - 22, z: cz - 22, w: 32, d: 26, h: h1,
            style: 'modern_glass', storeName: 'MODA GALLERIA', storeColor: '#ec4899', hasCanopy: true
        });
        this.createBuilding({
            x: cx + 22, z: cz - 22, w: 30, d: 26, h: h2,
            style: 'apartment', storeName: 'BISTRO LUMIERE', storeColor: '#f97316', hasBalconies: true
        });
        this.createBuilding({
            x: cx - 22, z: cz + 22, w: 30, d: 26, h: h3,
            style: 'brick', storeName: 'CINEMA CENTRAL', storeColor: '#ef4444', hasCanopy: true
        });
        this.buildParkingLot(cx + 22, cz + 22, 32, 28);
    }
    private buildResidentialBlock(cx: number, cz: number, col: number, row: number) {
        const seed = (col * 13 + row * 29);
        const h1 = 24 + (seed % 16);
        const h2 = 28 + ((seed * 3) % 18);
        const h3 = 20 + ((seed * 5) % 12);
        const h4 = 22 + ((seed * 7) % 14);
        this.createBuilding({
            x: cx - 24, z: cz - 24, w: 26, d: 26, h: h1,
            style: 'apartment', storeName: 'PARK RESIDENCES', storeColor: '#10b981', hasBalconies: true
        });
        this.createBuilding({
            x: cx + 24, z: cz - 24, w: 26, d: 26, h: h2,
            style: 'apartment', storeName: 'VERONA FLATS', storeColor: '#f59e0b', hasBalconies: true
        });
        this.createBuilding({
            x: cx - 24, z: cz + 24, w: 26, d: 26, h: h3,
            style: 'brick', storeName: 'MARKET DELI', storeColor: '#3b82f6', hasWaterTower: true
        });
        this.createBuilding({
            x: cx + 24, z: cz + 24, w: 26, d: 26, h: h4,
            style: 'brick', storeName: 'CORNER BAKERY', storeColor: '#eab308'
        });
    }
    private buildIndustrialBlock(cx: number, cz: number, col: number, row: number) {
        const wh1 = new THREE.Mesh(new THREE.BoxGeometry(42, 12, 34), Materials.roofEquipmentMetal);
        wh1.position.set(cx - 18, 6, cz - 20);
        wh1.castShadow = true;
        wh1.receiveShadow = true;
        this.group.add(wh1);
        const bayDoor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), Materials.darkSteel);
        bayDoor.position.set(cx - 18, 3, cz - 2.9);
        this.group.add(bayDoor);
        this.colliders.push({ minX: cx - 39, maxX: cx + 3, minZ: cz - 37, maxZ: cz - 3, height: 12 });
        const wh2 = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 32), Materials.corporateBuilding);
        wh2.position.set(cx + 18, 5, cz + 20);
        wh2.castShadow = true;
        wh2.receiveShadow = true;
        this.group.add(wh2);
        this.colliders.push({ minX: cx - 2, maxX: cx + 38, minZ: cz + 4, maxZ: cz + 36, height: 10 });
        const containerColors = [0x1e3a8a, 0x047857, 0xb91c1c, 0xd97706];
        for (let i = 0; i < 6; i++) {
            const cGeo = new THREE.BoxGeometry(12, 3.2, 3.0);
            const cMat = new THREE.MeshStandardMaterial({
                color: containerColors[i % containerColors.length],
                roughness: 0.45,
                metalness: 0.6
            });
            const cont = new THREE.Mesh(cGeo, cMat);
            const stackLevel = i > 3 ? 3.2 : 0;
            cont.position.set(cx - 15 + (i % 3) * 14, 1.6 + stackLevel, cz + 22);
            cont.castShadow = true;
            this.group.add(cont);
            this.colliders.push({
                minX: cont.position.x - 6,
                maxX: cont.position.x + 6,
                minZ: cont.position.z - 1.5,
                maxZ: cont.position.z + 1.5,
                height: 3.5 + stackLevel
            });
        }
    }
    private buildSuburbanBlock(cx: number, cz: number, col: number, row: number) {
        const housePositions = [
            { x: cx - 24, z: cz - 24 },
            { x: cx + 24, z: cz - 24 },
            { x: cx - 24, z: cz + 24 },
            { x: cx + 24, z: cz + 24 }
        ];
        housePositions.forEach((pos, i) => {
            const house = new THREE.Group();
            house.position.set(pos.x, 0, pos.z);
            const lawnGeo = new THREE.PlaneGeometry(36, 36);
            lawnGeo.rotateX(-Math.PI / 2);
            const lawnMat = new THREE.MeshStandardMaterial({ color: 0x226b3e, roughness: 0.85 });
            const lawn = new THREE.Mesh(lawnGeo, lawnMat);
            lawn.position.y = 0.05;
            lawn.receiveShadow = true;
            house.add(lawn);
            const bodyGeo = new THREE.BoxGeometry(18, 7.5, 14);
            const body = new THREE.Mesh(bodyGeo, Materials.apartmentBuilding);
            body.position.y = 3.75;
            body.castShadow = true;
            body.receiveShadow = true;
            house.add(body);
            const roofGeo = new THREE.ConeGeometry(14, 4.5, 4);
            roofGeo.rotateY(Math.PI / 4);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = 9.75;
            roof.castShadow = true;
            house.add(roof);
            const garage = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.5), Materials.roofEquipmentMetal);
            garage.position.set(4, 2.25, 7.05);
            house.add(garage);
            const driveGeo = new THREE.PlaneGeometry(6, 11);
            driveGeo.rotateX(-Math.PI / 2);
            const drive = new THREE.Mesh(driveGeo, Materials.asphalt);
            drive.position.set(4, 0.06, 12.5);
            drive.receiveShadow = true;
            house.add(drive);
            this.group.add(house);
            this.colliders.push({
                minX: pos.x - 9,
                maxX: pos.x + 9,
                minZ: pos.z - 7,
                maxZ: pos.z + 7,
                height: 10
            });
        });
    }
    private buildLandmarks() {
        const spireX = 42;
        const spireZ = 0;
        const spireH = 135;
        const spireGroup = new THREE.Group();
        spireGroup.position.set(spireX, 0, spireZ);
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(32, 50, 32), Materials.modernGlassBuilding);
        b1.position.y = 25;
        b1.castShadow = true;
        spireGroup.add(b1);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(26, 45, 26), Materials.modernGlassBuilding);
        b2.position.y = 50 + 22.5;
        b2.castShadow = true;
        spireGroup.add(b2);
        const b3 = new THREE.Mesh(new THREE.BoxGeometry(20, 30, 20), Materials.modernGlassBuilding);
        b3.position.y = 95 + 15;
        b3.castShadow = true;
        spireGroup.add(b3);
        const spireGeo = new THREE.ConeGeometry(3, 20, 8);
        const spire = new THREE.Mesh(spireGeo, Materials.carChrome);
        spire.position.y = 125 + 10;
        spireGroup.add(spire);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), Materials.signalRed);
        beacon.position.y = 145;
        spireGroup.add(beacon);
        this.group.add(spireGroup);
        this.colliders.push({ minX: spireX - 16, maxX: spireX + 16, minZ: spireZ - 16, maxZ: spireZ + 16, height: spireH });
        this.landmarks.push({ name: 'Apex Meridian Tower', position: new THREE.Vector3(spireX, 0, spireZ), type: 'skyscraper' });
        const plazaX = 110;
        const plazaZ = 25;
        const plazaGroup = new THREE.Group();
        plazaGroup.position.set(plazaX, 0, plazaZ);
        const plazaGeo = new THREE.PlaneGeometry(45, 45);
        plazaGeo.rotateX(-Math.PI / 2);
        const plazaMesh = new THREE.Mesh(plazaGeo, Materials.sidewalk);
        plazaMesh.position.y = 0.08;
        plazaMesh.receiveShadow = true;
        plazaGroup.add(plazaMesh);
        const fountainBasin = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.5, 1.2, 24), Materials.curb);
        fountainBasin.position.y = 0.6;
        fountainBasin.castShadow = true;
        plazaGroup.add(fountainBasin);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8 });
        const water = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 0.2, 24), waterMat);
        water.position.y = 1.0;
        plazaGroup.add(water);
        const torusGeo = new THREE.TorusKnotGeometry(2.4, 0.6, 64, 16);
        const sculpture = new THREE.Mesh(torusGeo, Materials.carChrome);
        sculpture.position.y = 4.2;
        sculpture.castShadow = true;
        plazaGroup.add(sculpture);
        this.group.add(plazaGroup);
        this.colliders.push({ minX: plazaX - 7, maxX: plazaX + 7, minZ: plazaZ - 7, maxZ: plazaZ + 7, height: 6 });
        this.landmarks.push({ name: 'Grand Central Plaza', position: new THREE.Vector3(plazaX, 0, plazaZ), type: 'plaza' });
        const termX = -110;
        const termZ = 110;
        const termGroup = new THREE.Group();
        termGroup.position.set(termX, 0, termZ);
        const termBody = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 48, 24, 1, false, 0, Math.PI), Materials.modernGlassBuilding);
        termBody.rotateZ(Math.PI / 2);
        termBody.position.y = 9;
        termBody.castShadow = true;
        termGroup.add(termBody);
        const signGeo = new THREE.BoxGeometry(24, 3, 1);
        const sign = new THREE.Mesh(signGeo, Materials.darkSteel);
        sign.position.set(0, 16, 24.5);
        termGroup.add(sign);
        this.group.add(termGroup);
        this.colliders.push({ minX: termX - 25, maxX: termX + 25, minZ: termZ - 18, maxZ: termZ + 18, height: 18 });
        this.landmarks.push({ name: 'Metropolitan Terminal', position: new THREE.Vector3(termX, 0, termZ), type: 'terminal' });
    }
    private createBuilding(cfg: {
        x: number;
        z: number;
        w: number;
        d: number;
        h: number;
        style: 'modern_glass' | 'corporate' | 'apartment' | 'brick';
        storeName?: string;
        storeColor?: string;
        hasCanopy?: boolean;
        hasBalconies?: boolean;
        hasWaterTower?: boolean;
    }) {
        const bg = new THREE.Group();
        bg.position.set(cfg.x, 0, cfg.z);
        const isWest = cfg.x < 0;
        let facadeMat: THREE.Material = Materials.modernGlassBuilding;
        if (cfg.style === 'apartment')
            facadeMat = Materials.apartmentBuilding;
        else if (cfg.style === 'brick')
            facadeMat = Materials.brickBuilding;
        else if (cfg.style === 'corporate')
            facadeMat = Materials.corporateBuilding;
        const wallMat = Materials.corporateBuilding;
        const mats = [
            isWest ? facadeMat : wallMat,
            isWest ? wallMat : facadeMat,
            Materials.roofGravel,
            wallMat,
            facadeMat,
            wallMat
        ];
        const mainH = cfg.h - 5.5;
        const core = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, mainH, cfg.d), mats);
        core.position.set(0, 5.5 + mainH / 2, 0);
        core.castShadow = true;
        core.receiveShadow = true;
        bg.add(core);
        const store = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, 5.5, cfg.d), Materials.darkSteel);
        store.position.set(0, 2.75, 0);
        store.castShadow = true;
        store.receiveShadow = true;
        bg.add(store);
        if (cfg.storeName) {
            const tex = TextureGenerator.createStorefrontTexture(cfg.storeName, cfg.storeColor || '#38bdf8');
            const sfMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25 });
            const sf = new THREE.Mesh(new THREE.PlaneGeometry(cfg.d - 2, 5.0), sfMat);
            if (isWest) {
                sf.rotation.y = Math.PI / 2;
                sf.position.set(cfg.w / 2 + 0.08, 2.75, 0);
            }
            else {
                sf.rotation.y = -Math.PI / 2;
                sf.position.set(-cfg.w / 2 - 0.08, 2.75, 0);
            }
            bg.add(sf);
        }
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.4, 1.2, cfg.d + 0.4), Materials.curb);
        parapet.position.set(0, cfg.h + 0.6, 0);
        bg.add(parapet);
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 4.0), Materials.roofEquipmentMetal);
        hvac.position.set(0, cfg.h + 1.1, 0);
        hvac.castShadow = true;
        bg.add(hvac);
        this.group.add(bg);
        this.colliders.push({
            minX: cfg.x - cfg.w / 2,
            maxX: cfg.x + cfg.w / 2,
            minZ: cfg.z - cfg.d / 2,
            maxZ: cfg.z + cfg.d / 2,
            height: cfg.h
        });
    }
    private buildParkingLot(x: number, z: number, w: number, d: number) {
        const lotGroup = new THREE.Group();
        lotGroup.position.set(x, 0, z);
        const lotGeo = new THREE.PlaneGeometry(w, d);
        lotGeo.rotateX(-Math.PI / 2);
        const lot = new THREE.Mesh(lotGeo, Materials.asphalt);
        lot.position.y = 0.03;
        lot.receiveShadow = true;
        lotGroup.add(lot);
        const curbGeo = new THREE.BoxGeometry(w, 0.18, 0.25);
        const curbNorth = new THREE.Mesh(curbGeo, Materials.curb);
        curbNorth.position.set(0, 0.09, -d / 2);
        lotGroup.add(curbNorth);
        this.group.add(lotGroup);
    }
}
