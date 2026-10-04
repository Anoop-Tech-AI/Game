export interface VehicleSpec {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    unlocked: boolean;
    baseTopSpeed: number;
    baseTorque: number;
    baseHandling: number;
    nitroDuration: number;
    modelType: 'gt_supercar' | 'muscle_v10' | 'hypercar' | 'rally_turbo';
    defaultColor: string;
}
export interface PlayerCustomization {
    paintColor: string;
    finish: 'gloss' | 'metallic' | 'matte';
    underglowColor: string | null;
    rimColor: string;
}
export interface TuningUpgrades {
    engineStage: number;
    transmissionStage: number;
    brakesStage: number;
    tiresStage: number;
    suspensionStage: number;
    nitroStage: number;
    aeroStage: number;
}
export class GarageSystem {
    public cash: number = 5000;
    public reputation: number = 150;
    public currentCarId: string = 'apex_gt';
    public vehicles: Record<string, VehicleSpec> = {
        'apex_gt': {
            id: 'apex_gt',
            name: 'APEX GT-R',
            subtitle: 'Twin-Turbo V6 Street Icon',
            price: 0,
            unlocked: true,
            baseTopSpeed: 68.0,
            baseTorque: 18.0,
            baseHandling: 4.2,
            nitroDuration: 4.5,
            modelType: 'gt_supercar',
            defaultColor: '#c026d3'
        },
        'vipera_v10': {
            id: 'vipera_v10',
            name: 'VIPERA GTS',
            subtitle: '8.4L V10 American Muscle',
            price: 12000,
            unlocked: false,
            baseTopSpeed: 74.0,
            baseTorque: 22.5,
            baseHandling: 3.6,
            nitroDuration: 4.0,
            modelType: 'muscle_v10',
            defaultColor: '#dc2626'
        },
        'phantom_lemans': {
            id: 'phantom_lemans',
            name: 'PHANTOM HYPERCAR',
            subtitle: 'Carbon Fiber Le Mans Prototype',
            price: 35000,
            unlocked: false,
            baseTopSpeed: 88.0,
            baseTorque: 26.0,
            baseHandling: 4.8,
            nitroDuration: 6.0,
            modelType: 'hypercar',
            defaultColor: '#00f5d4'
        },
        'rally_turbo': {
            id: 'rally_turbo',
            name: 'TURBO RUNNER AWD',
            subtitle: 'Off-Road & Drift Rally Specialist',
            price: 18000,
            unlocked: false,
            baseTopSpeed: 64.0,
            baseTorque: 24.0,
            baseHandling: 5.2,
            nitroDuration: 5.0,
            modelType: 'rally_turbo',
            defaultColor: '#f59e0b'
        }
    };
    public customization: Record<string, PlayerCustomization> = {
        'apex_gt': { paintColor: '#c026d3', finish: 'metallic', underglowColor: '#38bdf8', rimColor: '#e2e8f0' },
        'vipera_v10': { paintColor: '#dc2626', finish: 'gloss', underglowColor: '#f97316', rimColor: '#1e293b' },
        'phantom_lemans': { paintColor: '#00f5d4', finish: 'metallic', underglowColor: '#00f5d4', rimColor: '#0f172a' },
        'rally_turbo': { paintColor: '#f59e0b', finish: 'matte', underglowColor: '#22c55e', rimColor: '#d97706' }
    };
    public upgrades: Record<string, TuningUpgrades> = {
        'apex_gt': { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 },
        'vipera_v10': { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 },
        'phantom_lemans': { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 },
        'rally_turbo': { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 }
    };
    public readonly upgradeCosts = [1200, 2500, 5000, 9500, 16000];
    constructor() {
        this.loadFromStorage();
    }
    public getCurrentSpec(): VehicleSpec {
        return this.vehicles[this.currentCarId] || this.vehicles['apex_gt'];
    }
    public getCurrentCustomization(): PlayerCustomization {
        return this.customization[this.currentCarId];
    }
    public getCurrentUpgrades(): TuningUpgrades {
        return this.upgrades[this.currentCarId];
    }
    public getTunedStats(carId: string = this.currentCarId) {
        const spec = this.vehicles[carId];
        const up = this.upgrades[carId] || { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 };
        const speedBonus = 1.0 + (up.engineStage * 0.06) + (up.transmissionStage * 0.05) + (up.aeroStage * 0.04);
        const torqueBonus = 1.0 + (up.engineStage * 0.10) + (up.tiresStage * 0.05);
        const nitroDuration = spec.nitroDuration * (1.0 + up.nitroStage * 0.20);
        const handling = spec.baseHandling * (1.0 + up.tiresStage * 0.08 + up.suspensionStage * 0.08);
        return {
            topSpeed: spec.baseTopSpeed * speedBonus,
            topSpeedKmh: Math.round(spec.baseTopSpeed * speedBonus * 3.6),
            torque: spec.baseTorque * torqueBonus,
            handling,
            nitroDuration
        };
    }
    public addCash(amount: number, repGain: number = 0) {
        this.cash += Math.round(amount);
        this.reputation += Math.round(repGain);
        this.saveToStorage();
    }
    public buyVehicle(carId: string): boolean {
        const spec = this.vehicles[carId];
        if (!spec || spec.unlocked)
            return false;
        if (this.cash < spec.price)
            return false;
        this.cash -= spec.price;
        spec.unlocked = true;
        this.currentCarId = carId;
        this.reputation += 250;
        this.saveToStorage();
        return true;
    }
    public selectVehicle(carId: string): boolean {
        const spec = this.vehicles[carId];
        if (!spec || !spec.unlocked)
            return false;
        this.currentCarId = carId;
        this.saveToStorage();
        return true;
    }
    public upgradePart(carId: string, part: keyof TuningUpgrades): boolean {
        const up = this.upgrades[carId];
        if (!up)
            return false;
        const currentStage = up[part];
        if (currentStage >= 5)
            return false;
        const cost = this.upgradeCosts[currentStage];
        if (this.cash < cost)
            return false;
        this.cash -= cost;
        up[part] += 1;
        this.reputation += (currentStage + 1) * 75;
        this.saveToStorage();
        return true;
    }
    public buyUpgrade(part: 'engine' | 'transmission' | 'brakes' | 'tires' | 'suspension' | 'nitro' | 'aero', carId: string = this.currentCarId): boolean {
        const key = `${part}Stage` as keyof TuningUpgrades;
        return this.upgradePart(carId, key);
    }
    public getVehicleUpgrades(carId: string = this.currentCarId) {
        const up = this.upgrades[carId] || { engineStage: 0, transmissionStage: 0, brakesStage: 0, tiresStage: 0, suspensionStage: 0, nitroStage: 0, aeroStage: 0 };
        return {
            engine: up.engineStage,
            transmission: up.transmissionStage,
            brakes: up.brakesStage,
            tires: up.tiresStage,
            suspension: up.suspensionStage,
            nitro: up.nitroStage,
            aero: up.aeroStage
        };
    }
    public setCustomization(carId: string, custom: Partial<PlayerCustomization>) {
        if (this.customization[carId]) {
            Object.assign(this.customization[carId], custom);
            this.saveToStorage();
        }
    }
    private saveToStorage() {
        try {
            const state = {
                cash: this.cash,
                reputation: this.reputation,
                currentCarId: this.currentCarId,
                unlockedCars: Object.values(this.vehicles).filter(v => v.unlocked).map(v => v.id),
                customization: this.customization,
                upgrades: this.upgrades
            };
            localStorage.setItem('extreme_city_drive_save', JSON.stringify(state));
        }
        catch {
        }
    }
    private loadFromStorage() {
        try {
            const raw = localStorage.getItem('extreme_city_drive_save');
            if (!raw)
                return;
            const state = JSON.parse(raw);
            if (typeof state.cash === 'number')
                this.cash = state.cash;
            if (typeof state.reputation === 'number')
                this.reputation = state.reputation;
            if (state.currentCarId && this.vehicles[state.currentCarId])
                this.currentCarId = state.currentCarId;
            if (Array.isArray(state.unlockedCars)) {
                state.unlockedCars.forEach((id: string) => {
                    if (this.vehicles[id])
                        this.vehicles[id].unlocked = true;
                });
            }
            if (state.customization) {
                Object.assign(this.customization, state.customization);
            }
            if (state.upgrades) {
                Object.assign(this.upgrades, state.upgrades);
            }
        }
        catch {
        }
    }
}
