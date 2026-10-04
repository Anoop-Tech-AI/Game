import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { CollisionBox } from '../vehicle/CarController';
export class SpecializedDistricts {
    public group: THREE.Group;
    public colliders: CollisionBox[] = [];
    public radarDish: THREE.Mesh | null = null;
    public airportBeaconLight: THREE.Mesh | null = null;
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'SpecializedDistricts';
        this.buildAirportDistrict();
        this.buildCentralParkDistrict();
        this.buildApexGarageFacility();
        this.buildElevatedHighwayOverpass();
        this.buildHarborContainerDocks();
    }
    private buildAirportDistrict() {
        const airportGroup = new THREE.Group();
        airportGroup.name = 'District_Airport';
        const runwayLength = 320.0;
        const runwayWidth = 32.0;
        const runwayCenter = new THREE.Vector3(230, 0.02, 70);
        const runwayGeo = new THREE.PlaneGeometry(runwayLength, runwayWidth);
        runwayGeo.rotateX(-Math.PI / 2);
        const runwayMat = new THREE.MeshStandardMaterial({
            color: 0x181a20,
            roughness: 0.88,
            metalness: 0.12
        });
        const runwayMesh = new THREE.Mesh(runwayGeo, runwayMat);
        runwayMesh.position.copy(runwayCenter);
        runwayMesh.receiveShadow = true;
        airportGroup.add(runwayMesh);
        const rCanvas = document.createElement('canvas');
        rCanvas.width = 1024;
        rCanvas.height = 128;
        const rCtx = rCanvas.getContext('2d')!;
        rCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        rCtx.fillRect(0, 0, 1024, 128);
        rCtx.fillStyle = '#f8fafc';
        rCtx.fillRect(0, 4, 1024, 6);
        rCtx.fillRect(0, 118, 1024, 6);
        for (let i = 0; i < 8; i++) {
            rCtx.fillRect(30 + i * 8, 20, 5, 88);
        }
        for (let i = 0; i < 8; i++) {
            rCtx.fillRect(940 + i * 8, 20, 5, 88);
        }
        rCtx.font = 'bold 36px monospace';
        rCtx.textAlign = 'center';
        rCtx.textBaseline = 'middle';
        rCtx.fillText('09L', 140, 64);
        rCtx.fillText('27R', 870, 64);
        for (let x = 200; x < 820; x += 60) {
            rCtx.fillRect(x, 60, 36, 8);
        }
        const rTex = new THREE.CanvasTexture(rCanvas);
        rTex.colorSpace = THREE.SRGBColorSpace;
        const rMarkMat = new THREE.MeshBasicMaterial({
            map: rTex,
            transparent: true,
            side: THREE.DoubleSide
        });
        const rMarkMesh = new THREE.Mesh(runwayGeo, rMarkMat);
        rMarkMesh.position.set(runwayCenter.x, 0.03, runwayCenter.z);
        airportGroup.add(rMarkMesh);
        for (let lx = -runwayLength / 2 + 10; lx <= runwayLength / 2 - 10; lx += 25) {
            [-runwayWidth / 2 - 0.8, runwayWidth / 2 + 0.8].forEach(lz => {
                const lightPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
                const lightPole = new THREE.Mesh(lightPoleGeo, Materials.darkSteel);
                lightPole.position.set(runwayCenter.x + lx, 0.22, runwayCenter.z + lz);
                airportGroup.add(lightPole);
                const bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
                const isWest = lx < -runwayLength / 2 + 30;
                const isEast = lx > runwayLength / 2 - 30;
                const bulbColor = isWest ? 0x22c55e : (isEast ? 0xef4444 : 0xffffff);
                const bulbMat = new THREE.MeshBasicMaterial({ color: bulbColor });
                const bulb = new THREE.Mesh(bulbGeo, bulbMat);
                bulb.position.set(runwayCenter.x + lx, 0.46, runwayCenter.z + lz);
                airportGroup.add(bulb);
            });
        }
        const towerX = 220;
        const towerZ = 125;
        const towerBaseGeo = new THREE.CylinderGeometry(4.2, 5.8, 38.0, 8);
        const towerBaseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, metalness: 0.2 });
        const towerBase = new THREE.Mesh(towerBaseGeo, towerBaseMat);
        towerBase.position.set(towerX, 19.0, towerZ);
        towerBase.castShadow = true;
        airportGroup.add(towerBase);
        const cabGeo = new THREE.CylinderGeometry(7.5, 5.2, 6.0, 16);
        const cabMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.1,
            metalness: 0.85,
            transparent: true,
            opacity: 0.75
        });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.set(towerX, 40.5, towerZ);
        airportGroup.add(cab);
        const radarMastGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.0, 8);
        const radarMast = new THREE.Mesh(radarMastGeo, Materials.darkSteel);
        radarMast.position.set(towerX, 45.0, towerZ);
        airportGroup.add(radarMast);
        const dishGeo = new THREE.BoxGeometry(4.2, 1.2, 0.4);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.6 });
        this.radarDish = new THREE.Mesh(dishGeo, dishMat);
        this.radarDish.position.set(towerX, 47.0, towerZ);
        airportGroup.add(this.radarDish);
        const beaconGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        this.airportBeaconLight = new THREE.Mesh(beaconGeo, beaconMat);
        this.airportBeaconLight.position.set(towerX, 48.0, towerZ);
        airportGroup.add(this.airportBeaconLight);
        this.colliders.push({
            minX: towerX - 6.0, maxX: towerX + 6.0,
            minZ: towerZ - 6.0, maxZ: towerZ + 6.0,
            height: 48.0
        });
        this.buildParkedAirliner(airportGroup, 175, 115, -Math.PI / 4, '#1e40af');
        this.buildParkedAirliner(airportGroup, 275, 115, -Math.PI * 0.75, '#dc2626');
        this.buildAircraftHangar(airportGroup, 130, 130, 48, 36, 16);
        this.buildAircraftHangar(airportGroup, 310, 130, 48, 36, 16);
        [-1, 1].forEach(side => {
            const tankGeo = new THREE.CylinderGeometry(4.5, 4.5, 9.0, 24);
            const tankMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.65 });
            const tank = new THREE.Mesh(tankGeo, tankMat);
            tank.position.set(100 + side * 12, 4.5, 130);
            tank.castShadow = true;
            airportGroup.add(tank);
            this.colliders.push({
                minX: 100 + side * 12 - 4.5, maxX: 100 + side * 12 + 4.5,
                minZ: 130 - 4.5, maxZ: 130 + 4.5,
                height: 9.0
            });
        });
        this.group.add(airportGroup);
    }
    private buildParkedAirliner(parent: THREE.Group, x: number, z: number, rotationY: number, liveryColor: string) {
        const plane = new THREE.Group();
        plane.position.set(x, 0, z);
        plane.rotation.y = rotationY;
        const fuseGeo = new THREE.CylinderGeometry(2.4, 2.4, 38.0, 20);
        fuseGeo.rotateX(Math.PI / 2);
        const fuseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.75 });
        const fuse = new THREE.Mesh(fuseGeo, fuseMat);
        fuse.position.y = 4.2;
        fuse.castShadow = true;
        plane.add(fuse);
        const noseGeo = new THREE.ConeGeometry(2.4, 6.0, 20);
        noseGeo.rotateX(-Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, fuseMat);
        nose.position.set(0, 4.2, 22.0);
        nose.castShadow = true;
        plane.add(nose);
        const wingGeo = new THREE.BoxGeometry(34.0, 0.45, 5.5);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.6 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 3.8, 0);
        wings.castShadow = true;
        plane.add(wings);
        [-8.5, 8.5].forEach(ex => {
            const engGeo = new THREE.CylinderGeometry(1.3, 1.2, 5.5, 16);
            engGeo.rotateX(Math.PI / 2);
            const engMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
            const eng = new THREE.Mesh(engGeo, engMat);
            eng.position.set(ex, 2.2, 0.5);
            eng.castShadow = true;
            plane.add(eng);
            const spinGeo = new THREE.ConeGeometry(0.4, 0.8, 12);
            spinGeo.rotateX(-Math.PI / 2);
            const spinner = new THREE.Mesh(spinGeo, Materials.darkSteel);
            spinner.position.set(ex, 2.2, 3.4);
            plane.add(spinner);
        });
        const finGeo = new THREE.BoxGeometry(0.35, 7.5, 5.0);
        const finMat = new THREE.MeshStandardMaterial({ color: liveryColor, roughness: 0.3, metalness: 0.5 });
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(0, 8.8, -16.5);
        fin.rotation.x = -0.32;
        fin.castShadow = true;
        plane.add(fin);
        const hTailGeo = new THREE.BoxGeometry(11.0, 0.25, 2.8);
        const hTail = new THREE.Mesh(hTailGeo, wingMat);
        hTail.position.set(0, 6.2, -18.0);
        plane.add(hTail);
        parent.add(plane);
        this.colliders.push({
            minX: x - 16.0, maxX: x + 16.0,
            minZ: z - 16.0, maxZ: z + 16.0,
            height: 12.0
        });
    }
    private buildAircraftHangar(parent: THREE.Group, x: number, z: number, w: number, d: number, h: number) {
        const hangar = new THREE.Group();
        hangar.position.set(x, 0, z);
        const roofGeo = new THREE.CylinderGeometry(w / 2, w / 2, d, 24, 1, false, 0, Math.PI);
        roofGeo.rotateZ(Math.PI / 2);
        roofGeo.rotateY(Math.PI / 2);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.55,
            metalness: 0.45
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = h;
        roof.castShadow = true;
        hangar.add(roof);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
        [-w / 2, w / 2].forEach(wx => {
            const wallGeo = new THREE.BoxGeometry(0.8, h, d);
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(wx, h / 2, 0);
            wall.castShadow = true;
            hangar.add(wall);
        });
        parent.add(hangar);
        this.colliders.push({
            minX: x - w / 2, maxX: x + w / 2,
            minZ: z - d / 2, maxZ: z + d / 2,
            height: h + w / 2
        });
    }
    private buildCentralParkDistrict() {
        const parkGroup = new THREE.Group();
        parkGroup.name = 'District_CentralPark';
        const parkCenterX = -110;
        const parkCenterZ = 25;
        const parkW = 110.0;
        const parkD = 110.0;
        const turfGeo = new THREE.PlaneGeometry(parkW, parkD);
        turfGeo.rotateX(-Math.PI / 2);
        const turfMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a1f,
            roughness: 0.95,
            metalness: 0.05
        });
        const turf = new THREE.Mesh(turfGeo, turfMat);
        turf.position.set(parkCenterX, 0.05, parkCenterZ);
        turf.receiveShadow = true;
        parkGroup.add(turf);
        const lakeGeo = new THREE.CircleGeometry(26.0, 32);
        lakeGeo.rotateX(-Math.PI / 2);
        const lakeMat = new THREE.MeshStandardMaterial({
            color: 0x0f2d4a,
            roughness: 0.08,
            metalness: 0.85,
            transparent: true,
            opacity: 0.92
        });
        const lake = new THREE.Mesh(lakeGeo, lakeMat);
        lake.position.set(parkCenterX + 10, 0.08, parkCenterZ - 10);
        lake.receiveShadow = true;
        parkGroup.add(lake);
        const borderGeo = new THREE.RingGeometry(25.8, 27.2, 32);
        borderGeo.rotateX(-Math.PI / 2);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.set(parkCenterX + 10, 0.10, parkCenterZ - 10);
        parkGroup.add(border);
        const bridgeX = parkCenterX + 10;
        const bridgeZ = parkCenterZ - 10;
        const bridgeArchGeo = new THREE.TorusGeometry(12.0, 1.8, 12, 24, Math.PI * 0.45);
        bridgeArchGeo.rotateZ(Math.PI * 0.28);
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.75 });
        const bridge = new THREE.Mesh(bridgeArchGeo, bridgeMat);
        bridge.position.set(bridgeX, -7.5, bridgeZ);
        bridge.castShadow = true;
        parkGroup.add(bridge);
        const gazX = parkCenterX - 28;
        const gazZ = parkCenterZ + 25;
        const gazBase = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.2, 0.8, 8), bridgeMat);
        gazBase.position.set(gazX, 0.4, gazZ);
        parkGroup.add(gazBase);
        for (let c = 0; c < 8; c++) {
            const angle = (c * Math.PI * 2) / 8;
            const colGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.8, 12);
            const col = new THREE.Mesh(colGeo, bridgeMat);
            col.position.set(gazX + Math.cos(angle) * 4.4, 2.3, gazZ + Math.sin(angle) * 4.4);
            col.castShadow = true;
            parkGroup.add(col);
        }
        const domeGeo = new THREE.ConeGeometry(5.4, 2.8, 8);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4, metalness: 0.6 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.set(gazX, 5.2, gazZ);
        dome.castShadow = true;
        parkGroup.add(dome);
        this.colliders.push({
            minX: gazX - 5.5, maxX: gazX + 5.5,
            minZ: gazZ - 5.5, maxZ: gazZ + 5.5,
            height: 6.5
        });
        const treePositions = [
            { x: parkCenterX - 35, z: parkCenterZ - 30, type: 'blossom' },
            { x: parkCenterX - 20, z: parkCenterZ - 38, type: 'maple' },
            { x: parkCenterX + 35, z: parkCenterZ + 30, type: 'blossom' },
            { x: parkCenterX + 22, z: parkCenterZ + 38, type: 'maple' },
            { x: parkCenterX - 38, z: parkCenterZ + 10, type: 'maple' },
            { x: parkCenterX + 38, z: parkCenterZ - 20, type: 'blossom' },
        ];
        treePositions.forEach(tp => {
            const tree = new THREE.Group();
            tree.position.set(tp.x, 0, tp.z);
            const trunkGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.8, 8);
            const trunk = new THREE.Mesh(trunkGeo, Materials.treeBark);
            trunk.position.y = 1.9;
            trunk.castShadow = true;
            tree.add(trunk);
            const foliageGeo = new THREE.DodecahedronGeometry(2.8, 1);
            const folColor = tp.type === 'blossom' ? 0xf472b6 : 0xf97316;
            const folMat = new THREE.MeshStandardMaterial({ color: folColor, roughness: 0.85, metalness: 0.1 });
            const foliage = new THREE.Mesh(foliageGeo, folMat);
            foliage.position.y = 4.8;
            foliage.castShadow = true;
            tree.add(foliage);
            parkGroup.add(tree);
            this.colliders.push({
                minX: tp.x - 0.8, maxX: tp.x + 0.8,
                minZ: tp.z - 0.8, maxZ: tp.z + 0.8,
                height: 6.0
            });
        });
        this.group.add(parkGroup);
    }
    private buildApexGarageFacility() {
        const garageGroup = new THREE.Group();
        garageGroup.name = 'District_ApexGarage';
        const gx = 55.0;
        const gz = 0.0;
        const bldgW = 28.0;
        const bldgD = 32.0;
        const bldgH = 11.0;
        const bldgGeo = new THREE.BoxGeometry(bldgW, bldgH, bldgD);
        const bldgMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.4,
            metalness: 0.7
        });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(gx, bldgH / 2, gz);
        bldg.castShadow = true;
        bldg.receiveShadow = true;
        garageGroup.add(bldg);
        [-7.5, 7.5].forEach(bx => {
            const bayGeo = new THREE.PlaneGeometry(6.5, 5.5);
            const bayMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.35,
                metalness: 0.85
            });
            const bayDoor = new THREE.Mesh(bayGeo, bayMat);
            bayDoor.position.set(gx + bx, 2.75, gz - bldgD / 2 - 0.08);
            garageGroup.add(bayDoor);
        });
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const sCtx = signCanvas.getContext('2d')!;
        sCtx.fillStyle = '#0f172a';
        sCtx.fillRect(0, 0, 512, 128);
        sCtx.strokeStyle = '#00f5ff';
        sCtx.lineWidth = 6;
        sCtx.strokeRect(6, 6, 500, 116);
        sCtx.fillStyle = '#00f5ff';
        sCtx.font = 'bold 38px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('⚡ APEX CUSTOMS ⚡', 256, 54);
        sCtx.fillStyle = '#ec4899';
        sCtx.font = 'bold 26px sans-serif';
        sCtx.fillText('PERFORMANCE TUNING & GARAGE', 256, 96);
        const signTex = new THREE.CanvasTexture(signCanvas);
        signTex.colorSpace = THREE.SRGBColorSpace;
        const signMat = new THREE.MeshStandardMaterial({
            map: signTex,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.85,
            roughness: 0.2
        });
        const signGeo = new THREE.PlaneGeometry(16.0, 4.0);
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(gx, bldgH + 2.4, gz - bldgD / 2 + 0.1);
        garageGroup.add(signMesh);
        const padGeo = new THREE.CircleGeometry(6.5, 32);
        padGeo.rotateX(-Math.PI / 2);
        const padMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.5,
            metalness: 0.5
        });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(gx, 0.04, gz - bldgD / 2 - 9.0);
        pad.receiveShadow = true;
        garageGroup.add(pad);
        const holoRingGeo = new THREE.RingGeometry(5.8, 6.2, 32);
        holoRingGeo.rotateX(-Math.PI / 2);
        const holoRingMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
        holoRing.position.set(gx, 0.06, gz - bldgD / 2 - 9.0);
        garageGroup.add(holoRing);
        this.colliders.push({
            minX: gx - bldgW / 2, maxX: gx + bldgW / 2,
            minZ: gz - bldgD / 2, maxZ: gz + bldgD / 2,
            height: bldgH
        });
        this.group.add(garageGroup);
    }
    private buildElevatedHighwayOverpass() {
        const hwyGroup = new THREE.Group();
        hwyGroup.name = 'District_ElevatedHighway';
        const gx = 60;
        const gz = 220;
        [-13.5, 13.5].forEach(px => {
            const postGeo = new THREE.CylinderGeometry(0.3, 0.35, 7.5, 12);
            const post = new THREE.Mesh(postGeo, Materials.darkSteel);
            post.position.set(gx, 3.75, gz + px);
            post.castShadow = true;
            hwyGroup.add(post);
        });
        const trussGeo = new THREE.BoxGeometry(1.2, 0.8, 27.0);
        const truss = new THREE.Mesh(trussGeo, Materials.darkSteel);
        truss.position.set(gx, 7.2, gz);
        hwyGroup.add(truss);
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 512;
        sCanvas.height = 160;
        const sCtx = sCanvas.getContext('2d')!;
        sCtx.fillStyle = '#065f46';
        sCtx.fillRect(0, 0, 512, 160);
        sCtx.strokeStyle = '#ffffff';
        sCtx.lineWidth = 6;
        sCtx.strokeRect(6, 6, 500, 148);
        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 30px sans-serif';
        sCtx.textAlign = 'left';
        sCtx.fillText('✈️ AIRPORT TERMINAL', 24, 52);
        sCtx.fillText('➔ EXIT 2A — 1.5 KM', 24, 98);
        sCtx.font = 'bold 22px sans-serif';
        sCtx.fillStyle = '#fbbf24';
        sCtx.fillText('SPEED RADAR ENFORCED (130 KM/H)', 24, 134);
        const sTex = new THREE.CanvasTexture(sCanvas);
        sTex.colorSpace = THREE.SRGBColorSpace;
        const sMat = new THREE.MeshBasicMaterial({ map: sTex, side: THREE.DoubleSide });
        const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 3.5), sMat);
        sMesh.position.set(gx - 0.65, 7.2, gz);
        sMesh.rotation.y = -Math.PI / 2;
        hwyGroup.add(sMesh);
        const camBoxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
        const camBox = new THREE.Mesh(camBoxGeo, Materials.darkSteel);
        camBox.position.set(gx, 6.4, gz + 4.5);
        hwyGroup.add(camBox);
        const lensGeo = new THREE.CircleGeometry(0.18, 16);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(gx - 0.42, 6.4, gz + 4.5);
        lens.rotation.y = -Math.PI / 2;
        hwyGroup.add(lens);
        this.group.add(hwyGroup);
    }
    private buildHarborContainerDocks() {
        const docksGroup = new THREE.Group();
        docksGroup.name = 'District_HarborDocks';
        const cx = -180.0;
        const cz = -150.0;
        const craneMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45, metalness: 0.65 });
        [-14, 14].forEach(lx => {
            [-8, 8].forEach(lz => {
                const legGeo = new THREE.BoxGeometry(1.2, 28.0, 1.2);
                const leg = new THREE.Mesh(legGeo, craneMat);
                leg.position.set(cx + lx, 14.0, cz + lz);
                leg.castShadow = true;
                docksGroup.add(leg);
            });
        });
        const girderGeo = new THREE.BoxGeometry(36.0, 3.2, 18.0);
        const girder = new THREE.Mesh(girderGeo, craneMat);
        girder.position.set(cx, 28.0, cz);
        girder.castShadow = true;
        docksGroup.add(girder);
        const cabGeo = new THREE.BoxGeometry(3.5, 2.5, 3.5);
        const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.set(cx + 6.0, 25.0, cz);
        docksGroup.add(cab);
        const containerColors = [0x1d4ed8, 0x15803d, 0xb91c1c, 0xc2410c, 0x6b21a8];
        const stackConfigs = [
            { x: cx - 28, z: cz - 15, rot: 0, count: 3 },
            { x: cx - 28, z: cz + 10, rot: 0, count: 2 },
            { x: cx + 28, z: cz - 20, rot: Math.PI / 2, count: 3 },
            { x: cx + 28, z: cz + 5, rot: Math.PI / 2, count: 2 },
            { x: cx + 10, z: cz - 35, rot: 0, count: 2 },
            { x: cx - 10, z: cz + 30, rot: 0, count: 3 },
        ];
        stackConfigs.forEach((sc, idx) => {
            for (let h = 0; h < sc.count; h++) {
                const cGeo = new THREE.BoxGeometry(3.2, 3.0, 8.5);
                const col = containerColors[(idx + h) % containerColors.length];
                const cMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.35 });
                const container = new THREE.Mesh(cGeo, cMat);
                container.position.set(sc.x, 1.5 + h * 3.0, sc.z);
                container.rotation.y = sc.rot;
                container.castShadow = true;
                container.receiveShadow = true;
                docksGroup.add(container);
            }
            this.colliders.push({
                minX: sc.x - 4.5, maxX: sc.x + 4.5,
                minZ: sc.z - 4.5, maxZ: sc.z + 4.5,
                height: sc.count * 3.0
            });
        });
        this.group.add(docksGroup);
    }
    public update(dt: number) {
        if (this.radarDish) {
            this.radarDish.rotation.y += dt * 1.5;
        }
        if (this.airportBeaconLight) {
            const flash = (Math.sin(performance.now() * 0.006) > 0.6) ? 1.0 : 0.15;
            (this.airportBeaconLight.material as THREE.MeshBasicMaterial).color.setRGB(flash, 0, 0);
        }
    }
}
