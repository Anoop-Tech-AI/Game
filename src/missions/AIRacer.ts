import * as THREE from 'three';
import { Materials } from '../rendering/Materials';

export interface AIRacerConfig {
    id: string;
    name: string;
    colorHex: string;
    modelType: 'sports' | 'muscle' | 'hyper';
    difficulty: 'easy' | 'normal' | 'hard';
}

export class AIRacer {
    public config: AIRacerConfig;
    public group: THREE.Group;
    public position: THREE.Vector3 = new THREE.Vector3();
    public velocity: THREE.Vector3 = new THREE.Vector3();
    public speed: number = 0;
    public heading: number = 0;
    public currentWaypointIndex: number = 0;
    public route: THREE.Vector3[] = [];
    public lap: number = 1;
    public totalDistanceCovered: number = 0;
    public isFinished: boolean = false;
    public finishTime: number = 0;

    private chassis: THREE.Mesh;
    private wheels: THREE.Group[] = [];
    private steerAngle: number = 0;
    private wheelSpin: number = 0;
    private stuckTimer: number = 0;
    private isReversing: boolean = false;
    private reverseTimer: number = 0;

    public maxSpeed: number = 60.0;
    public maxTorque: number = 18.0;
    public brakeForce: number = 25.0;
    public steerSpeed: number = 4.0;

    constructor(config: AIRacerConfig) {
        this.config = config;
        this.group = new THREE.Group();
        this.group.name = `AIRacer_${config.id}`;

        this.applyDifficulty(config.difficulty);

        const bodyGeo = new THREE.BoxGeometry(1.85, 0.65, 4.3);
        const paintMat = new THREE.MeshStandardMaterial({
            color: config.colorHex,
            roughness: 0.25,
            metalness: 0.85
        });
        this.chassis = new THREE.Mesh(bodyGeo, paintMat);
        this.chassis.position.y = 0.45;
        this.chassis.castShadow = true;
        this.group.add(this.chassis);

        const roofGeo = new THREE.BoxGeometry(1.3, 0.45, 1.8);
        const glassMat = Materials.carTintedGlass;
        const roof = new THREE.Mesh(roofGeo, glassMat);
        roof.position.set(0, 0.85, -0.2);
        this.group.add(roof);

        const spoilerGeo = new THREE.BoxGeometry(1.6, 0.06, 0.3);
        const spoilerMat = Materials.carCarbonFiber;
        const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
        spoiler.position.set(0, 0.95, -1.9);
        this.group.add(spoiler);

        const hlMat = Materials.carHeadlightCluster;
        [-0.7, 0.7].forEach(x => {
            const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.1), hlMat);
            hl.position.set(x, 0.45, 2.15);
            this.group.add(hl);
        });

        const tlMat = Materials.carTaillightLit;
        const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.05), tlMat);
        tl.position.set(0, 0.55, -2.16);
        this.group.add(tl);

        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.26, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = Materials.carTireRubber;

        const wPositions = [
            { x: -0.9, z: 1.35, isFront: true },
            { x: 0.9, z: 1.35, isFront: true },
            { x: -0.9, z: -1.35, isFront: false },
            { x: 0.9, z: -1.35, isFront: false }
        ];

        wPositions.forEach(wp => {
            const wGroup = new THREE.Group();
            wGroup.position.set(wp.x, 0.35, wp.z);
            wGroup.userData = { isFront: wp.isFront };
            const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
            wMesh.castShadow = true;
            wGroup.add(wMesh);
            this.group.add(wGroup);
            this.wheels.push(wGroup);
        });
    }

    public applyDifficulty(difficulty: 'easy' | 'normal' | 'hard') {
        if (difficulty === 'easy') {
            this.maxSpeed = 50.0;
            this.maxTorque = 14.0;
            this.steerSpeed = 3.2;
        } else if (difficulty === 'normal') {
            this.maxSpeed = 64.0;
            this.maxTorque = 18.5;
            this.steerSpeed = 4.5;
        } else {
            this.maxSpeed = 76.0;
            this.maxTorque = 24.0;
            this.steerSpeed = 5.8;
        }
    }

    public setRoute(waypoints: THREE.Vector3[]) {
        this.route = waypoints;
        this.currentWaypointIndex = 0;
        this.totalDistanceCovered = 0;
        this.isFinished = false;
        this.finishTime = 0;
    }

    public spawnAt(pos: THREE.Vector3, heading: number) {
        this.position.copy(pos);
        this.heading = heading;
        this.speed = 0;
        this.velocity.set(0, 0, 0);
        this.group.position.copy(pos);
        this.group.rotation.y = heading;
        this.isFinished = false;
    }

    public update(dt: number, otherCars: THREE.Vector3[]) {
        if (this.isFinished || this.route.length === 0) return;

        const targetWp = this.route[this.currentWaypointIndex];
        const toTarget = new THREE.Vector3().subVectors(targetWp, this.position);
        toTarget.y = 0;
        const dist = toTarget.length();

        if (dist < 9.0) {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1);
            if (this.currentWaypointIndex >= this.route.length) {
                this.isFinished = true;
                return;
            }
        }

        if (Math.abs(this.speed) < 1.0 && !this.isReversing) {
            this.stuckTimer += dt;
            if (this.stuckTimer > 2.0) {
                this.isReversing = true;
                this.reverseTimer = 1.2;
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }

        let targetHeading = Math.atan2(toTarget.x, toTarget.z);

        if (this.isReversing) {
            this.reverseTimer -= dt;
            if (this.reverseTimer <= 0) {
                this.isReversing = false;
            }
            this.speed = -8.0;
            this.heading += 0.8 * dt;
        } else {
            for (const otherPos of otherCars) {
                if (otherPos === this.position) continue;
                const d = this.position.distanceTo(otherPos);
                if (d < 5.0) {
                    const avoidVec = new THREE.Vector3().subVectors(this.position, otherPos).normalize();
                    targetHeading += Math.sign(avoidVec.x) * 0.35;
                }
            }

            let angleDiff = targetHeading - this.heading;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            this.steerAngle = THREE.MathUtils.clamp(angleDiff * 1.5, -0.52, 0.52);
            this.heading += this.steerAngle * this.steerSpeed * dt;

            const isSharpCorner = Math.abs(angleDiff) > 0.45;
            if (isSharpCorner && this.speed > 28.0) {
                this.speed -= this.brakeForce * dt;
            } else if (this.speed < this.maxSpeed) {
                this.speed += this.maxTorque * dt;
            }
        }

        const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
        const deltaMove = forward.multiplyScalar(this.speed * dt);
        this.position.add(deltaMove);
        this.totalDistanceCovered += Math.abs(this.speed * dt);

        this.group.position.copy(this.position);
        this.group.rotation.y = this.heading;

        const spinDelta = (this.speed * dt) / 0.35;
        this.wheelSpin += spinDelta;
        this.wheels.forEach(w => {
            if (w.userData.isFront) {
                w.rotation.y = this.steerAngle;
            }
            const mesh = w.children[0] as THREE.Mesh;
            if (mesh) mesh.rotation.x = this.wheelSpin;
        });
    }
}
