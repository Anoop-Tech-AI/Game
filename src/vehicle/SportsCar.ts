import * as THREE from 'three';
import { Materials } from '../rendering/Materials';
export interface WheelAssembly {
    pivotGroup: THREE.Group;
    spinGroup: THREE.Group;
    mesh: THREE.Group;
    isFront: boolean;
    isLeft: boolean;
    radius: number;
}
export type CarModelId = 'apex_gtr' | 'vipera_gts' | 'phantom' | 'runner_awd';
interface SmokeParticle {
    mesh: THREE.Mesh;
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
}
export class SportsCar {
    public group: THREE.Group;
    public chassisGroup: THREE.Group;
    public modelDecorGroup: THREE.Group;
    public wheels: WheelAssembly[] = [];
    public headlightsLeft!: THREE.SpotLight;
    public headlightsRight!: THREE.SpotLight;
    public headlightMeshLeft!: THREE.Mesh;
    public headlightMeshRight!: THREE.Mesh;
    public taillightMesh!: THREE.Mesh;
    public brakeLightsLeft!: THREE.PointLight;
    public brakeLightsRight!: THREE.PointLight;
    public reverseLightMesh!: THREE.Mesh;
    public turnSignalMeshL!: THREE.Mesh;
    public turnSignalMeshR!: THREE.Mesh;
    public paintMaterial: THREE.MeshStandardMaterial;
    public rimMaterial: THREE.MeshStandardMaterial;
    public underglowMesh: THREE.Mesh | null = null;
    public underglowLight: THREE.PointLight | null = null;
    public exhaustFlames: THREE.Mesh[] = [];
    public steerAngle: number = 0;
    public wheelRotation: number = 0;
    public areHeadlightsOn: boolean = true;
    public isBraking: boolean = false;
    public isReversing: boolean = false;
    public currentModelId: CarModelId = 'apex_gtr';
    public hazardActive: boolean = false;
    private blinkTimer: number = 0;
    private blinkState: boolean = false;
    private smokeParticles: SmokeParticle[] = [];
    private smokeGroup: THREE.Group;
    private smokeMaterial: THREE.MeshBasicMaterial;
    private smokeGeometry: THREE.BufferGeometry;
    public readonly length = 4.65;
    public readonly width = 2.08;
    public readonly height = 1.28;
    public readonly wheelbase = 2.72;
    public readonly trackWidth = 1.76;
    public readonly wheelRadius = 0.36;
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'SportsCar';
        this.chassisGroup = new THREE.Group();
        this.chassisGroup.name = 'CarChassis';
        this.group.add(this.chassisGroup);
        this.modelDecorGroup = new THREE.Group();
        this.modelDecorGroup.name = 'ModelDecor';
        this.chassisGroup.add(this.modelDecorGroup);
        this.smokeGroup = new THREE.Group();
        this.smokeGroup.name = 'SmokeParticles';
        this.group.add(this.smokeGroup);
        this.smokeGeometry = new THREE.SphereGeometry(0.18, 6, 6);
        this.smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });
        this.paintMaterial = (Materials.carBodyPaint as THREE.MeshStandardMaterial).clone();
        this.rimMaterial = (Materials.carWheelAlloy as THREE.MeshStandardMaterial).clone();
        this.buildBaseChassis();
        this.buildModelKit('apex_gtr');
        this.buildWheels();
        this.buildLighting();
        this.buildNitroAndUnderglow();
    }
    private buildBaseChassis() {
        const floorGeo = new THREE.BoxGeometry(1.88, 0.08, 4.5);
        const floorMesh = new THREE.Mesh(floorGeo, Materials.carCarbonFiber);
        floorMesh.position.set(0, 0.16, 0);
        floorMesh.receiveShadow = true;
        this.chassisGroup.add(floorMesh);
        const lowerBodyGeo = new THREE.BoxGeometry(1.86, 0.38, 3.4);
        const lowerBody = new THREE.Mesh(lowerBodyGeo, this.paintMaterial);
        lowerBody.position.set(0, 0.38, -0.1);
        lowerBody.castShadow = true;
        lowerBody.receiveShadow = true;
        this.chassisGroup.add(lowerBody);
        const haunchGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.32, 24, 1, false, 0, Math.PI);
        haunchGeo.rotateZ(Math.PI / 2);
        haunchGeo.rotateY(Math.PI);
        const haunchL = new THREE.Mesh(haunchGeo, this.paintMaterial);
        haunchL.position.set(-0.96, 0.44, -1.36);
        haunchL.scale.set(1, 0.85, 1.35);
        haunchL.castShadow = true;
        this.chassisGroup.add(haunchL);
        const haunchR = new THREE.Mesh(haunchGeo, this.paintMaterial);
        haunchR.position.set(0.96, 0.44, -1.36);
        haunchR.scale.set(1, 0.85, 1.35);
        haunchR.castShadow = true;
        this.chassisGroup.add(haunchR);
        const rearDeckGeo = new THREE.BoxGeometry(1.72, 0.28, 1.3);
        const rearDeck = new THREE.Mesh(rearDeckGeo, this.paintMaterial);
        rearDeck.position.set(0, 0.62, -1.35);
        rearDeck.castShadow = true;
        this.chassisGroup.add(rearDeck);
        const frontFenderL = new THREE.Mesh(haunchGeo, this.paintMaterial);
        frontFenderL.position.set(-0.94, 0.42, 1.36);
        frontFenderL.scale.set(0.9, 0.82, 1.25);
        frontFenderL.castShadow = true;
        this.chassisGroup.add(frontFenderL);
        const frontFenderR = new THREE.Mesh(haunchGeo, this.paintMaterial);
        frontFenderR.position.set(0.94, 0.42, 1.36);
        frontFenderR.scale.set(0.9, 0.82, 1.25);
        frontFenderR.castShadow = true;
        this.chassisGroup.add(frontFenderR);
        const hoodGeo = new THREE.BufferGeometry();
        const hoodVerts = new Float32Array([
            -0.84, 0.62, -0.25, 0.84, 0.62, -0.25, 0.74, 0.46, 1.82,
            -0.84, 0.62, -0.25, 0.74, 0.46, 1.82, -0.74, 0.46, 1.82,
            -0.84, 0.62, -0.25, -0.74, 0.46, 1.82, -0.96, 0.44, 1.82,
            -0.84, 0.62, -0.25, -0.96, 0.44, 1.82, -0.98, 0.54, -0.25,
            0.84, 0.62, -0.25, 0.98, 0.54, -0.25, 0.96, 0.44, 1.82,
            0.84, 0.62, -0.25, 0.96, 0.44, 1.82, 0.74, 0.46, 1.82,
            -0.74, 0.46, 1.82, 0.74, 0.46, 1.82, 0.70, 0.28, 2.24,
            -0.74, 0.46, 1.82, 0.70, 0.28, 2.24, -0.70, 0.28, 2.24,
        ]);
        hoodGeo.setAttribute('position', new THREE.BufferAttribute(hoodVerts, 3));
        hoodGeo.computeVertexNormals();
        const hood = new THREE.Mesh(hoodGeo, this.paintMaterial);
        hood.castShadow = true;
        this.chassisGroup.add(hood);
        const frontBumperGeo = new THREE.BoxGeometry(1.72, 0.26, 0.42);
        const frontBumper = new THREE.Mesh(frontBumperGeo, this.paintMaterial);
        frontBumper.position.set(0, 0.3, 2.12);
        frontBumper.castShadow = true;
        this.chassisGroup.add(frontBumper);
        const intakeGeo = new THREE.BoxGeometry(1.15, 0.16, 0.1);
        const intake = new THREE.Mesh(intakeGeo, Materials.darkSteel);
        intake.position.set(0, 0.22, 2.32);
        this.chassisGroup.add(intake);
        [-0.98, 0.98].forEach(sx => {
            const skirtGeo = new THREE.BoxGeometry(0.14, 0.08, 1.95);
            const skirt = new THREE.Mesh(skirtGeo, Materials.carCarbonFiber);
            skirt.position.set(sx, 0.14, -0.05);
            skirt.castShadow = true;
            this.chassisGroup.add(skirt);
        });
        const wsGeo = new THREE.BufferGeometry();
        const wsVerts = new Float32Array([
            -0.68, 1.18, 0.35, 0.68, 1.18, 0.35, 0.78, 0.65, 1.05,
            -0.68, 1.18, 0.35, 0.78, 0.65, 1.05, -0.78, 0.65, 1.05
        ]);
        wsGeo.setAttribute('position', new THREE.BufferAttribute(wsVerts, 3));
        wsGeo.computeVertexNormals();
        const windshield = new THREE.Mesh(wsGeo, Materials.carTintedGlass);
        windshield.castShadow = true;
        this.chassisGroup.add(windshield);
        const roofGeo = new THREE.BoxGeometry(1.36, 0.06, 1.5);
        const roof = new THREE.Mesh(roofGeo, Materials.carCarbonFiber);
        roof.position.set(0, 1.2, -0.4);
        roof.castShadow = true;
        this.chassisGroup.add(roof);
        [-0.72, 0.72].forEach((px, i) => {
            const pillarGeo = new THREE.BoxGeometry(0.06, 0.06, 0.95);
            const pillar = new THREE.Mesh(pillarGeo, this.paintMaterial);
            pillar.position.set(px, 0.92, 0.7);
            pillar.rotation.x = -0.52;
            pillar.rotation.y = i === 0 ? 0.12 : -0.12;
            this.chassisGroup.add(pillar);
        });
        const swGeo = new THREE.BufferGeometry();
        const swVerts = new Float32Array([
            -0.68, 1.18, 0.35, -0.78, 0.66, 0.98, -0.84, 0.66, -0.42,
            -0.68, 1.18, 0.35, -0.84, 0.66, -0.42, -0.68, 1.18, -0.42,
            -0.68, 1.18, -0.42, -0.84, 0.66, -0.42, -0.84, 0.66, -1.05,
            -0.68, 1.18, -0.42, -0.84, 0.66, -1.05, -0.68, 1.16, -1.05,
        ]);
        swGeo.setAttribute('position', new THREE.BufferAttribute(swVerts, 3));
        swGeo.computeVertexNormals();
        const swL = new THREE.Mesh(swGeo, Materials.carTintedGlass);
        this.chassisGroup.add(swL);
        const swR = swL.clone();
        swR.scale.x = -1;
        this.chassisGroup.add(swR);
        const rwGeo = new THREE.BufferGeometry();
        const rwVerts = new Float32Array([
            -0.68, 1.16, -1.05, 0.68, 1.16, -1.05, 0.78, 0.74, -1.68,
            -0.68, 1.16, -1.05, 0.78, 0.74, -1.68, -0.78, 0.74, -1.68
        ]);
        rwGeo.setAttribute('position', new THREE.BufferAttribute(rwVerts, 3));
        rwGeo.computeVertexNormals();
        const rearGlass = new THREE.Mesh(rwGeo, Materials.carTintedGlass);
        rearGlass.castShadow = true;
        this.chassisGroup.add(rearGlass);
        [-0.84, 0.84].forEach((mx, i) => {
            const capGeo = new THREE.BoxGeometry(0.18, 0.09, 0.12);
            const cap = new THREE.Mesh(capGeo, Materials.carCarbonFiber);
            cap.position.set(i === 0 ? -0.94 : 0.94, 0.78, 0.7);
            cap.rotation.y = i === 0 ? -0.15 : 0.15;
            this.chassisGroup.add(cap);
            const mirrorGlassGeo = new THREE.PlaneGeometry(0.16, 0.07);
            const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, Materials.carMirrorGlass);
            mirrorGlass.position.set(i === 0 ? -0.94 : 0.94, 0.78, 0.64);
            if (i === 0)
                mirrorGlass.rotation.y = Math.PI;
            this.chassisGroup.add(mirrorGlass);
        });
        const rearBumperGeo = new THREE.BoxGeometry(1.88, 0.36, 0.35);
        const rearBumper = new THREE.Mesh(rearBumperGeo, this.paintMaterial);
        rearBumper.position.set(0, 0.45, -2.1);
        rearBumper.castShadow = true;
        this.chassisGroup.add(rearBumper);
        const diffuserGeo = new THREE.BoxGeometry(1.82, 0.18, 0.65);
        const diffuser = new THREE.Mesh(diffuserGeo, Materials.carCarbonFiber);
        diffuser.position.set(0, 0.18, -2.15);
        diffuser.rotation.x = 0.14;
        diffuser.castShadow = true;
        this.chassisGroup.add(diffuser);
        const dashGeo = new THREE.BoxGeometry(1.4, 0.18, 0.5);
        const dash = new THREE.Mesh(dashGeo, Materials.carInteriorTrim);
        dash.position.set(0, 0.66, 0.68);
        this.chassisGroup.add(dash);
        const stWheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 24), Materials.carCarbonFiber);
        stWheel.position.set(-0.35, 0.76, 0.46);
        stWheel.rotation.x = 0.35;
        this.chassisGroup.add(stWheel);
        [-0.35, 0.35].forEach(sx => {
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.64, 0.44), Materials.carInteriorTrim);
            seat.position.set(sx, 0.54, -0.2);
            this.chassisGroup.add(seat);
        });
    }
    public setModel(modelId: CarModelId) {
        if (this.currentModelId === modelId)
            return;
        this.currentModelId = modelId;
        this.buildModelKit(modelId);
        if (modelId === 'runner_awd') {
            this.chassisGroup.position.y = 0.10;
        }
        else {
            this.chassisGroup.position.y = 0.0;
        }
    }
    private buildModelKit(modelId: CarModelId) {
        while (this.modelDecorGroup.children.length > 0) {
            const child = this.modelDecorGroup.children[0];
            this.modelDecorGroup.remove(child);
        }
        if (modelId === 'apex_gtr') {
            const splitterGeo = new THREE.BoxGeometry(1.98, 0.04, 0.58);
            const splitter = new THREE.Mesh(splitterGeo, Materials.carCarbonFiber);
            splitter.position.set(0, 0.11, 2.16);
            this.modelDecorGroup.add(splitter);
            [-0.98, 0.98].forEach(wx => {
                const canardGeo = new THREE.BoxGeometry(0.04, 0.14, 0.26);
                const canard = new THREE.Mesh(canardGeo, Materials.carCarbonFiber);
                canard.position.set(wx, 0.18, 2.24);
                this.modelDecorGroup.add(canard);
            });
            [-0.38, 0.38].forEach(vx => {
                const ventGeo = new THREE.BoxGeometry(0.28, 0.02, 0.55);
                const vent = new THREE.Mesh(ventGeo, Materials.carCarbonFiber);
                vent.position.set(vx, 0.58, 0.72);
                vent.rotation.x = -0.12;
                this.modelDecorGroup.add(vent);
            });
            [-0.48, 0.48].forEach(ux => {
                const upright = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.26), Materials.carCarbonFiber);
                upright.position.set(ux, 0.92, -1.95);
                upright.rotation.x = -0.18;
                this.modelDecorGroup.add(upright);
            });
            const wing = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.04, 0.36), Materials.carCarbonFiber);
            wing.position.set(0, 1.1, -2.0);
            wing.rotation.x = -0.06;
            this.modelDecorGroup.add(wing);
            [-0.96, 0.96].forEach(ex => {
                const ep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.38), Materials.carCarbonFiber);
                ep.position.set(ex, 1.1, -2.0);
                this.modelDecorGroup.add(ep);
            });
        }
        else if (modelId === 'vipera_gts') {
            const scoopGeo = new THREE.BoxGeometry(0.52, 0.18, 0.65);
            const scoop = new THREE.Mesh(scoopGeo, Materials.carCarbonFiber);
            scoop.position.set(0, 0.72, 0.9);
            scoop.rotation.x = -0.08;
            this.modelDecorGroup.add(scoop);
            const scoopIntake = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.10, 0.08), Materials.darkSteel);
            scoopIntake.position.set(0, 0.72, 1.22);
            this.modelDecorGroup.add(scoopIntake);
            const ducktailGeo = new THREE.BoxGeometry(1.68, 0.16, 0.22);
            const ducktail = new THREE.Mesh(ducktailGeo, this.paintMaterial);
            ducktail.position.set(0, 0.84, -2.02);
            ducktail.rotation.x = 0.42;
            this.modelDecorGroup.add(ducktail);
            const stripeGeo = new THREE.PlaneGeometry(0.18, 3.8);
            stripeGeo.rotateX(-Math.PI / 2);
            [-0.14, 0.14].forEach(sx => {
                const stripe = new THREE.Mesh(stripeGeo, Materials.carCarbonFiber);
                stripe.position.set(sx, 0.64, 0.1);
                this.modelDecorGroup.add(stripe);
            });
        }
        else if (modelId === 'phantom') {
            const finGeo = new THREE.BoxGeometry(0.03, 0.42, 1.6);
            const fin = new THREE.Mesh(finGeo, Materials.carCarbonFiber);
            fin.position.set(0, 1.35, -0.9);
            this.modelDecorGroup.add(fin);
            [-0.85, 0.85].forEach(wx => {
                const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.32), Materials.carCarbonFiber);
                winglet.position.set(wx, 0.88, -2.0);
                winglet.rotation.x = -0.15;
                this.modelDecorGroup.add(winglet);
            });
            [-0.96, 0.96].forEach(vx => {
                const canard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.45), Materials.carCarbonFiber);
                canard.position.set(vx, 0.24, 2.15);
                this.modelDecorGroup.add(canard);
            });
        }
        else if (modelId === 'runner_awd') {
            const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.7, 12);
            barGeo.rotateZ(Math.PI / 2);
            const bullbar = new THREE.Mesh(barGeo, Materials.darkSteel);
            bullbar.position.set(0, 0.42, 2.38);
            this.modelDecorGroup.add(bullbar);
            const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), Materials.darkSteel);
            skidPlate.position.set(0, 0.16, 2.0);
            skidPlate.rotation.x = 0.35;
            this.modelDecorGroup.add(skidPlate);
            const rack = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.2), Materials.darkSteel);
            rack.position.set(0, 1.32, -0.4);
            this.modelDecorGroup.add(rack);
            [-0.45, -0.15, 0.15, 0.45].forEach(rx => {
                const podGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
                podGeo.rotateX(Math.PI / 2);
                const pod = new THREE.Mesh(podGeo, Materials.carChrome);
                pod.position.set(rx, 1.42, 0.24);
                this.modelDecorGroup.add(pod);
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), Materials.carHeadlightCluster);
                lens.position.set(rx, 1.42, 0.285);
                this.modelDecorGroup.add(lens);
            });
            [-0.92, 0.92].forEach(fx => {
                const flap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.03), Materials.carTireRubber);
                flap.position.set(fx, 0.22, -1.82);
                this.modelDecorGroup.add(flap);
            });
        }
    }
    private buildWheels() {
        const wheelPositions = [
            { x: -this.trackWidth / 2, z: this.wheelbase / 2, isFront: true, isLeft: true },
            { x: this.trackWidth / 2, z: this.wheelbase / 2, isFront: true, isLeft: false },
            { x: -this.trackWidth / 2, z: -this.wheelbase / 2, isFront: false, isLeft: true },
            { x: this.trackWidth / 2, z: -this.wheelbase / 2, isFront: false, isLeft: false },
        ];
        wheelPositions.forEach(pos => {
            const pivotGroup = new THREE.Group();
            pivotGroup.position.set(pos.x, this.wheelRadius, pos.z);
            this.group.add(pivotGroup);
            const spinGroup = new THREE.Group();
            pivotGroup.add(spinGroup);
            const wheelMesh = new THREE.Group();
            const tireGeo = new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, 0.28, 32);
            tireGeo.rotateZ(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, Materials.carTireRubber);
            tire.castShadow = true;
            wheelMesh.add(tire);
            const rimLipGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.282, 32, 1, true);
            rimLipGeo.rotateZ(Math.PI / 2);
            const rimLip = new THREE.Mesh(rimLipGeo, this.rimMaterial);
            wheelMesh.add(rimLip);
            const rimFace = new THREE.Group();
            const spokeCount = 10;
            for (let i = 0; i < spokeCount; i++) {
                const spokeGeo = new THREE.BoxGeometry(0.024, 0.25, 0.03);
                const spoke = new THREE.Mesh(spokeGeo, this.rimMaterial);
                spoke.position.set(pos.isLeft ? -0.13 : 0.13, 0.12, 0);
                spoke.rotation.x = (i * Math.PI * 2) / spokeCount;
                rimFace.add(spoke);
            }
            wheelMesh.add(rimFace);
            const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32);
            discGeo.rotateZ(Math.PI / 2);
            const disc = new THREE.Mesh(discGeo, Materials.carBrakeDisc);
            disc.position.set(pos.isLeft ? -0.06 : 0.06, 0, 0);
            wheelMesh.add(disc);
            spinGroup.add(wheelMesh);
            const caliperGeo = new THREE.BoxGeometry(0.09, 0.16, 0.12);
            const caliper = new THREE.Mesh(caliperGeo, Materials.carBrakeCaliper);
            caliper.position.set(pos.isLeft ? -0.06 : 0.06, 0.14, 0.08);
            pivotGroup.add(caliper);
            this.wheels.push({
                pivotGroup,
                spinGroup,
                mesh: wheelMesh,
                isFront: pos.isFront,
                isLeft: pos.isLeft,
                radius: this.wheelRadius
            });
        });
    }
    private buildLighting() {
        const hlGeo = new THREE.PlaneGeometry(0.38, 0.16);
        hlGeo.rotateY(Math.PI / 2);
        this.headlightMeshLeft = new THREE.Mesh(hlGeo, Materials.carHeadlightCluster);
        this.headlightMeshLeft.position.set(-0.76, 0.44, 2.06);
        this.headlightMeshLeft.rotation.y = -0.25;
        this.chassisGroup.add(this.headlightMeshLeft);
        this.headlightMeshRight = new THREE.Mesh(hlGeo, Materials.carHeadlightCluster);
        this.headlightMeshRight.position.set(0.76, 0.44, 2.06);
        this.headlightMeshRight.rotation.y = 0.25;
        this.chassisGroup.add(this.headlightMeshRight);
        this.headlightsLeft = new THREE.SpotLight(0xf0f9ff, 6.0, 80, Math.PI / 5.5, 0.35, 1.2);
        this.headlightsLeft.position.set(-0.72, 0.46, 2.15);
        this.headlightsLeft.target.position.set(-0.72, 0.1, 30);
        this.headlightsLeft.castShadow = true;
        this.group.add(this.headlightsLeft);
        this.group.add(this.headlightsLeft.target);
        this.headlightsRight = new THREE.SpotLight(0xf0f9ff, 6.0, 80, Math.PI / 5.5, 0.35, 1.2);
        this.headlightsRight.position.set(0.72, 0.46, 2.15);
        this.headlightsRight.target.position.set(0.72, 0.1, 30);
        this.headlightsRight.castShadow = true;
        this.group.add(this.headlightsRight);
        this.group.add(this.headlightsRight.target);
        const tlGeo = new THREE.BoxGeometry(1.76, 0.07, 0.05);
        this.taillightMesh = new THREE.Mesh(tlGeo, Materials.carTaillightLit);
        this.taillightMesh.position.set(0, 0.63, -2.27);
        this.chassisGroup.add(this.taillightMesh);
        this.brakeLightsLeft = new THREE.PointLight(0xff0022, 1.0, 8, 2);
        this.brakeLightsLeft.position.set(-0.7, 0.62, -2.35);
        this.group.add(this.brakeLightsLeft);
        this.brakeLightsRight = new THREE.PointLight(0xff0022, 1.0, 8, 2);
        this.brakeLightsRight.position.set(0.7, 0.62, -2.35);
        this.group.add(this.brakeLightsRight);
        const revGeo = new THREE.BoxGeometry(0.32, 0.05, 0.04);
        const revMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.0
        });
        this.reverseLightMesh = new THREE.Mesh(revGeo, revMat);
        this.reverseLightMesh.position.set(0, 0.48, -2.28);
        this.chassisGroup.add(this.reverseLightMesh);
        const tsGeo = new THREE.BoxGeometry(0.12, 0.05, 0.04);
        const tsMatL = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.0
        });
        const tsMatR = tsMatL.clone();
        this.turnSignalMeshL = new THREE.Mesh(tsGeo, tsMatL);
        this.turnSignalMeshL.position.set(-0.84, 0.44, 2.12);
        this.chassisGroup.add(this.turnSignalMeshL);
        this.turnSignalMeshR = new THREE.Mesh(tsGeo, tsMatR);
        this.turnSignalMeshR.position.set(0.84, 0.44, 2.12);
        this.chassisGroup.add(this.turnSignalMeshR);
    }
    private buildNitroAndUnderglow() {
        const ugGeo = new THREE.PlaneGeometry(1.7, 2.9);
        ugGeo.rotateX(-Math.PI / 2);
        const ugMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.underglowMesh = new THREE.Mesh(ugGeo, ugMat);
        this.underglowMesh.position.set(0, 0.04, 0);
        this.group.add(this.underglowMesh);
        this.underglowLight = new THREE.PointLight(0x38bdf8, 1.5, 4.0, 2);
        this.underglowLight.position.set(0, 0.16, 0);
        this.group.add(this.underglowLight);
        const flameGeo = new THREE.ConeGeometry(0.065, 0.42, 12);
        flameGeo.rotateX(Math.PI / 2);
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.95
        });
        [-0.55, -0.4, 0.4, 0.55].forEach(ex => {
            const flame = new THREE.Mesh(flameGeo, flameMat.clone());
            flame.position.set(ex, 0.22, -2.62);
            flame.visible = false;
            this.chassisGroup.add(flame);
            this.exhaustFlames.push(flame);
        });
    }
    public setSteering(angleRad: number) {
        this.steerAngle = angleRad;
        this.wheels.forEach(wheel => {
            if (wheel.isFront) {
                wheel.pivotGroup.rotation.y = angleRad;
            }
        });
    }
    public addWheelTravel(distanceMeters: number) {
        const angleDelta = distanceMeters / this.wheelRadius;
        this.wheelRotation += angleDelta;
        this.wheels.forEach(wheel => {
            wheel.spinGroup.rotation.x = this.wheelRotation;
        });
    }
    public setSuspensionDynamics(pitchRad: number, rollRad: number) {
        this.chassisGroup.rotation.x = pitchRad;
        this.chassisGroup.rotation.z = rollRad;
    }
    public toggleHeadlights(on?: boolean) {
        this.areHeadlightsOn = on !== undefined ? on : !this.areHeadlightsOn;
        this.headlightsLeft.visible = this.areHeadlightsOn;
        this.headlightsRight.visible = this.areHeadlightsOn;
    }
    public setBrakingVisual(braking: boolean) {
        this.isBraking = braking;
        if (braking) {
            (Materials.carTaillightLit as THREE.MeshStandardMaterial).emissiveIntensity = 4.8;
            this.brakeLightsLeft.intensity = 3.5;
            this.brakeLightsRight.intensity = 3.5;
        }
        else {
            (Materials.carTaillightLit as THREE.MeshStandardMaterial).emissiveIntensity = 1.6;
            this.brakeLightsLeft.intensity = 0.6;
            this.brakeLightsRight.intensity = 0.6;
        }
    }
    public setReverseVisual(reversing: boolean) {
        this.isReversing = reversing;
        if (this.reverseLightMesh) {
            (this.reverseLightMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = reversing ? 3.0 : 0.0;
        }
    }
    public toggleHazards() {
        this.hazardActive = !this.hazardActive;
        if (!this.hazardActive) {
            (this.turnSignalMeshL.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
            (this.turnSignalMeshR.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
        }
    }
    public emitTireSmoke(isDrifting: boolean, dt: number) {
        if (isDrifting && this.smokeParticles.length < 24) {
            [-0.85, 0.85].forEach(rx => {
                const mesh = new THREE.Mesh(this.smokeGeometry, this.smokeMaterial.clone());
                mesh.position.set(rx, 0.1, -1.36);
                this.smokeGroup.add(mesh);
                this.smokeParticles.push({
                    mesh,
                    life: 0,
                    maxLife: 0.65 + Math.random() * 0.35,
                    velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, 0.8 + Math.random() * 0.6, -2.0)
                });
            });
        }
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                this.smokeGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                this.smokeParticles.splice(i, 1);
            }
            else {
                const t = p.life / p.maxLife;
                p.mesh.position.addScaledVector(p.velocity, dt);
                const s = 1.0 + t * 4.0;
                p.mesh.scale.set(s, s, s);
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1.0 - t) * 0.45;
            }
        }
    }
    public updateAnimation(dt: number) {
        if (this.hazardActive) {
            this.blinkTimer += dt;
            if (this.blinkTimer > 0.35) {
                this.blinkTimer = 0;
                this.blinkState = !this.blinkState;
                const intensity = this.blinkState ? 4.0 : 0.0;
                (this.turnSignalMeshL.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
                (this.turnSignalMeshR.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
            }
        }
    }
    public setNitroFlames(active: boolean, intensity: number = 1.0) {
        this.exhaustFlames.forEach(flame => {
            flame.visible = active;
            if (active) {
                const scaleZ = 0.8 + Math.random() * 0.5 * intensity;
                const scaleXY = 0.8 + Math.random() * 0.35;
                flame.scale.set(scaleXY, scaleXY, scaleZ);
            }
        });
    }
    public setUnderglow(colorHex: string | null) {
        if (!colorHex || colorHex === 'off') {
            if (this.underglowMesh)
                this.underglowMesh.visible = false;
            if (this.underglowLight)
                this.underglowLight.visible = false;
        }
        else {
            if (this.underglowMesh) {
                this.underglowMesh.visible = true;
                (this.underglowMesh.material as THREE.MeshBasicMaterial).color.set(colorHex);
            }
            if (this.underglowLight) {
                this.underglowLight.visible = true;
                this.underglowLight.color.set(colorHex);
            }
        }
    }
    public setPaint(colorHex: string, finish: 'gloss' | 'metallic' | 'matte' = 'metallic') {
        this.paintMaterial.color.set(colorHex);
        if (finish === 'gloss') {
            this.paintMaterial.roughness = 0.12;
            this.paintMaterial.metalness = 0.2;
        }
        else if (finish === 'metallic') {
            this.paintMaterial.roughness = 0.24;
            this.paintMaterial.metalness = 0.88;
        }
        else if (finish === 'matte') {
            this.paintMaterial.roughness = 0.78;
            this.paintMaterial.metalness = 0.08;
        }
    }
    public setRimColor(colorHex: string) {
        this.rimMaterial.color.set(colorHex);
    }
}
