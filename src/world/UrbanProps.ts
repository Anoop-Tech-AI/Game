import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
import { SkyEnvironment } from '../rendering/SkyEnvironment';
export class UrbanProps {
    public group: THREE.Group;
    private skyEnv: SkyEnvironment;
    constructor(skyEnv: SkyEnvironment) {
        this.group = new THREE.Group();
        this.group.name = 'UrbanProps';
        this.skyEnv = skyEnv;
        this.placeStreetLamps();
        this.placeTrafficSignals();
        this.placeTrafficSigns();
        this.placeBusStop();
        this.placeBenchesAndBins();
        this.placeFireHydrants();
        this.placeBollards();
        this.placeUtilityBoxes();
    }
    private placeStreetLamps() {
        const lampPositions = [
            { x: -8.8, z: -55, rotY: Math.PI / 2 },
            { x: 8.8, z: -40, rotY: -Math.PI / 2 },
            { x: -8.8, z: -15, rotY: Math.PI / 2 },
            { x: 8.8, z: 0, rotY: -Math.PI / 2 },
            { x: -8.8, z: 45, rotY: Math.PI / 2 },
            { x: 8.8, z: 60, rotY: -Math.PI / 2 },
            { x: -8.8, z: 85, rotY: Math.PI / 2 },
        ];
        lampPositions.forEach(pos => {
            const lamp = new THREE.Group();
            lamp.position.set(pos.x, 0, pos.z);
            lamp.rotation.y = pos.rotY;
            const baseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.6, 12);
            const base = new THREE.Mesh(baseGeo, Materials.darkSteel);
            base.position.y = 0.3;
            base.castShadow = true;
            lamp.add(base);
            const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 12);
            const pole = new THREE.Mesh(poleGeo, Materials.darkSteel);
            pole.position.y = 4.0;
            pole.castShadow = true;
            lamp.add(pole);
            const armGeo = new THREE.BoxGeometry(0.12, 0.1, 2.8);
            const arm = new THREE.Mesh(armGeo, Materials.darkSteel);
            arm.position.set(0, 7.6, 1.2);
            arm.rotation.x = -0.15;
            arm.castShadow = true;
            lamp.add(arm);
            const headGeo = new THREE.BoxGeometry(0.35, 0.12, 0.9);
            const head = new THREE.Mesh(headGeo, Materials.darkSteel);
            head.position.set(0, 7.8, 2.4);
            lamp.add(head);
            const lensGeo = new THREE.PlaneGeometry(0.28, 0.7);
            lensGeo.rotateX(Math.PI / 2);
            const lensMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffeedd,
                emissiveIntensity: 2.2
            });
            const lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(0, 7.73, 2.4);
            lamp.add(lens);
            const spotLight = new THREE.SpotLight(0xfff3e0, 3.8, 24, Math.PI / 3.5, 0.5, 1.2);
            spotLight.position.set(pos.x + (pos.rotY > 0 ? 2.4 : -2.4), 7.6, pos.z);
            spotLight.target.position.set(pos.x + (pos.rotY > 0 ? 3.5 : -3.5), 0, pos.z);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 512;
            spotLight.shadow.mapSize.height = 512;
            spotLight.shadow.bias = -0.001;
            this.group.add(spotLight);
            this.group.add(spotLight.target);
            this.skyEnv.registerStreetLight(spotLight);
            this.group.add(lamp);
        });
    }
    private placeTrafficSignals() {
        const intersectionZ = 25;
        const mastGroupS = this.createTrafficGantry();
        mastGroupS.position.set(8.8, 0, intersectionZ - 13);
        mastGroupS.rotation.y = -Math.PI / 2;
        this.group.add(mastGroupS);
        const mastGroupN = this.createTrafficGantry();
        mastGroupN.position.set(-8.8, 0, intersectionZ + 13);
        mastGroupN.rotation.y = Math.PI / 2;
        this.group.add(mastGroupN);
    }
    private createTrafficGantry(): THREE.Group {
        const gantry = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.28, 8.5, 16);
        const pole = new THREE.Mesh(poleGeo, Materials.trafficPoleYellow);
        pole.position.y = 4.25;
        pole.castShadow = true;
        gantry.add(pole);
        const armGeo = new THREE.CylinderGeometry(0.12, 0.16, 9.5, 12);
        armGeo.rotateZ(Math.PI / 2);
        const arm = new THREE.Mesh(armGeo, Materials.trafficPoleYellow);
        arm.position.set(-4.5, 7.8, 0);
        arm.castShadow = true;
        gantry.add(arm);
        [-3.0, -7.0].forEach(armX => {
            const signalHead = this.createSignalHead();
            signalHead.position.set(armX, 7.2, 0);
            gantry.add(signalHead);
        });
        const pedHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.25), Materials.trafficSignalHousing);
        pedHead.position.set(-0.35, 2.5, 0);
        gantry.add(pedHead);
        return gantry;
    }
    private createSignalHead(): THREE.Group {
        const head = new THREE.Group();
        const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.45, 0.05), Materials.darkSteel);
        head.add(backplate);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.25, 0.35), Materials.trafficSignalHousing);
        box.position.z = 0.18;
        head.add(box);
        const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), Materials.signalRed);
        redLens.rotateX(Math.PI / 2);
        redLens.position.set(0, 0.38, 0.36);
        head.add(redLens);
        const amberLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), Materials.signalAmber);
        amberLens.rotateX(Math.PI / 2);
        amberLens.position.set(0, 0, 0.36);
        head.add(amberLens);
        const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), Materials.signalGreen);
        greenLens.rotateX(Math.PI / 2);
        greenLens.position.set(0, -0.38, 0.36);
        head.add(greenLens);
        return head;
    }
    private placeTrafficSigns() {
        const signGroup1 = this.createSpeedLimitSign('35');
        signGroup1.position.set(9.2, 0, -35);
        signGroup1.rotation.y = -Math.PI / 2;
        this.group.add(signGroup1);
        const stopSign = this.createStopSign();
        stopSign.position.set(9.2, 0, 10);
        stopSign.rotation.y = -Math.PI / 2;
        this.group.add(stopSign);
    }
    private createSpeedLimitSign(limit: string): THREE.Group {
        const group = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
        const pole = new THREE.Mesh(poleGeo, Materials.darkSteel);
        pole.position.y = 1.6;
        pole.castShadow = true;
        group.add(pole);
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 384;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 256, 384);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, 236, 364);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SPEED', 128, 70);
        ctx.fillText('LIMIT', 128, 115);
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText(limit, 128, 280);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const signMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
        const signGeo = new THREE.PlaneGeometry(0.65, 0.95);
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(0, 2.5, 0.04);
        group.add(signMesh);
        return group;
    }
    private createStopSign(): THREE.Group {
        const group = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
        const pole = new THREE.Mesh(poleGeo, Materials.darkSteel);
        pole.position.y = 1.6;
        pole.castShadow = true;
        group.add(pole);
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        const c = 128, r = 120;
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + Math.PI / 8;
            const px = c + Math.cos(a) * r;
            const py = c + Math.sin(a) * r;
            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 74px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STOP', 128, 128);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const signMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
        const octGeo = new THREE.CircleGeometry(0.42, 8);
        const signMesh = new THREE.Mesh(octGeo, signMat);
        signMesh.position.set(0, 2.4, 0.04);
        group.add(signMesh);
        return group;
    }
    private placeBusStop() {
        const shelter = new THREE.Group();
        shelter.position.set(-10.2, 0, -32);
        shelter.rotation.y = Math.PI / 2;
        const roofGeo = new THREE.BoxGeometry(4.2, 0.14, 2.2);
        const roof = new THREE.Mesh(roofGeo, Materials.darkSteel);
        roof.position.set(0, 2.6, 0);
        roof.castShadow = true;
        shelter.add(roof);
        const glassRearGeo = new THREE.BoxGeometry(4.0, 2.4, 0.06);
        const glassRear = new THREE.Mesh(glassRearGeo, Materials.glassShelter);
        glassRear.position.set(0, 1.2, -1.0);
        shelter.add(glassRear);
        const glassSideGeo = new THREE.BoxGeometry(0.06, 2.4, 2.0);
        const glassSide = new THREE.Mesh(glassSideGeo, Materials.glassShelter);
        glassSide.position.set(-2.0, 1.2, 0);
        shelter.add(glassSide);
        const benchGeo = new THREE.BoxGeometry(2.4, 0.08, 0.45);
        const bench = new THREE.Mesh(benchGeo, Materials.benchWood);
        bench.position.set(0, 0.48, -0.6);
        shelter.add(bench);
        this.group.add(shelter);
    }
    private placeBenchesAndBins() {
        const benchPositions = [
            { x: -10.0, z: 2, rotY: Math.PI / 2 },
            { x: 10.0, z: -10, rotY: -Math.PI / 2 },
            { x: 10.0, z: 68, rotY: -Math.PI / 2 }
        ];
        benchPositions.forEach(pos => {
            const bench = this.createBench();
            bench.position.set(pos.x, 0, pos.z);
            bench.rotation.y = pos.rotY;
            this.group.add(bench);
            const bin = this.createTrashBin();
            bin.position.set(pos.x, 0, pos.z + (pos.rotY > 0 ? 2.5 : -2.5));
            this.group.add(bin);
        });
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
            const slatGeo = new THREE.BoxGeometry(2.0, 0.04, 0.1);
            const slat = new THREE.Mesh(slatGeo, Materials.benchWood);
            slat.position.set(0, 0.45, -0.2 + i * 0.12);
            slat.castShadow = true;
            bench.add(slat);
        }
        return bench;
    }
    private createTrashBin(): THREE.Group {
        const bin = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.85, 16);
        const body = new THREE.Mesh(bodyGeo, Materials.darkSteel);
        body.position.y = 0.42;
        body.castShadow = true;
        bin.add(body);
        const lidGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const lid = new THREE.Mesh(lidGeo, Materials.darkSteel);
        lid.position.y = 0.9;
        bin.add(lid);
        return bin;
    }
    private placeFireHydrants() {
        const hydrantPositions = [
            { x: -9.2, z: -40 },
            { x: 9.2, z: 42 }
        ];
        hydrantPositions.forEach(pos => {
            const hyd = new THREE.Group();
            hyd.position.set(pos.x, 0, pos.z);
            const barrelGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.75, 12);
            const barrel = new THREE.Mesh(barrelGeo, Materials.fireHydrantRed);
            barrel.position.y = 0.38;
            barrel.castShadow = true;
            hyd.add(barrel);
            const domeGeo = new THREE.SphereGeometry(0.18, 12, 8);
            const dome = new THREE.Mesh(domeGeo, Materials.fireHydrantRed);
            dome.position.y = 0.75;
            hyd.add(dome);
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8);
            nozzleGeo.rotateZ(Math.PI / 2);
            const nozzleL = new THREE.Mesh(nozzleGeo, Materials.brass);
            nozzleL.position.set(-0.2, 0.45, 0);
            hyd.add(nozzleL);
            const nozzleR = new THREE.Mesh(nozzleGeo, Materials.brass);
            nozzleR.position.set(0.2, 0.45, 0);
            hyd.add(nozzleR);
            this.group.add(hyd);
        });
    }
    private placeBollards() {
        const corners = [
            { x: -8.8, z: 12 },
            { x: -8.8, z: 38 },
            { x: 8.8, z: 12 },
            { x: 8.8, z: 38 }
        ];
        corners.forEach(c => {
            for (let i = 0; i < 3; i++) {
                const bollard = new THREE.Group();
                bollard.position.set(c.x, 0, c.z + (i - 1) * 1.6);
                const postGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 12);
                const post = new THREE.Mesh(postGeo, Materials.darkSteel);
                post.position.y = 0.45;
                post.castShadow = true;
                bollard.add(post);
                const ringGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12);
                const ring = new THREE.Mesh(ringGeo, Materials.signalAmber);
                ring.position.y = 0.75;
                bollard.add(ring);
                this.group.add(bollard);
            }
        });
    }
    private placeUtilityBoxes() {
        const boxPositions = [
            { x: -10.5, z: -62 },
            { x: 10.5, z: 20 }
        ];
        boxPositions.forEach(pos => {
            const boxGeo = new THREE.BoxGeometry(0.8, 1.25, 1.4);
            const box = new THREE.Mesh(boxGeo, Materials.darkSteel);
            box.position.set(pos.x, 0.62, pos.z);
            box.castShadow = true;
            box.receiveShadow = true;
            this.group.add(box);
        });
    }
}
