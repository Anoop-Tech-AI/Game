import * as THREE from 'three';
import { SkyEnvironment, TimeOfDayPreset } from '../rendering/SkyEnvironment';
import { Materials } from '../rendering/Materials';
import { SportsCar } from '../vehicle/SportsCar';
import { CarController } from '../vehicle/CarController';
import { CityWorld } from '../world/CityWorld';
import { CameraController } from '../camera/CameraController';
import { InputManager } from '../input/InputManager';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';
import { AudioManager } from './AudioManager';
import { GarageSystem } from '../garage/GarageSystem';
import { MissionManager } from '../missions/MissionManager';
import { GarageUI } from '../ui/GarageUI';
import { WeatherSystem } from '../rendering/WeatherSystem';
import { SettingsUI } from '../ui/SettingsUI';
import { ProfileSystem } from '../progression/ProfileSystem';
import { RaceSystem } from '../missions/RaceSystem';
import { NavArrow } from '../ui/NavArrow';
import { WorldMapUI } from '../ui/WorldMapUI';
import { MainMenuUI } from '../ui/MainMenuUI';
import { RaceResultsUI } from '../ui/RaceResultsUI';

export class Engine {
    public canvas: HTMLCanvasElement;
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public skyEnv: SkyEnvironment;
    public weatherSystem: WeatherSystem;
    public cityWorld: CityWorld;
    public car: SportsCar;
    public carController: CarController;
    public cameraController: CameraController;
    public inputManager: InputManager;
    public hud: HUD;
    public minimap: Minimap;
    public audio: AudioManager;
    public garageSystem: GarageSystem;
    public missionManager: MissionManager;
    public garageUI: GarageUI;
    public settingsUI: SettingsUI;

    public profile: ProfileSystem;
    public raceSystem: RaceSystem;
    public navArrow: NavArrow;
    public worldMapUI: WorldMapUI;
    public mainMenuUI: MainMenuUI;
    public raceResultsUI: RaceResultsUI;
    public get profileSystem(): ProfileSystem { return this.profile; }

