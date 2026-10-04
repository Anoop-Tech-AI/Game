import * as THREE from 'three';
import { AIRacer, AIRacerConfig } from './AIRacer';
import { ProfileSystem } from '../progression/ProfileSystem';
import { SportsCar } from '../vehicle/SportsCar';
import { CarController } from '../vehicle/CarController';

export type RaceState = 'idle' | 'staging' | 'countdown' | 'racing' | 'finished';

export interface RaceTrack {
    id: string;
    name: string;
    description: string;
    laps: number;
    playerStart: { pos: THREE.Vector3; heading: number };
    aiStarts: { pos: THREE.Vector3; heading: number }[];
    waypoints: THREE.Vector3[];
    rewardCash1st: number;
    rewardXp1st: number;
}

export interface RaceResultsData {
    trackName: string;
    position: number;
    totalRacers: number;
    playerTime: number;
    bestTime?: number;
    isNewRecord: boolean;
    rewardCash: number;
    rewardXp: number;
}

export class RaceSystem {
    public group: THREE.Group;
    public state: RaceState = 'idle';
    public currentTrack: RaceTrack | null = null;
    public aiRacers: AIRacer[] = [];
    public raceTimer: number = 0;
    public countdownTimer: number = 3.5;
    public lastCountdownNum: number = 4;
    public playerCheckpointIndex: number = 0;
    public playerLap: number = 1;
    public playerFinished: boolean = false;
    public playerFinishTime: number = 0;
    public playerPositionInRace: number = 1;

    private checkpointMeshGroup: THREE.Group;
    private profile: ProfileSystem;
    private playerCar: SportsCar;
    private playerController: CarController;

    public onCountdownStep?: (number: number) => void;
    public onRaceStateChange?: (state: RaceState, msg?: string) => void;
    public onRaceFinished?: (results: RaceResultsData) => void;

    public tracks: RaceTrack[] = [
        {
            id: 'track_downtown_gp',
            name: 'DOWNTOWN GRAND PRIX',
            description: '3 Laps around the central high-rise district with tight 90° urban intersections.',
            laps: 2,
            playerStart: { pos: new THREE.Vector3(0, 0, -45), heading: 0 },
            aiStarts: [
                { pos: new THREE.Vector3(-4, 0, -42), heading: 0 },
                { pos: new THREE.Vector3(4, 0, -38), heading: 0 },
                { pos: new THREE.Vector3(0, 0, -32), heading: 0 }
            ],
            waypoints: [
                new THREE.Vector3(0, 0, 45),
                new THREE.Vector3(60, 0, 45),
                new THREE.Vector3(60, 0, -45),
                new THREE.Vector3(-55, 0, -45),
                new THREE.Vector3(-55, 0, 45),
                new THREE.Vector3(0, 0, -45)
            ],
            rewardCash1st: 6000,
            rewardXp1st: 850
        },
        {
            id: 'track_airport_showdown',
            name: 'AIRPORT RUNWAY SPRINT',
            description: 'Ultra high-speed dash down the active runway against top tier prototype hypercars.',
            laps: 1,
            playerStart: { pos: new THREE.Vector3(140, 0, 70), heading: Math.PI / 2 },
            aiStarts: [
                { pos: new THREE.Vector3(140, 0, 65), heading: Math.PI / 2 },
                { pos: new THREE.Vector3(140, 0, 75), heading: Math.PI / 2 },
                { pos: new THREE.Vector3(130, 0, 70), heading: Math.PI / 2 }
            ],
            waypoints: [
                new THREE.Vector3(180, 0, 70),
                new THREE.Vector3(240, 0, 70),
                new THREE.Vector3(300, 0, 70),
                new THREE.Vector3(340, 0, 70)
            ],
            rewardCash1st: 5000,
            rewardXp1st: 700
        },
        {
            id: 'track_highway_loop',
            name: 'EXPRESSWAY OUTER LOOP',
            description: 'Elevated highway sprint weaving through long sweepers and radar corridors.',
            laps: 1,
            playerStart: { pos: new THREE.Vector3(20, 0, 220), heading: Math.PI / 2 },
            aiStarts: [
                { pos: new THREE.Vector3(15, 0, 216), heading: Math.PI / 2 },
                { pos: new THREE.Vector3(15, 0, 224), heading: Math.PI / 2 },
                { pos: new THREE.Vector3(10, 0, 220), heading: Math.PI / 2 }
            ],
            waypoints: [
                new THREE.Vector3(60, 0, 220),
                new THREE.Vector3(120, 0, 220),
                new THREE.Vector3(180, 0, 160),
                new THREE.Vector3(180, 0, 60),
                new THREE.Vector3(120, 0, -20)
            ],
            rewardCash1st: 5500,
            rewardXp1st: 750
        }
    ];

