import * as THREE from 'three';
import { SportsCar } from '../vehicle/SportsCar';
export type CameraMode = 'chase_dynamic' | 'chase_close' | 'hood' | 'orbit';
export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public car: SportsCar;
    public currentMode: CameraMode = 'chase_dynamic';
    private currentCameraPos: THREE.Vector3 = new THREE.Vector3(0, 3.2, -7.0);
    private currentLookTarget: THREE.Vector3 = new THREE.Vector3(0, 1.1, 2.0);
    private orbitYaw: number = 0;
    private orbitPitch: number = 0.28;
    private orbitDistance: number = 7.5;
    private isPointerDown: boolean = false;
    private lastPointerX: number = 0;
    private lastPointerY: number = 0;
    constructor(camera: THREE.PerspectiveCamera, car: SportsCar) {
        this.camera = camera;
        this.car = car;
        this.currentCameraPos.copy(car.group.position).add(new THREE.Vector3(0, 3.2, -7.0));
        this.currentLookTarget.copy(car.group.position).add(new THREE.Vector3(0, 1.1, 2.0));
        this.setupOrbitListeners();
    }
    private setupOrbitListeners() {
        window.addEventListener('mousedown', (e) => {
            this.isPointerDown = true;
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
        });
        window.addEventListener('mouseup', () => {
            this.isPointerDown = false;
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isPointerDown)
                return;
            const dx = e.clientX - this.lastPointerX;
            const dy = e.clientY - this.lastPointerY;
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
            if (this.currentMode === 'orbit') {
                this.orbitYaw -= dx * 0.006;
                this.orbitPitch = THREE.MathUtils.clamp(this.orbitPitch + dy * 0.006, -0.1, 1.2);
            }
        });
        window.addEventListener('wheel', (e) => {
            if (this.currentMode === 'orbit') {
                this.orbitDistance = THREE.MathUtils.clamp(this.orbitDistance + e.deltaY * 0.01, 3.0, 20.0);
            }
        });
    }
    public cycleCameraMode(): string {
        const modes: CameraMode[] = ['chase_dynamic', 'chase_close', 'hood', 'orbit'];
        const idx = modes.indexOf(this.currentMode);
        this.currentMode = modes[(idx + 1) % modes.length];
        if (this.currentMode === 'orbit') {
            this.orbitYaw = this.car.group.rotation.y + Math.PI * 0.85;
            this.orbitPitch = 0.32;
            this.orbitDistance = 7.5;
        }
        const labels: Record<CameraMode, string> = {
            'chase_dynamic': 'CHASE (DYNAMIC)',
            'chase_close': 'CHASE (CLOSE)',
            'hood': 'HOOD / COCKPIT',
            'orbit': 'SHOWCASE ORBIT (DRAG MOUSE)'
        };
        return labels[this.currentMode];
    }
    public update(dt: number, speedMps: number) {
        if (dt > 0.1)
            dt = 0.1;
        const carPos = this.car.group.position;
        const carHeading = this.car.group.rotation.y;
        const forward = new THREE.Vector3(Math.sin(carHeading), 0, Math.cos(carHeading));
        const back = forward.clone().negate();
        if (this.currentMode === 'chase_dynamic') {
            const distance = 6.8;
            const height = 3.1;
            const idealCameraPos = carPos.clone()
                .add(back.clone().multiplyScalar(distance))
                .add(new THREE.Vector3(0, height, 0));
            const idealLookTarget = carPos.clone()
                .add(forward.clone().multiplyScalar(3.2))
                .add(new THREE.Vector3(0, 1.1, 0));
            const followSharpness = 5.5;
            this.currentCameraPos.lerp(idealCameraPos, THREE.MathUtils.clamp(dt * followSharpness, 0, 1));
            this.currentLookTarget.lerp(idealLookTarget, THREE.MathUtils.clamp(dt * 7.5, 0, 1));
            this.camera.position.copy(this.currentCameraPos);
            this.camera.lookAt(this.currentLookTarget);
            const speedKmh = Math.abs(speedMps * 3.6);
            const targetFOV = THREE.MathUtils.lerp(56, 68, Math.min(1.0, speedKmh / 160));
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, dt * 4.0);
            this.camera.updateProjectionMatrix();
        }
        else if (this.currentMode === 'chase_close') {
            const distance = 4.8;
            const height = 2.0;
            const idealCameraPos = carPos.clone()
                .add(back.clone().multiplyScalar(distance))
                .add(new THREE.Vector3(0, height, 0));
            const idealLookTarget = carPos.clone()
                .add(forward.clone().multiplyScalar(2.0))
                .add(new THREE.Vector3(0, 1.0, 0));
            this.currentCameraPos.lerp(idealCameraPos, THREE.MathUtils.clamp(dt * 8.0, 0, 1));
            this.currentLookTarget.lerp(idealLookTarget, THREE.MathUtils.clamp(dt * 9.0, 0, 1));
            this.camera.position.copy(this.currentCameraPos);
            this.camera.lookAt(this.currentLookTarget);
            this.camera.fov = 60;
            this.camera.updateProjectionMatrix();
        }
        else if (this.currentMode === 'hood') {
            const hoodOffset = new THREE.Vector3(0, 0.85, 0.6).applyQuaternion(this.car.group.quaternion);
            const lookOffset = new THREE.Vector3(0, 0.88, 20.0).applyQuaternion(this.car.group.quaternion);
            this.camera.position.copy(carPos).add(hoodOffset);
            this.camera.lookAt(carPos.clone().add(lookOffset));
            this.camera.fov = 72;
            this.camera.updateProjectionMatrix();
        }
        else if (this.currentMode === 'orbit') {
            const target = carPos.clone().add(new THREE.Vector3(0, 1.0, 0));
            const ox = target.x + this.orbitDistance * Math.cos(this.orbitPitch) * Math.sin(this.orbitYaw);
            const oy = target.y + this.orbitDistance * Math.sin(this.orbitPitch);
            const oz = target.z + this.orbitDistance * Math.cos(this.orbitPitch) * Math.cos(this.orbitYaw);
            this.camera.position.set(ox, oy, oz);
            this.camera.lookAt(target);
            this.camera.fov = 55;
            this.camera.updateProjectionMatrix();
        }
    }
}
