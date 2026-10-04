import { CarInputs } from '../vehicle/CarController';
export class InputManager {
    private keys: Record<string, boolean> = {};
    public onCameraToggle?: () => void;
    public onHeadlightsToggle?: () => void;
    public onTimeOfDayCycle?: () => void;
    public onWeatherCycle?: () => void;
    public onHazardToggle?: () => void;
    public onResetVehicle?: () => void;
    public onGarageToggle?: () => void;
    public onMissionToggle?: () => void;
    public onMapToggle?: () => void;
    public onInteract?: () => void;
    public onSettingsToggle?: () => void;
    constructor() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    private handleKeyDown(e: KeyboardEvent) {
        const key = e.code;
        this.keys[key] = true;
        if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key)) {
            e.preventDefault();
        }
        if (e.repeat)
            return;
        if (key === 'KeyC') {
            this.onCameraToggle?.();
        }
        else if (key === 'KeyL') {
            this.onHeadlightsToggle?.();
        }
        else if (key === 'KeyT') {
            this.onTimeOfDayCycle?.();
        }
        else if (key === 'KeyK') {
            this.onWeatherCycle?.();
        }
        else if (key === 'KeyH') {
            this.onHazardToggle?.();
        }
        else if (key === 'KeyR') {
            this.onResetVehicle?.();
        }
        else if (key === 'KeyG') {
            this.onGarageToggle?.();
        }
        else if (key === 'KeyM') {
            this.onMapToggle?.();
        }
        else if (key === 'KeyE') {
            this.onInteract?.();
        }
        else if (key === 'Escape' || key === 'KeyO') {
            this.onSettingsToggle?.();
        }
    }
    private handleKeyUp(e: KeyboardEvent) {
        this.keys[e.code] = false;
    }
    public getInputs(): CarInputs {
        const forward = !!(this.keys['KeyW'] || this.keys['ArrowUp']);
        const backward = !!(this.keys['KeyS'] || this.keys['ArrowDown']);
        const left = !!(this.keys['KeyA'] || this.keys['ArrowLeft']);
        const right = !!(this.keys['KeyD'] || this.keys['ArrowRight']);
        const handbrake = !!(this.keys['Space']);
        const boost = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyN']);
        const reset = !!(this.keys['KeyR']);
        return {
            forward,
            backward,
            left,
            right,
            handbrake,
            boost,
            reset
        };
    }
}