    constructor(profile: ProfileSystem, playerCar: SportsCar, playerController: CarController) {
        this.profile = profile;
        this.playerCar = playerCar;
        this.playerController = playerController;

        this.group = new THREE.Group();
        this.group.name = 'RaceSystem';

        this.checkpointMeshGroup = new THREE.Group();
        this.group.add(this.checkpointMeshGroup);

        this.initAICompetitors();
    }

    private initAICompetitors() {
        const aiConfigs: AIRacerConfig[] = [
            { id: 'rival_1', name: 'Phoenix', colorHex: '#f97316', modelType: 'sports', difficulty: 'normal' },
            { id: 'rival_2', name: 'Ghost', colorHex: '#00f5d4', modelType: 'hyper', difficulty: 'hard' },
            { id: 'rival_3', name: 'Shadow', colorHex: '#a855f7', modelType: 'muscle', difficulty: 'easy' }
        ];

        aiConfigs.forEach(cfg => {
            const ai = new AIRacer(cfg);
            this.group.add(ai.group);
            this.aiRacers.push(ai);
        });
    }

    public startRace(trackId: string) {
        const track = this.tracks.find(t => t.id === trackId) || this.tracks[0];
        this.currentTrack = track;
        this.state = 'staging';

        this.playerController.resetPosition(track.playerStart.pos.x, track.playerStart.pos.z, track.playerStart.heading);
        this.playerCar.group.position.copy(track.playerStart.pos);
        this.playerCar.group.rotation.y = track.playerStart.heading;

        this.aiRacers.forEach((ai, idx) => {
            const start = track.aiStarts[idx % track.aiStarts.length];
            ai.applyDifficulty(this.profile.data.difficulty);
            ai.setRoute(track.waypoints);
            ai.spawnAt(start.pos, start.heading);
        });

        this.playerCheckpointIndex = 0;
        this.playerLap = 1;
        this.playerFinished = false;
        this.playerFinishTime = 0;
        this.raceTimer = 0;
        this.countdownTimer = 3.99;
        this.lastCountdownNum = 4;
        this.state = 'countdown';

        this.updateCheckpointVisuals();
        if (this.onRaceStateChange) {
            this.onRaceStateChange('countdown', 'PREPARE FOR RACE!');
        }
    }

    public update(dt: number) {
        if (this.state === 'idle') return;

        if (this.state === 'countdown') {
            this.countdownTimer -= dt;
            const currentNum = Math.ceil(this.countdownTimer);
            if (currentNum !== this.lastCountdownNum) {
                this.lastCountdownNum = currentNum;
                if (this.onCountdownStep) {
                    this.onCountdownStep(Math.max(0, currentNum));
                }
            }

            this.playerController.speed = 0;
            this.playerController.velocity.set(0, 0, 0);

            if (this.countdownTimer <= 0) {
                this.state = 'racing';
                if (this.onRaceStateChange) {
                    this.onRaceStateChange('racing', 'GO GO GO!');
                }
            }
            return;
        }

        if (this.state === 'racing') {
            this.raceTimer += dt;

            const allPositions = [this.playerCar.group.position, ...this.aiRacers.map(a => a.position)];
            this.aiRacers.forEach(ai => ai.update(dt, allPositions));

            this.checkPlayerCheckpoints();
            this.calculatePositions();

            if (this.playerFinished) {
                this.finishRace();
            }
        }
    }

