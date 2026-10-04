export interface PlayerStats {
    totalDistanceMeters: number;
    topSpeedKmh: number;
    driftPointsTotal: number;
    racesWon: number;
    missionsCompleted: number;
    nearMissesCount: number;
}

export interface MissionRecord {
    completed: boolean;
    stars: number;
    bestTimeSeconds?: number;
    bestScore?: number;
}

export interface ProfileData {
    version: number;
    playerName: string;
    level: number;
    xp: number;
    credits: number;
    reputation: number;
    stats: PlayerStats;
    discoveredDistricts: string[];
    discoveredLandmarks: string[];
    completedMissions: Record<string, MissionRecord>;
    activeCarId: string;
    difficulty: 'easy' | 'normal' | 'hard';
}

export class ProfileSystem {
    private static readonly STORAGE_KEY = 'extreme_city_drive_profile_v4';
    public data: ProfileData;
    public onLevelUp?: (newLevel: number, rewardCredits: number) => void;
    public onDistrictDiscovered?: (districtName: string) => void;
    public onLandmarkDiscovered?: (landmarkName: string) => void;

    constructor() {
        this.data = this.getDefaultProfile();
        this.load();
    }

    public getDefaultProfile(): ProfileData {
        return {
            version: 4,
            playerName: 'Driver #1',
            level: 1,
            xp: 0,
            credits: 5000,
            reputation: 150,
            stats: {
                totalDistanceMeters: 0,
                topSpeedKmh: 0,
                driftPointsTotal: 0,
                racesWon: 0,
                missionsCompleted: 0,
                nearMissesCount: 0
            },
            discoveredDistricts: ['downtown'],
            discoveredLandmarks: ['apex_garage'],
            completedMissions: {},
            activeCarId: 'apex_gt',
            difficulty: 'normal'
        };
    }

    public getProfile(): ProfileData {
        return this.data;
    }

    public getXpForNextLevel(level: number): number {
        return Math.round(500 * Math.pow(1.35, level - 1));
    }

    public addXp(amount: number) {
        this.data.xp += Math.round(amount);
        let needed = this.getXpForNextLevel(this.data.level);
        while (this.data.xp >= needed) {
            this.data.xp -= needed;
            this.data.level += 1;
            const rewardCredits = this.data.level * 2500;
            this.data.credits += rewardCredits;
            if (this.onLevelUp) {
                this.onLevelUp(this.data.level, rewardCredits);
            }
            needed = this.getXpForNextLevel(this.data.level);
        }
        this.save();
    }

    public addCredits(amount: number) {
        this.data.credits += Math.round(amount);
        this.save();
    }

    public spendCredits(amount: number): boolean {
        if (this.data.credits < amount) return false;
        this.data.credits -= amount;
        this.save();
        return true;
    }

    public discoverDistrict(districtId: string, displayName: string = districtId) {
        if (!this.data.discoveredDistricts.includes(districtId)) {
            this.data.discoveredDistricts.push(districtId);
            this.addXp(300);
            this.addCredits(1000);
            if (this.onDistrictDiscovered) {
                this.onDistrictDiscovered(displayName);
            }
            this.save();
        }
    }

    public discoverLandmark(landmarkId: string, displayName: string = landmarkId) {
        if (!this.data.discoveredLandmarks.includes(landmarkId)) {
            this.data.discoveredLandmarks.push(landmarkId);
            this.addXp(450);
            this.addCredits(1500);
            if (this.onLandmarkDiscovered) {
                this.onLandmarkDiscovered(displayName);
            }
            this.save();
        }
    }

    public recordMissionResult(missionId: string, timeSeconds?: number, score?: number) {
        this.data.stats.missionsCompleted += 1;
        const current = this.data.completedMissions[missionId] || { completed: true, stars: 1 };
        current.completed = true;
        current.stars = Math.max(current.stars, 3);
        if (timeSeconds !== undefined) {
            current.bestTimeSeconds = current.bestTimeSeconds ? Math.min(current.bestTimeSeconds, timeSeconds) : timeSeconds;
        }
        if (score !== undefined) {
            current.bestScore = current.bestScore ? Math.max(current.bestScore, score) : score;
        }
        this.data.completedMissions[missionId] = current;
        this.save();
    }

    public recordRaceWin() {
        this.data.stats.racesWon += 1;
        this.save();
    }

    public updateTelemetry(distanceM: number, speedKmh: number) {
        this.data.stats.totalDistanceMeters += distanceM;
        if (speedKmh > this.data.stats.topSpeedKmh) {
            this.data.stats.topSpeedKmh = Math.round(speedKmh);
        }
    }

    public resetProgress() {
        this.data = this.getDefaultProfile();
        this.save();
    }

    public save() {
        try {
            localStorage.setItem(ProfileSystem.STORAGE_KEY, JSON.stringify(this.data));
        } catch {}
    }

    public load() {
        try {
            const raw = localStorage.getItem(ProfileSystem.STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.version === 4) {
                this.data = { ...this.data, ...parsed };
                if (!Array.isArray(this.data.discoveredDistricts)) this.data.discoveredDistricts = ['downtown'];
                if (!Array.isArray(this.data.discoveredLandmarks)) this.data.discoveredLandmarks = ['apex_garage'];
                if (!this.data.stats) this.data.stats = this.getDefaultProfile().stats;
            }
        } catch {
            this.data = this.getDefaultProfile();
        }
    }
}