    private clock: THREE.Clock;
    private isRunning: boolean = false;
    private lastPlayerSpeed: number = 0;
    private cameraShakeAmount: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.2, 600);

        Materials.init();
        this.skyEnv = new SkyEnvironment(this.scene, this.renderer);
        this.weatherSystem = new WeatherSystem(this.scene, this.skyEnv);
        this.cityWorld = new CityWorld(this.skyEnv);
        this.scene.add(this.cityWorld.group);

        this.car = new SportsCar();
        this.scene.add(this.car.group);
        this.carController = new CarController(this.car);
        this.carController.colliders = this.cityWorld.colliders;

        this.cameraController = new CameraController(this.camera, this.car);
        this.inputManager = new InputManager();
        this.hud = new HUD();
        this.minimap = new Minimap(this.cityWorld.roadGraph, this.cityWorld.trafficManager, this.cityWorld.buildingSystem);
        this.audio = new AudioManager();

        this.profile = new ProfileSystem();
        this.garageSystem = new GarageSystem();

        this.missionManager = new MissionManager(this.garageSystem);
        this.scene.add(this.missionManager.group);

        this.raceSystem = new RaceSystem(this.profile, this.car, this.carController);
        this.scene.add(this.raceSystem.group);

        this.navArrow = new NavArrow();
        this.scene.add(this.navArrow.group);

        this.worldMapUI = new WorldMapUI(this.cityWorld.roadGraph, this.profile, this.carController);
        this.garageUI = new GarageUI(this.garageSystem, this.car, this.carController, this.audio);
        this.settingsUI = new SettingsUI(this.renderer, this.skyEnv, this.weatherSystem, this.audio);
        this.raceResultsUI = new RaceResultsUI();
        this.mainMenuUI = new MainMenuUI(this.profile, this.garageSystem);

        this.clock = new THREE.Clock();

        this.setupInteractivity();
        this.setupMissionEvents();
        this.setupRaceEvents();
        this.setupProgressionEvents();
        this.setupResizeListener();

        this.mainMenuUI.simulateLoading(() => {
            this.audio.init();
            this.audio.startMusic('menu');
        });
    }

    private setupInteractivity() {
        this.inputManager.onCameraToggle = () => {
            const modeLabel = this.cameraController.cycleCameraMode();
            this.hud.setCameraLabel(modeLabel);
            this.hud.showToast(`Camera: ${modeLabel}`);
        };
        this.inputManager.onHeadlightsToggle = () => {
            this.car.toggleHeadlights();
            this.hud.showToast(`Headlights: ${this.car.areHeadlightsOn ? 'ON' : 'OFF'}`);
        };
        this.inputManager.onTimeOfDayCycle = () => {
            const presets: TimeOfDayPreset[] = ['afternoon', 'golden_hour', 'night'];
            const nextIdx = (presets.indexOf(this.skyEnv.currentPreset) + 1) % presets.length;
            const nextPreset = presets[nextIdx];
            this.skyEnv.setTimeOfDay(nextPreset);
            const labels: Record<TimeOfDayPreset, string> = {
                'afternoon': 'Sunlit Afternoon',
                'golden_hour': 'Golden Hour Sunset',
                'night': 'Urban Night'
            };
            this.hud.setTimeOfDayLabel(labels[nextPreset]);
            this.hud.showToast(`Lighting: ${labels[nextPreset]}`);
            if (nextPreset === 'night' && !this.car.areHeadlightsOn) {
                this.car.toggleHeadlights(true);
            }
        };
        this.inputManager.onResetVehicle = () => {
            this.carController.resetPosition(0, -25, 0);
            this.hud.showToast('Vehicle Position Reset');
        };
        this.inputManager.onWeatherCycle = () => {
            const w = this.weatherSystem.cycleWeather();
            this.hud.setWeatherLabel(w === 'rain' ? '🌧️ RAIN' : w === 'fog' ? '🌫️ FOG' : w === 'cloudy' ? '☁️ OVERCAST' : '☀️ CLEAR');
            this.hud.showToast(`Weather: ${w.toUpperCase()}`);
            this.audio.setRainSound(w === 'rain');
        };
        this.inputManager.onHazardToggle = () => {
            this.car.toggleHazards();
            this.hud.showToast(`Hazard Lights: ${this.car.hazardActive ? 'ACTIVE' : 'OFF'}`);
        };
        this.inputManager.onGarageToggle = () => {
            this.garageUI.toggle();
        };
        this.inputManager.onMapToggle = () => {
            this.worldMapUI.toggle();
        };
        this.inputManager.onSettingsToggle = () => {
            if (this.mainMenuUI.isOpen) {
                this.mainMenuUI.hide();
            } else {
                this.settingsUI.toggle();
            }
        };

        document.getElementById('btn-quick-settings')?.addEventListener('click', () => {
            this.settingsUI.toggle();
        });

        this.inputManager.onInteract = () => {
            const beacon = this.missionManager.getNearbyMissionBeacon(this.carController.position);
            if (beacon) {
                if (!this.missionManager.activeMission) {
                    this.missionManager.startMission(beacon.id);
                    this.audio.playCheckpointChime();
                }
            } else {
                const distToGarage = this.carController.position.distanceTo(new THREE.Vector3(55, 0, 0));
                if (distToGarage < 14.0) {
                    this.garageUI.toggle(true);
                }
            }
        };

        this.mainMenuUI.onPlay = () => {
            this.audio.startMusic('freedrive');
            this.hud.showToast('WELCOME TO EXTREME CITY DRIVE');
        };
        this.mainMenuUI.onGarage = () => {
            this.garageUI.toggle(true);
        };
        this.mainMenuUI.onMap = () => {
            this.worldMapUI.toggle(true);
        };
        this.mainMenuUI.onMissions = () => {
            this.raceSystem.startRace('track_downtown_gp');
            this.audio.startMusic('race');
        };
        this.mainMenuUI.onSettings = () => {
            this.settingsUI.toggle(true);
        };

        this.worldMapUI.onFastTravel = (pos, heading) => {
            this.carController.resetPosition(pos.x, pos.z, heading);
            this.hud.showToast('FAST TRAVEL COMPLETE');
            this.audio.playCheckpointChime();
        };

        const initAudio = () => {
            this.audio.init();
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('keydown', initAudio);
        window.addEventListener('click', initAudio);
    }

    private setupMissionEvents() {
        this.missionManager.onStuntTriggered = (text, score, type) => {
            this.hud.showStunt(text, score, type);
            if (type === 'drift') {
                this.audio.playCashChime();
                this.profile.data.stats.driftPointsTotal += score;
            } else if (type === 'near_miss') {
                this.profile.data.stats.nearMissesCount++;
            }
        };

        this.missionManager.onSpeedTrapTriggered = (speedKmh, trapName, reward) => {
            this.hud.flashSpeedTrap();
            this.audio.playSpeedTrapClick();
            this.audio.playCashChime();
            this.profile.addCredits(reward);
            this.profile.addXp(Math.round(reward * 0.15));
            this.hud.showToast(`📸 ${trapName}: ${speedKmh} KM/H — EARNED $${reward}!`);
        };

        this.missionManager.onMissionStateChange = (state, msg) => {
            if (state === 'checkpoint') {
                this.audio.playCheckpointChime();
            } else if (state === 'completed') {
                this.audio.playVictoryFanfare();
                if (this.missionManager.activeMission) {
                    this.profile.addCredits(this.missionManager.activeMission.rewardCash);
                    this.profile.addXp(this.missionManager.activeMission.rewardRep);
                    this.profile.recordMissionResult(this.missionManager.activeMission.id);
                }
            }
            this.hud.showToast(msg);
        };
    }

    private setupRaceEvents() {
        this.raceSystem.onCountdownStep = (num) => {
            this.audio.playCountdownBeep(num === 0);
            this.hud.showStunt(num === 0 ? 'GO!' : num.toString(), 0, 'speed_trap');
        };

        this.raceSystem.onRaceStateChange = (state, msg) => {
            if (msg) this.hud.showToast(msg);
        };

        this.raceSystem.onRaceFinished = (results) => {
            this.audio.playVictoryFanfare();
            this.raceResultsUI.show(results);
            this.audio.startMusic('menu');
        };

        this.raceResultsUI.onRetry = () => {
            if (this.raceSystem.currentTrack) {
                this.raceSystem.startRace(this.raceSystem.currentTrack.id);
                this.audio.startMusic('race');
            }
        };

        this.raceResultsUI.onContinue = () => {
            this.raceSystem.stopRace();
            this.audio.startMusic('freedrive');
        };

        this.raceResultsUI.onGarage = () => {
            this.raceSystem.stopRace();
            this.garageUI.toggle(true);
        };
    }

    private setupProgressionEvents() {
        this.profile.onLevelUp = (lvl, reward) => {
            this.audio.playVictoryFanfare();
            this.hud.showStunt(`LEVEL UP! LEVEL ${lvl}`, reward, 'drift');
            this.hud.showToast(`🏆 LEVEL UP: REACHED LEVEL ${lvl}! BONUS +$${reward.toLocaleString()}`);
        };

        this.profile.onDistrictDiscovered = (name) => {
            this.audio.playCheckpointChime();
            this.hud.showToast(`📍 DISCOVERED: ${name.toUpperCase()} (+300 XP, +$1,000)`);
        };

        this.profile.onLandmarkDiscovered = (name) => {
            this.audio.playCheckpointChime();
            this.hud.showToast(`⭐ LANDMARK FOUND: ${name.toUpperCase()} (+450 XP, +$1,500)`);
        };
    }

    private setupResizeListener() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.start();
        this.loop();
    }

    private loop = () => {
        if (!this.isRunning) return;
        requestAnimationFrame(this.loop);
        const dt = this.clock.getDelta();
        const inputs = this.inputManager.getInputs();
        const playerPos = this.car.group.position;
        const playerHeading = this.car.group.rotation.y;
        const speedKmh = this.carController.getSpeedKmh();

        const isAnyModalOpen = this.mainMenuUI.isOpen || this.garageUI.isOpen || this.settingsUI.isOpen || this.worldMapUI.isOpen || this.raceResultsUI.isOpen;
        if (isAnyModalOpen) {
            inputs.forward = false;
            inputs.backward = false;
            inputs.left = false;
            inputs.right = false;
            inputs.boost = false;
            inputs.handbrake = true;
        }

        this.carController.update(dt, inputs);
        this.cityWorld.update(dt, playerPos);
        this.raceSystem.update(dt);

        const currentSpeedMps = this.carController.speed;
        const speedDiff = this.lastPlayerSpeed - currentSpeedMps;
        if (speedDiff > 14.0 && Math.abs(this.lastPlayerSpeed) > 12.0) {
            this.cameraShakeAmount = 0.45;
            this.audio.playCollisionSound(Math.min(2.0, speedDiff / 10.0));
        }
        this.lastPlayerSpeed = currentSpeedMps;

        if (this.cameraShakeAmount > 0) {
            this.cameraShakeAmount = Math.max(0, this.cameraShakeAmount - dt * 2.5);
            this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeAmount;
            this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeAmount;
        }

        if (this.mainMenuUI.isOpen) {
            const time = performance.now() * 0.00025;
            this.camera.position.set(Math.sin(time) * 45, 18, Math.cos(time) * 45);
            this.camera.lookAt(playerPos.x, 2.5, playerPos.z);
        } else {
            const targetFov = this.carController.isBoosting ? 74 : (58 + Math.min(10, speedKmh / 25));
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 6);
            this.camera.updateProjectionMatrix();
            this.cameraController.update(dt, this.carController.speed);
        }

        this.skyEnv.update(playerPos);
        this.weatherSystem.update(dt, playerPos);
        this.audio.setRainSound(this.weatherSystem.currentWeather === 'rain');

        this.missionManager.update(dt, playerPos, speedKmh, this.carController.slipAngle, this.cityWorld.trafficManager.vehicles);

        this.navArrow.update(dt, playerPos);
        if (this.raceSystem.state === 'racing' || this.raceSystem.state === 'countdown') {
            const currentWp = this.raceSystem.currentTrack?.waypoints[this.raceSystem.playerCheckpointIndex] || null;
            this.navArrow.setTarget(currentWp, 0x00f5ff);
        } else if (this.missionManager.activeMission) {
            const m = this.missionManager.activeMission;
            const currentCp = m.checkpoints ? m.checkpoints[this.missionManager.currentCheckpointIndex] : m.beaconPosition;
            this.navArrow.setTarget(currentCp, 0xf59e0b);
        } else {
            const beacon = this.missionManager.getNearbyMissionBeacon(playerPos);
            this.navArrow.setTarget(beacon ? beacon.beaconPosition : new THREE.Vector3(55, 0, 0), beacon ? 0xf59e0b : 0xa855f7);
        }

        const nearbyBeacon = this.missionManager.getNearbyMissionBeacon(playerPos);
        const distToGarage = playerPos.distanceTo(new THREE.Vector3(55, 0, 0));
        if (nearbyBeacon && !this.missionManager.activeMission && this.raceSystem.state === 'idle') {
            this.hud.showInteractionPrompt(`<span class="key-badge">E</span> START MISSION: ${nearbyBeacon.title}`);
        } else if (distToGarage < 12.0 && this.raceSystem.state === 'idle') {
            this.hud.showInteractionPrompt(`<span class="key-badge">E</span> / <span class="key-badge">G</span> ENTER APEX GARAGE`);
        } else {
            this.hud.showInteractionPrompt(null);
        }

        this.checkDistrictDiscovery(playerPos);
        this.profile.updateTelemetry(Math.abs(this.carController.speed * dt), speedKmh);

        this.minimap.update(playerPos, playerHeading);
        this.hud.update(speedKmh, this.carController.currentGear, this.carController.rpm, this.carController.nitroAmount, this.carController.isBoosting);
        this.hud.updateWallet(this.profile.data.credits, this.profile.data.reputation);

        if (this.raceSystem.state === 'racing' || this.raceSystem.state === 'countdown') {
            const track = this.raceSystem.currentTrack;
            const statusTxt = `POS: ${this.raceSystem.playerPositionInRace} / 4  •  LAP ${this.raceSystem.playerLap} / ${track?.laps || 1}`;
            this.hud.updateMissionStatus(true, track?.name || 'STREET RACE', statusTxt, Math.max(0, this.raceSystem.raceTimer));
        } else if (this.missionManager.activeMission) {
            const m = this.missionManager.activeMission;
            const statusText = m.checkpoints
                ? `Checkpoint ${this.missionManager.currentCheckpointIndex + 1} / ${m.checkpoints.length}`
                : (m.type === 'drag' ? `Target Speed: ${m.targetValue} KM/H` : `Target Drift: ${m.targetValue} PTS`);
            this.hud.updateMissionStatus(true, m.title, statusText, this.missionManager.missionTimeRemaining);
        } else {
            this.hud.updateMissionStatus(false);
        }

        this.audio.update(this.carController.rpm, this.car.isBraking, this.carController.speed, dt);
        this.audio.setNitroBoostSound(this.carController.isBoosting);
        this.renderer.render(this.scene, this.camera);
    };

    private checkDistrictDiscovery(pos: THREE.Vector3) {
        if (pos.x > 90 && pos.z > 20) {
            this.profile.discoverDistrict('airport', 'Metro Airport International');
            this.profile.discoverLandmark('airport_runway', 'Runway 09L');
        } else if (pos.x < -70 && pos.x > -170 && pos.z > -50 && pos.z < 50) {
            this.profile.discoverDistrict('park', 'Central Botanical Park');
            this.profile.discoverLandmark('botanical_lake', 'Botanical Lake Pavilion');
        } else if (pos.x < -130 && pos.z < -80) {
            this.profile.discoverDistrict('harbor', 'Industrial Harbor Docks');
            this.profile.discoverLandmark('harbor_crane', 'Container Gantry Crane');
        } else if (pos.z > 190) {
            this.profile.discoverDistrict('highway', 'Interstate Elevated Expressway');
        } else if (pos.x > 30 && pos.z < 0 && pos.z > -80) {
            this.profile.discoverDistrict('commercial', 'Commercial Promenade');
        } else {
            this.profile.discoverDistrict('downtown', 'Downtown Skyscraper Core');
        }
    }
}