    private checkPlayerCheckpoints() {
        if (!this.currentTrack || this.playerFinished) return;

        const targetWp = this.currentTrack.waypoints[this.playerCheckpointIndex];
        const dist = this.playerCar.group.position.distanceTo(targetWp);

        if (dist < 12.0) {
            this.playerCheckpointIndex++;
            if (this.playerCheckpointIndex >= this.currentTrack.waypoints.length) {
                if (this.playerLap < this.currentTrack.laps) {
                    this.playerLap++;
                    this.playerCheckpointIndex = 0;
                } else {
                    this.playerFinished = true;
                    this.playerFinishTime = this.raceTimer;
                }
            }
            this.updateCheckpointVisuals();
        }
    }

    private calculatePositions() {
        if (!this.currentTrack) return;
        const totalWps = this.currentTrack.waypoints.length;
        const playerProgress = (this.playerLap - 1) * totalWps + this.playerCheckpointIndex;

        let rank = 1;
        this.aiRacers.forEach(ai => {
            const aiProgress = (ai.lap - 1) * totalWps + ai.currentWaypointIndex;
            if (aiProgress > playerProgress) {
                rank++;
            }
        });
        this.playerPositionInRace = rank;
    }

    private updateCheckpointVisuals() {
        while (this.checkpointMeshGroup.children.length > 0) {
            this.checkpointMeshGroup.remove(this.checkpointMeshGroup.children[0]);
        }

        if (!this.currentTrack || this.playerFinished) return;
        const targetWp = this.currentTrack.waypoints[this.playerCheckpointIndex];

        const arch = new THREE.Group();
        arch.position.copy(targetWp);

        const torusGeo = new THREE.TorusGeometry(5.0, 0.25, 8, 24);
        const torusMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.85
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.position.y = 3.5;
        arch.add(torus);

        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 20, 8),
            new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.5 })
        );
        beam.position.y = 10;
        arch.add(beam);

        this.checkpointMeshGroup.add(arch);
    }

    private finishRace() {
        this.state = 'finished';
        const track = this.currentTrack!;
        const rank = this.playerPositionInRace;

        let cashMultiplier = rank === 1 ? 1.0 : rank === 2 ? 0.7 : rank === 3 ? 0.45 : 0.25;
        let xpMultiplier = rank === 1 ? 1.0 : rank === 2 ? 0.75 : rank === 3 ? 0.5 : 0.3;

        const cashEarned = Math.round(track.rewardCash1st * cashMultiplier);
        const xpEarned = Math.round(track.rewardXp1st * xpMultiplier);

        this.profile.addCredits(cashEarned);
        this.profile.addXp(xpEarned);
        if (rank === 1) {
            this.profile.recordRaceWin();
        }

        const existingRecord = this.profile.data.completedMissions[track.id]?.bestTimeSeconds;
        const isNewRecord = !existingRecord || this.playerFinishTime < existingRecord;

        this.profile.recordMissionResult(track.id, this.playerFinishTime);

        if (this.onRaceFinished) {
            this.onRaceFinished({
                trackName: track.name,
                position: rank,
                totalRacers: this.aiRacers.length + 1,
                playerTime: this.playerFinishTime,
                bestTime: existingRecord,
                isNewRecord,
                rewardCash: cashEarned,
                rewardXp: xpEarned
            });
        }
    }

    public stopRace() {
        this.state = 'idle';
        this.currentTrack = null;
        while (this.checkpointMeshGroup.children.length > 0) {
            this.checkpointMeshGroup.remove(this.checkpointMeshGroup.children[0]);
        }
        this.aiRacers.forEach(ai => ai.group.position.set(0, -100, 0));
    }
}
