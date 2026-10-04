import * as THREE from 'three';
import { SkyEnvironment } from './SkyEnvironment';
import { Materials } from './Materials';
export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'fog';
export class WeatherSystem {
    public scene: THREE.Scene;
    public skyEnv: SkyEnvironment;
    public currentWeather: WeatherType = 'clear';
    private rainParticles: THREE.Points | null = null;
    private rainCount: number = 2400;
    private rainGeometry: THREE.BufferGeometry | null = null;
    private rainPositions: Float32Array | null = null;
    private rainVelocities: Float32Array | null = null;
    private rainMaterial: THREE.PointsMaterial | null = null;
    public wetness: number = 0;
    private targetWetness: number = 0;
    private transitionAlpha: number = 1.0;
    private weatherTransitionSpeed: number = 1.2;
    private originalAsphaltRoughness: number = 0.82;
    private originalAsphaltMetalness: number = 0.08;
    constructor(scene: THREE.Scene, skyEnv: SkyEnvironment) {
        this.scene = scene;
        this.skyEnv = skyEnv;
        this.initRainParticles();
    }
    private initRainParticles() {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.rainCount * 3);
        const velocities = new Float32Array(this.rainCount);
        const boxRadius = 45;
        const boxHeight = 35;
        for (let i = 0; i < this.rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * boxRadius * 2;
            positions[i * 3 + 1] = Math.random() * boxHeight;
            positions[i * 3 + 2] = (Math.random() - 0.5) * boxRadius * 2;
            velocities[i] = 28 + Math.random() * 16;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.rainGeometry = geo;
        this.rainPositions = positions;
        this.rainVelocities = velocities;
        this.rainMaterial = new THREE.PointsMaterial({
            color: 0x93c5fd,
            size: 0.18,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        this.rainParticles = new THREE.Points(geo, this.rainMaterial);
        this.rainParticles.frustumCulled = false;
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);
    }
    public setWeather(type: WeatherType) {
        this.currentWeather = type;
        if (type === 'rain') {
            this.targetWetness = 1.0;
            if (this.rainParticles)
                this.rainParticles.visible = true;
            if (this.rainMaterial)
                this.rainMaterial.opacity = 0.75;
            this.skyEnv.fog.density = 0.0055;
            this.skyEnv.fog.color.setHex(0x334155);
            this.skyEnv.sunLight.intensity = 1.2;
        }
        else if (type === 'fog') {
            this.targetWetness = 0.35;
            if (this.rainParticles)
                this.rainParticles.visible = false;
            this.skyEnv.fog.density = 0.016;
            this.skyEnv.fog.color.setHex(0x94a3b8);
            this.skyEnv.sunLight.intensity = 1.4;
        }
        else if (type === 'cloudy') {
            this.targetWetness = 0.1;
            if (this.rainParticles)
                this.rainParticles.visible = false;
            this.skyEnv.fog.density = 0.004;
            this.skyEnv.fog.color.setHex(0x64748b);
            this.skyEnv.sunLight.intensity = 2.0;
        }
        else {
            this.targetWetness = 0.0;
            if (this.rainParticles)
                this.rainParticles.visible = false;
            this.skyEnv.fog.density = 0.003;
            this.skyEnv.fog.color.setHex(0xc5ddf5);
            this.skyEnv.sunLight.intensity = 3.4;
        }
    }
    public cycleWeather(): WeatherType {
        const list: WeatherType[] = ['clear', 'cloudy', 'rain', 'fog'];
        const nextIdx = (list.indexOf(this.currentWeather) + 1) % list.length;
        this.setWeather(list[nextIdx]);
        return list[nextIdx];
    }
    public update(dt: number, playerPos: THREE.Vector3) {
        if (Math.abs(this.wetness - this.targetWetness) > 0.005) {
            this.wetness = THREE.MathUtils.lerp(this.wetness, this.targetWetness, dt * this.weatherTransitionSpeed);
            if (Materials.asphalt) {
                Materials.asphalt.roughness = THREE.MathUtils.lerp(this.originalAsphaltRoughness, 0.18, this.wetness);
                Materials.asphalt.metalness = THREE.MathUtils.lerp(this.originalAsphaltMetalness, 0.42, this.wetness);
                Materials.asphalt.needsUpdate = true;
            }
        }
        if (this.currentWeather === 'rain' && this.rainParticles && this.rainPositions && this.rainVelocities) {
            const boxRadius = 45;
            const boxHeight = 35;
            const posAttr = this.rainGeometry!.getAttribute('position') as THREE.BufferAttribute;
            const posArray = posAttr.array as Float32Array;
            this.rainParticles.position.x = playerPos.x;
            this.rainParticles.position.z = playerPos.z;
            for (let i = 0; i < this.rainCount; i++) {
                let y = posArray[i * 3 + 1];
                y -= this.rainVelocities[i] * dt;
                if (y < 0) {
                    y = boxHeight;
                    posArray[i * 3] = (Math.random() - 0.5) * boxRadius * 2;
                    posArray[i * 3 + 2] = (Math.random() - 0.5) * boxRadius * 2;
                }
                posArray[i * 3 + 1] = y;
            }
            posAttr.needsUpdate = true;
        }
    }
}
