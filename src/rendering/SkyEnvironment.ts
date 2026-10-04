import * as THREE from 'three';
export type TimeOfDayPreset = 'afternoon' | 'golden_hour' | 'night';
export class SkyEnvironment {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public sunLight: THREE.DirectionalLight;
    public hemiLight: THREE.HemisphereLight;
    public fog: THREE.FogExp2;
    public envMap: THREE.Texture | null = null;
    public currentPreset: TimeOfDayPreset = 'afternoon';
    public streetLights: THREE.Light[] = [];
    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.sunLight = new THREE.DirectionalLight(0xfff6ec, 3.4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = 300;
        this.sunLight.shadow.camera.left = -80;
        this.sunLight.shadow.camera.right = 80;
        this.sunLight.shadow.camera.top = 80;
        this.sunLight.shadow.camera.bottom = -80;
        this.sunLight.shadow.bias = -0.0003;
        this.sunLight.shadow.normalBias = 0.02;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
        this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x64748b, 1.6);
        this.scene.add(this.hemiLight);
        this.fog = new THREE.FogExp2(0xc5ddf5, 0.0032);
        this.scene.fog = this.fog;
        this.setTimeOfDay('afternoon');
    }
    private createSkyTexture(preset: TimeOfDayPreset): THREE.CanvasTexture {
        const w = 2048;
        const h = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        if (preset === 'afternoon') {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0.0, '#104e92');
            grad.addColorStop(0.35, '#2563eb');
            grad.addColorStop(0.65, '#60a5fa');
            grad.addColorStop(0.85, '#bfdbfe');
            grad.addColorStop(1.0, '#dbeafe');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const sunX = w * 0.45;
            const sunY = h * 0.28;
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 220);
            sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            sunGlow.addColorStop(0.15, 'rgba(255, 250, 230, 0.9)');
            sunGlow.addColorStop(0.4, 'rgba(255, 240, 200, 0.35)');
            sunGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            for (let i = 0; i < 18; i++) {
                const cx = Math.random() * w;
                const cy = h * 0.25 + Math.random() * h * 0.35;
                const cw = 180 + Math.random() * 320;
                const ch = 18 + Math.random() * 26;
                ctx.beginPath();
                ctx.ellipse(cx, cy, cw, ch, Math.random() * 0.1 - 0.05, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        else if (preset === 'golden_hour') {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0.0, '#1e3a8a');
            grad.addColorStop(0.3, '#3b82f6');
            grad.addColorStop(0.6, '#f97316');
            grad.addColorStop(0.82, '#fbbf24');
            grad.addColorStop(1.0, '#fed7aa');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const sunX = w * 0.35;
            const sunY = h * 0.62;
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 340);
            sunGlow.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
            sunGlow.addColorStop(0.2, 'rgba(255, 170, 50, 0.85)');
            sunGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
            sunGlow.addColorStop(1.0, 'rgba(234, 88, 12, 0.0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 340, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(254, 215, 170, 0.28)';
            for (let i = 0; i < 16; i++) {
                const cx = Math.random() * w;
                const cy = h * 0.35 + Math.random() * h * 0.3;
                const cw = 200 + Math.random() * 350;
                const ch = 20 + Math.random() * 30;
                ctx.beginPath();
                ctx.ellipse(cx, cy, cw, ch, -0.04, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        else {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0.0, '#030712');
            grad.addColorStop(0.4, '#0b1329');
            grad.addColorStop(0.75, '#111c38');
            grad.addColorStop(1.0, '#1e294b');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 140; i++) {
                const sx = Math.random() * w;
                const sy = Math.random() * (h * 0.55);
                const sr = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }
            const moonX = w * 0.65;
            const moonY = h * 0.22;
            const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 80);
            moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            moonGlow.addColorStop(0.3, 'rgba(224, 231, 255, 0.4)');
            moonGlow.addColorStop(1.0, 'rgba(224, 231, 255, 0.0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }
    public setTimeOfDay(preset: TimeOfDayPreset) {
        this.currentPreset = preset;
        const skyTex = this.createSkyTexture(preset);
        this.scene.background = skyTex;
        this.scene.environment = skyTex;
        if (preset === 'afternoon') {
            this.sunLight.position.set(70, 110, 60);
            this.sunLight.color.setHex(0xfff6ec);
            this.sunLight.intensity = 3.6;
            this.hemiLight.color.setHex(0xdbeafe);
            this.hemiLight.groundColor.setHex(0x475569);
            this.hemiLight.intensity = 1.6;
            this.fog.color.setHex(0xc5ddf5);
            this.fog.density = 0.003;
            this.renderer.toneMappingExposure = 1.1;
            this.toggleStreetLights(false);
        }
        else if (preset === 'golden_hour') {
            this.sunLight.position.set(120, 36, 65);
            this.sunLight.color.setHex(0xff9944);
            this.sunLight.intensity = 4.5;
            this.hemiLight.color.setHex(0xfdba74);
            this.hemiLight.groundColor.setHex(0x334155);
            this.hemiLight.intensity = 1.4;
            this.fog.color.setHex(0xfed7aa);
            this.fog.density = 0.0038;
            this.renderer.toneMappingExposure = 1.2;
            this.toggleStreetLights(true);
        }
        else if (preset === 'night') {
            this.sunLight.position.set(40, 85, 40);
            this.sunLight.color.setHex(0x64748b);
            this.sunLight.intensity = 0.6;
            this.hemiLight.color.setHex(0x1e293b);
            this.hemiLight.groundColor.setHex(0x0f172a);
            this.hemiLight.intensity = 0.8;
            this.fog.color.setHex(0x111c38);
            this.fog.density = 0.005;
            this.renderer.toneMappingExposure = 1.4;
            this.toggleStreetLights(true);
        }
    }
    public registerStreetLight(light: THREE.Light) {
        this.streetLights.push(light);
        light.visible = this.currentPreset !== 'afternoon';
    }
    private toggleStreetLights(enable: boolean) {
        this.streetLights.forEach(light => {
            light.visible = enable;
        });
    }
    public update(targetPos: THREE.Vector3) {
        this.sunLight.target.position.set(targetPos.x, targetPos.y, targetPos.z);
        this.sunLight.position.set(targetPos.x + 70, targetPos.y + 110, targetPos.z + 60);
    }
}
