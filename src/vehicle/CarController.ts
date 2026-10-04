import * as THREE from 'three';
import { SportsCar } from './SportsCar';
export interface CarInputs {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    handbrake: boolean;
    boost: boolean;
    reset: boolean;
}
export interface CollisionBox {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    height: number;
}
export class CarController {
    public car: SportsCar;
    public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    public speed: number = 0;
    public currentHeading: number = 0;
    public steeringInput: number = 0;
    public currentSteerAngle: number = 0;
    public currentGear: number = 1;
    public rpm: number = 800;
    public nitroAmount: number = 100.0;
    public isBoosting: boolean = false;
    public isDrifting: boolean = false;
    public slipAngle: number = 0;
    public nitroDuration: number = 4.5;
    public maxEngineTorque = 18.0;
    public maxReverseSpeed = -12.0;
    public maxForwardSpeed = 68.0;
    public brakingDecel = 24.0;
    public naturalDrag = 0.985;
    public rollingResistance = 1.8;
    public maxSteerAngle = 0.58;
    public steerSpeed = 4.2;
    public centeringSpeed = 6.0;
    private suspensionPitch: number = 0;
    private suspensionRoll: number = 0;
    public colliders: CollisionBox[] = [];
    constructor(car: SportsCar) {
        this.car = car;
        this.resetPosition();
    }
    public resetPosition(x: number = 0, z: number = -20, heading: number = 0) {
        this.position.set(x, 0, z);
        this.velocity.set(0, 0, 0);
        this.speed = 0;
        this.currentHeading = heading;
        this.steeringInput = 0;
        this.currentSteerAngle = 0;
        this.currentGear = 1;
        this.rpm = 900;
        this.nitroAmount = 100;
        this.isBoosting = false;
        this.isDrifting = false;
        this.slipAngle = 0;
        this.car.setNitroFlames(false);
        this.updateCarTransform();
    }
    public applyTuning(stats: {
        topSpeed: number;
        torque: number;
        handling: number;
        nitroDuration: number;
    }) {
        this.maxForwardSpeed = stats.topSpeed;
        this.maxEngineTorque = stats.torque;
        this.steerSpeed = stats.handling;
        this.nitroDuration = stats.nitroDuration;
    }
    public update(dt: number, inputs: CarInputs) {
        if (dt > 0.1)
            dt = 0.1;
        if (inputs.reset) {
            this.resetPosition();
            return;
        }
        const speedRatio = Math.min(1.0, Math.abs(this.speed) / 45.0);
        const effectiveMaxSteer = THREE.MathUtils.lerp(this.maxSteerAngle, 0.16, speedRatio);
        let targetSteer = 0;
        if (inputs.left)
            targetSteer += 1;
        if (inputs.right)
            targetSteer -= 1;
        if (targetSteer !== 0) {
            this.currentSteerAngle = THREE.MathUtils.damp(this.currentSteerAngle, targetSteer * effectiveMaxSteer, this.steerSpeed, dt);
        }
        else {
            this.currentSteerAngle = THREE.MathUtils.damp(this.currentSteerAngle, 0, this.centeringSpeed, dt);
        }
        this.car.setSteering(this.currentSteerAngle);
        let isBraking = false;
        let acceleration = 0;
        if (inputs.forward) {
            if (this.speed >= -1.0) {
                const powerRatio = Math.max(0.18, 1.0 - (this.speed / this.maxForwardSpeed));
                acceleration = this.maxEngineTorque * powerRatio;
            }
            else {
                acceleration = this.brakingDecel;
                isBraking = true;
            }
        }
        else if (inputs.backward) {
            if (this.speed > 1.0) {
                acceleration = -this.brakingDecel;
                isBraking = true;
            }
            else {
                if (this.speed > this.maxReverseSpeed) {
                    acceleration = -this.maxEngineTorque * 0.45;
                }
            }
        }
        if (inputs.handbrake) {
            isBraking = true;
            if (Math.abs(this.speed) > 0.2) {
                acceleration -= Math.sign(this.speed) * this.brakingDecel * 1.4;
            }
        }
        if (inputs.boost && this.nitroAmount > 1.0 && this.speed > 2.0) {
            this.isBoosting = true;
            this.nitroAmount = Math.max(0, this.nitroAmount - dt * (100 / this.nitroDuration));
            acceleration += 24.0;
            const boostLimit = this.maxForwardSpeed * 1.35;
            if (this.speed < boostLimit) {
                this.speed += 20.0 * dt;
            }
            this.car.setNitroFlames(true, 1.3);
        }
        else {
            this.isBoosting = false;
            this.car.setNitroFlames(false);
            if (this.isDrifting) {
                this.nitroAmount = Math.min(100, this.nitroAmount + dt * 14.0);
            }
            else if (Math.abs(this.speed) > 10.0) {
                this.nitroAmount = Math.min(100, this.nitroAmount + dt * 3.5);
            }
        }
        this.car.setBrakingVisual(isBraking);
        this.car.setReverseVisual(this.speed < -0.2);
        this.car.emitTireSmoke(this.isDrifting || (Math.abs(this.speed) < 5.0 && inputs.forward), dt);
        this.car.updateAnimation(dt);
        this.speed += acceleration * dt;
        if (Math.abs(this.speed) > 0.05) {
            const dragSign = Math.sign(this.speed);
            const decel = (this.rollingResistance + 0.0035 * this.speed * this.speed) * dt;
            if (Math.abs(this.speed) <= decel) {
                this.speed = 0;
            }
            else {
                this.speed -= dragSign * decel;
            }
        }
        else {
            this.speed = 0;
        }
        const isDriftInput = inputs.handbrake || (Math.abs(this.currentSteerAngle) > 0.22 && Math.abs(this.speed) > 13.0);
        this.isDrifting = isDriftInput;
        this.slipAngle = isDriftInput ? this.currentSteerAngle * 1.6 : 0;
        if (Math.abs(this.speed) > 0.1) {
            const turnRadius = this.car.wheelbase / Math.tan(Math.max(0.001, Math.abs(this.currentSteerAngle)));
            let angularVelocity = (this.speed / turnRadius) * Math.sign(this.currentSteerAngle);
            if (inputs.handbrake) {
                angularVelocity *= 2.1;
            }
            this.currentHeading += angularVelocity * dt;
        }
        const forwardDir = new THREE.Vector3(Math.sin(this.currentHeading), 0, Math.cos(this.currentHeading));
        const oldPos = this.position.clone();
        this.velocity.copy(forwardDir).multiplyScalar(this.speed);
        this.position.addScaledVector(this.velocity, dt);
        this.checkCollisions(oldPos);
        const distanceTraveled = this.speed * dt;
        this.car.addWheelTravel(distanceTraveled);
        const targetPitch = THREE.MathUtils.clamp(-acceleration * 0.0035, -0.06, 0.06);
        const targetRoll = THREE.MathUtils.clamp(-this.currentSteerAngle * this.speed * 0.003, -0.08, 0.08);
        this.suspensionPitch = THREE.MathUtils.lerp(this.suspensionPitch, targetPitch, dt * 10);
        this.suspensionRoll = THREE.MathUtils.lerp(this.suspensionRoll, targetRoll, dt * 10);
        this.car.setSuspensionDynamics(this.suspensionPitch, this.suspensionRoll);
        this.calculateGearsAndRPM();
        this.updateCarTransform();
    }
    private checkCollisions(previousPos: THREE.Vector3) {
        const carHalfWidth = this.car.width * 0.45;
        const carHalfLength = this.car.length * 0.45;
        for (const box of this.colliders) {
            const minX = this.position.x - carHalfWidth;
            const maxX = this.position.x + carHalfWidth;
            const minZ = this.position.z - carHalfLength;
            const maxZ = this.position.z + carHalfLength;
            if (maxX >= box.minX && minX <= box.maxX && maxZ >= box.minZ && minZ <= box.maxZ) {
                this.position.copy(previousPos);
                this.speed *= -0.35;
                this.velocity.multiplyScalar(-0.35);
                break;
            }
        }
    }
    private calculateGearsAndRPM() {
        const kmh = Math.abs(this.speed * 3.6);
        if (this.speed < -0.5) {
            this.currentGear = -1;
            this.rpm = 1200 + Math.min(6500, kmh * 150);
            return;
        }
        if (kmh < 1) {
            this.currentGear = 1;
            this.rpm = 900;
            return;
        }
        if (kmh < 45) {
            this.currentGear = 1;
            this.rpm = 900 + (kmh / 45) * 6500;
        }
        else if (kmh < 85) {
            this.currentGear = 2;
            this.rpm = 3200 + ((kmh - 45) / 40) * 4500;
        }
        else if (kmh < 135) {
            this.currentGear = 3;
            this.rpm = 3600 + ((kmh - 85) / 50) * 4400;
        }
        else if (kmh < 190) {
            this.currentGear = 4;
            this.rpm = 4000 + ((kmh - 135) / 55) * 4200;
        }
        else {
            this.currentGear = 5;
            this.rpm = 4200 + ((kmh - 190) / 60) * 4000;
        }
        this.rpm = Math.min(8500, Math.max(900, this.rpm));
    }
    private updateCarTransform() {
        this.car.group.position.copy(this.position);
        this.car.group.rotation.y = this.currentHeading;
    }
    public getSpeedKmh(): number {
        return Math.abs(this.speed * 3.6);
    }
}
