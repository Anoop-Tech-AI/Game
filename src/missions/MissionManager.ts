import * as THREE from 'three';
import { GarageSystem } from '../garage/GarageSystem';
export interface MissionData {
    id: string;
    title: string;
    type: 'drag' | 'circuit' | 'drift' | 'delivery' | 'sprint' | 'timetrial' | 'escape' | 'speed';
    description: string;
    rewardCash: number;
    rewardRep: number;
    timeLimitSeconds: number;
    beaconPosition: THREE.Vector3;
    checkpoints?: THREE.Vector3[];
    targetValue?: number;
}
export interface SpeedTrap {
    id: string;
    name: string;
    position: THREE.Vector3;
    radius: number;
    triggerSpeedKmh: number;
    lastTriggerTime: number;
    recordSpeedKmh: number;
}
export class MissionManager {
    public group: THREE.Group;
    public garageSystem: GarageSystem;
    public activeMission: MissionData | null = null;
    public missionTimeRemaining: number = 0;
    public currentCheckpointIndex: number = 0;
    public currentScoreAccumulator: number = 0;
    public isMissionCompleted: boolean = false;
    public isMissionFailed: boolean = false;
    public beaconMeshes: THREE.Group[] = [];
    public checkpointGroup: THREE.Group;
    public activeCheckpointMesh: THREE.Group | null = null;
    public currentDriftScore: number = 0;
    public currentDriftMultiplier: number = 1.0;
    public isCurrentlyDrifting: boolean = false;
    public driftDuration: number = 0;
    public lastNearMissTime: number = 0;
    public onStuntTriggered?: (text: string, score: number, type: 'drift' | 'near_miss' | 'speed_trap') => void;
    public onMissionStateChange?: (state: 'started' | 'checkpoint' | 'completed' | 'failed', msg: string) => void;
    public onSpeedTrapTriggered?: (speedKmh: number, trapName: string, reward: number) => void;
    public missions: MissionData[] = [
        {
            id: 'mission_airport_drag',
            title: 'AIRPORT RUNWAY TOP GUN',
            type: 'drag',
            description: 'Full-throttle sprint down Runway 09L! Exceed 220 km/h before the end threshold.',
            rewardCash: 2500,
            rewardRep: 350,
            timeLimitSeconds: 22,
            targetValue: 220,
            beaconPosition: new THREE.Vector3(140, 0, 70),
            checkpoints: [
                new THREE.Vector3(170, 0, 70),
                new THREE.Vector3(220, 0, 70),
                new THREE.Vector3(270, 0, 70),
                new THREE.Vector3(330, 0, 70)
            ]
        },
        {
            id: 'mission_downtown_circuit',
            title: 'DOWNTOWN NEON SPRINT',
            type: 'circuit',
            description: 'Precision high-speed checkpoint dash through the heart of the neon skyscraper district.',
            rewardCash: 4000,
            rewardRep: 500,
            timeLimitSeconds: 48,
            beaconPosition: new THREE.Vector3(0, 0, -25),
            checkpoints: [
                new THREE.Vector3(0, 0, 30),
                new THREE.Vector3(60, 0, 0),
                new THREE.Vector3(110, 0, -30),
                new THREE.Vector3(55, 0, -70),
                new THREE.Vector3(-15, 0, -30),
                new THREE.Vector3(0, 0, -20)
            ]
        },
        {
            id: 'mission_park_drift',
            title: 'PARKSIDE DRIFT ATTACK',
            type: 'drift',
            description: 'Send it sideways through the curved parkway! Bank 3,000 drift points before time expires.',
            rewardCash: 3200,
            rewardRep: 450,
            timeLimitSeconds: 40,
            targetValue: 3000,
            beaconPosition: new THREE.Vector3(-90, 0, 10),
            checkpoints: [
                new THREE.Vector3(-110, 0, 40),
                new THREE.Vector3(-140, 0, 10),
                new THREE.Vector3(-110, 0, -25),
                new THREE.Vector3(-80, 0, 10)
            ]
        },
        {
            id: 'mission_express_delivery',
            title: 'HARBOR TO AIRPORT RUSH',
            type: 'delivery',
            description: 'Rush priority cargo from the Industrial Docks up onto the highway to the Airport Cargo Terminal.',
            rewardCash: 3800,
            rewardRep: 480,
            timeLimitSeconds: 55,
            beaconPosition: new THREE.Vector3(-180, 0, -140),
            checkpoints: [
                new THREE.Vector3(-110, 0, -110),
                new THREE.Vector3(-55, 0, 0),
                new THREE.Vector3(60, 0, 110),
                new THREE.Vector3(180, 0, 150)
            ]
        },
        {
            id: 'mission_highway_sprint',
            title: 'INTERSTATE HIGHWAY SPRINT',
            type: 'sprint',
            description: 'High-speed blast across the elevated interstate viaduct. Maintain maximum throttle!',
            rewardCash: 4200,
            rewardRep: 520,
            timeLimitSeconds: 38,
            beaconPosition: new THREE.Vector3(20, 0, 220),
            checkpoints: [
                new THREE.Vector3(70, 0, 220),
                new THREE.Vector3(130, 0, 220),
                new THREE.Vector3(190, 0, 190),
                new THREE.Vector3(180, 0, 110)
            ]
        },
        {
            id: 'mission_time_trial',
            title: 'DOWNTOWN TIME ATTACK',
            type: 'timetrial',
            description: 'Beat the target time of 32 seconds through the inner high-rise perimeter grid.',
            rewardCash: 4500,
            rewardRep: 600,
            timeLimitSeconds: 32,
            targetValue: 32,
            beaconPosition: new THREE.Vector3(0, 0, 60),
            checkpoints: [
                new THREE.Vector3(60, 0, 60),
                new THREE.Vector3(60, 0, -60),
                new THREE.Vector3(-60, 0, -60),
                new THREE.Vector3(-60, 0, 60),
                new THREE.Vector3(0, 0, 60)
            ]
        },
        {
            id: 'mission_escape_rush',
            title: 'SYNDICATE PURSUIT EVASION',
            type: 'escape',
            description: 'Evade pursuit radius and reach the safehouse shipping containers at Harbor Docks!',
            rewardCash: 4800,
            rewardRep: 650,
            timeLimitSeconds: 50,
            beaconPosition: new THREE.Vector3(60, 0, -30),
            checkpoints: [
                new THREE.Vector3(0, 0, -30),
                new THREE.Vector3(-60, 0, -70),
                new THREE.Vector3(-120, 0, -110),
                new THREE.Vector3(-180, 0, -130)
            ]
        },
        {
            id: 'mission_harbor_drift',
            title: 'CONTAINER DOCK DRIFT ATTACK',
            type: 'drift',
            description: 'Slide through tight shipping container chicanes! Bank 4,000 drift points before time runs out.',
            rewardCash: 4200,
            rewardRep: 550,
            timeLimitSeconds: 45,
            targetValue: 4000,
            beaconPosition: new THREE.Vector3(-160, 0, -100),
            checkpoints: [
                new THREE.Vector3(-190, 0, -100),
                new THREE.Vector3(-180, 0, -130),
                new THREE.Vector3(-150, 0, -130),
                new THREE.Vector3(-160, 0, -100)
            ]
        },
        {
            id: 'mission_grand_speed',
            title: 'GRAND CORRIDOR RADAR BLITZ',
            type: 'speed',
            description: 'Trigger the speed radar on Grand Avenue at greater than 160 km/h!',
            rewardCash: 3500,
            rewardRep: 400,
            timeLimitSeconds: 30,
            targetValue: 160,
            beaconPosition: new THREE.Vector3(0, 0, -100),
            checkpoints: [
                new THREE.Vector3(0, 0, -50),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 60)
            ]
        }
    ];
    public speedTraps: SpeedTrap[] = [
        {
            id: 'trap_highway_north',
            name: 'EXPRESSWAY RADAR',
            position: new THREE.Vector3(60, 0, 220),
            radius: 14.0,
            triggerSpeedKmh: 130,
            lastTriggerTime: 0,
            recordSpeedKmh: 140
        },
        {
            id: 'trap_airport_runway',
            name: 'RUNWAY 09L SPEED TRAP',
            position: new THREE.Vector3(260, 0, 70),
            radius: 20.0,
            triggerSpeedKmh: 150,
            lastTriggerTime: 0,
            recordSpeedKmh: 160
        },
        {
            id: 'trap_downtown_spine',
            name: 'GRAND AVENUE PHOTO RADAR',
            position: new THREE.Vector3(0, 0, 60),
            radius: 12.0,
            triggerSpeedKmh: 100,
            lastTriggerTime: 0,
            recordSpeedKmh: 115
        }
    ];
    constructor(garageSystem: GarageSystem) {
        this.garageSystem = garageSystem;
        this.group = new THREE.Group();
        this.group.name = 'MissionSystem';
        this.checkpointGroup = new THREE.Group();
        this.checkpointGroup.name = 'CheckpointVisuals';
        this.group.add(this.checkpointGroup);
        this.buildWorldMissionBeacons();
    }
    private buildWorldMissionBeacons() {
        this.missions.forEach((mission, idx) => {
            const beaconGroup = new THREE.Group();
            beaconGroup.position.copy(mission.beaconPosition);
            beaconGroup.userData = { missionId: mission.id, index: idx };
            const ringGeo = new THREE.RingGeometry(3.2, 3.8, 32);
            ringGeo.rotateX(-Math.PI / 2);
            const ringMat = new THREE.MeshBasicMaterial({
                color: mission.type === 'drag' ? 0x38bdf8 : mission.type === 'circuit' ? 0xf59e0b : 0xa855f7,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.y = 0.08;
            beaconGroup.add(ring);
            const cylinderGeo = new THREE.CylinderGeometry(2.8, 3.2, 5.0, 24, 1, true);
            const cylinderMat = new THREE.MeshBasicMaterial({
                color: ringMat.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.18,
                depthWrite: false
            });
            const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
            cylinder.position.y = 2.5;
            beaconGroup.add(cylinder);
            const diamondGeo = new THREE.OctahedronGeometry(0.75, 0);
            const diamondMat = new THREE.MeshStandardMaterial({
                color: ringMat.color,
                emissive: ringMat.color,
                emissiveIntensity: 0.9,
                roughness: 0.2,
                metalness: 0.8
            });
            const diamond = new THREE.Mesh(diamondGeo, diamondMat);
            diamond.position.y = 2.8;
            diamond.name = 'floatingIcon';
            beaconGroup.add(diamond);
            this.beaconMeshes.push(beaconGroup);
            this.group.add(beaconGroup);
        });
    }
    private renderCurrentCheckpoint() {
        while (this.checkpointGroup.children.length > 0) {
            this.checkpointGroup.remove(this.checkpointGroup.children[0]);
        }
        this.activeCheckpointMesh = null;
        if (!this.activeMission || !this.activeMission.checkpoints)
            return;
        const cpPos = this.activeMission.checkpoints[this.currentCheckpointIndex];
        if (!cpPos)
            return;
        const cpGroup = new THREE.Group();
        cpGroup.position.copy(cpPos);
        const archW = 12.0;
        const archH = 6.0;
        const archTubeGeo = new THREE.TorusGeometry(archW / 2, 0.22, 12, 32, Math.PI);
        archTubeGeo.rotateZ(0);
        const archMat = new THREE.MeshBasicMaterial({
            color: 0x00f5d4,
            wireframe: false,
            transparent: true,
            opacity: 0.95
        });
        const arch = new THREE.Mesh(archTubeGeo, archMat);
        arch.position.y = 0.5;
        cpGroup.add(arch);
        const discGeo = new THREE.CircleGeometry(5.5, 32);
        discGeo.rotateX(-Math.PI / 2);
        const discMat = new THREE.MeshBasicMaterial({
            color: 0x00f5d4,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.position.y = 0.05;
        cpGroup.add(disc);
        this.activeCheckpointMesh = cpGroup;
        this.checkpointGroup.add(cpGroup);
    }
    public startMission(missionId: string): boolean {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission)
            return false;
        this.activeMission = mission;
        this.missionTimeRemaining = mission.timeLimitSeconds;
        this.currentCheckpointIndex = 0;
        this.currentScoreAccumulator = 0;
        this.isMissionCompleted = false;
        this.isMissionFailed = false;
        this.renderCurrentCheckpoint();
        this.onMissionStateChange?.('started', `Mission Started: ${mission.title}!`);
        return true;
    }
    public abortMission() {
        if (!this.activeMission)
            return;
        this.activeMission = null;
        this.renderCurrentCheckpoint();
        this.onMissionStateChange?.('failed', 'Mission Aborted.');
    }
    public update(dt: number, playerPos: THREE.Vector3, playerSpeedKmh: number, slipAngleRad: number, trafficVehicles: any[]) {
        const time = performance.now() * 0.003;
        this.beaconMeshes.forEach(b => {
            const icon = b.getObjectByName('floatingIcon');
            if (icon) {
                icon.rotation.y += dt * 1.8;
                icon.position.y = 2.8 + Math.sin(time + b.position.x) * 0.25;
            }
        });
        if (this.activeCheckpointMesh) {
            this.activeCheckpointMesh.rotation.y += dt * 0.8;
        }
        if (this.activeMission && !this.isMissionCompleted && !this.isMissionFailed) {
            this.missionTimeRemaining -= dt;
            if (this.missionTimeRemaining <= 0) {
                this.isMissionFailed = true;
                this.onMissionStateChange?.('failed', `Time Expired! ${this.activeMission.title} Failed.`);
                this.activeMission = null;
                this.renderCurrentCheckpoint();
                return;
            }
            if (this.activeMission.checkpoints && this.activeMission.checkpoints.length > 0) {
                const targetCp = this.activeMission.checkpoints[this.currentCheckpointIndex];
                if (targetCp) {
                    const dist = playerPos.distanceTo(targetCp);
                    if (dist < 8.5) {
                        this.currentCheckpointIndex++;
                        if (this.currentCheckpointIndex >= this.activeMission.checkpoints.length) {
                            this.completeActiveMission();
                        }
                        else {
                            this.renderCurrentCheckpoint();
                            this.onMissionStateChange?.('checkpoint', `Checkpoint ${this.currentCheckpointIndex} / ${this.activeMission.checkpoints.length}`);
                        }
                    }
                }
            }
            if (this.activeMission.type === 'drag' && this.activeMission.targetValue) {
                if (playerSpeedKmh >= this.activeMission.targetValue) {
                    this.completeActiveMission();
                }
            }
            if (this.activeMission.type === 'drift' && this.activeMission.targetValue) {
                if (this.currentScoreAccumulator >= this.activeMission.targetValue) {
                    this.completeActiveMission();
                }
            }
        }
        const speedMs = playerSpeedKmh / 3.6;
        const absSlip = Math.abs(slipAngleRad);
        if (speedMs > 7.0 && absSlip > 0.18) {
            this.isCurrentlyDrifting = true;
            this.driftDuration += dt;
            this.currentDriftMultiplier = Math.min(4.0, 1.0 + Math.floor(this.driftDuration / 1.2) * 0.5);
            const pointsThisFrame = Math.round(absSlip * speedMs * dt * 140 * this.currentDriftMultiplier);
            this.currentDriftScore += pointsThisFrame;
            this.currentScoreAccumulator += pointsThisFrame;
        }
        else {
            if (this.isCurrentlyDrifting) {
                if (this.currentDriftScore > 100) {
                    const rewardCash = Math.round(this.currentDriftScore * 0.25);
                    this.garageSystem.addCash(rewardCash, Math.round(rewardCash * 0.15));
                    this.onStuntTriggered?.(`DRIFT x${this.currentDriftMultiplier.toFixed(1)}!`, this.currentDriftScore, 'drift');
                }
                this.isCurrentlyDrifting = false;
                this.currentDriftScore = 0;
                this.currentDriftMultiplier = 1.0;
                this.driftDuration = 0;
            }
        }
        const now = performance.now();
        if (playerSpeedKmh > 50.0 && now - this.lastNearMissTime > 1800) {
            for (let tv of trafficVehicles) {
                if (!tv.mesh)
                    continue;
                const d = playerPos.distanceTo(tv.mesh.position);
                if (d > 1.2 && d < 4.2) {
                    this.lastNearMissTime = now;
                    this.garageSystem.addCash(150, 40);
                    this.onStuntTriggered?.('NEAR MISS!', 150, 'near_miss');
                    break;
                }
            }
        }
        for (let trap of this.speedTraps) {
            if (now - trap.lastTriggerTime > 6000) {
                const dist = playerPos.distanceTo(trap.position);
                if (dist < trap.radius && playerSpeedKmh >= trap.triggerSpeedKmh) {
                    trap.lastTriggerTime = now;
                    const isNewRecord = playerSpeedKmh > trap.recordSpeedKmh;
                    if (isNewRecord)
                        trap.recordSpeedKmh = Math.round(playerSpeedKmh);
                    const reward = Math.round(playerSpeedKmh * 2.5);
                    this.garageSystem.addCash(reward, 60);
                    this.onSpeedTrapTriggered?.(Math.round(playerSpeedKmh), trap.name, reward);
                    this.onStuntTriggered?.(`${trap.name}: ${Math.round(playerSpeedKmh)} KM/H!`, reward, 'speed_trap');
                }
            }
        }
    }
    private completeActiveMission() {
        if (!this.activeMission)
            return;
        this.isMissionCompleted = true;
        const mission = this.activeMission;
        this.garageSystem.addCash(mission.rewardCash, mission.rewardRep);
        this.onMissionStateChange?.('completed', `VICTORY! ${mission.title} COMPLETED! +$${mission.rewardCash} CASH +${mission.rewardRep} REP`);
        this.activeMission = null;
        this.renderCurrentCheckpoint();
    }
    public getNearbyMissionBeacon(playerPos: THREE.Vector3): MissionData | null {
        for (let m of this.missions) {
            if (playerPos.distanceTo(m.beaconPosition) < 4.5) {
                return m;
            }
        }
        return null;
    }
}
