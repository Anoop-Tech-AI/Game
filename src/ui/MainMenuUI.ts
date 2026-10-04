import { ProfileSystem } from '../progression/ProfileSystem';
import { GarageSystem } from '../garage/GarageSystem';

export class MainMenuUI {
    private container: HTMLElement;
    private loadingElem: HTMLElement;
    public isOpen: boolean = true;

    private profile: ProfileSystem;
    private garage: GarageSystem;

    public onPlay?: () => void;
    public onGarage?: () => void;
    public onMap?: () => void;
    public onMissions?: () => void;
    public onSettings?: () => void;
    public onProfile?: () => void;

    constructor(profile: ProfileSystem, garage: GarageSystem) {
        this.profile = profile;
        this.garage = garage;

        this.container = document.createElement('div');
        this.container.id = 'main-menu-overlay';
        this.container.className = 'main-menu-overlay';

        this.loadingElem = document.createElement('div');
        this.loadingElem.id = 'loading-overlay';
        this.loadingElem.className = 'loading-overlay';
        this.loadingElem.innerHTML = `
            <div class="loading-box">
                <h1 class="load-logo">EXTREME <span>CITY DRIVE</span></h1>
                <p class="load-sub">OPEN-WORLD ARCADE MOTORSPORT</p>
                <div class="load-bar-track">
                    <div class="load-bar-fill" id="load-bar-fill"></div>
                </div>
                <div class="load-status" id="load-status-txt">INITIALIZING VEHICLE DYNAMICS...</div>
            </div>
        `;
        document.body.appendChild(this.loadingElem);

        this.renderMenu();
        document.body.appendChild(this.container);
        this.bindEvents();
    }

    public simulateLoading(onComplete: () => void) {
        const fill = document.getElementById('load-bar-fill');
        const status = document.getElementById('load-status-txt');
        const steps = [
            { pct: 25, txt: 'GENERATING PBR PROCEDURAL TEXTURES & ASPHALT...' },
            { pct: 55, txt: 'STREAMING DOWNTOWN, AIRPORT & HIGHWAY DISTRICTS...' },
            { pct: 85, txt: 'SYNCHRONIZING AI TRAFFIC & PEDESTRIAN PATHWAYS...' },
            { pct: 100, txt: 'TUNING VEHICLE PHYSICS & NITRO INJECTION... READY!' }
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                if (fill) fill.style.width = `${steps[i].pct}%`;
                if (status) status.textContent = steps[i].txt;
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    this.loadingElem.classList.add('fade-out');
                    setTimeout(() => {
                        this.loadingElem.remove();
                        onComplete();
                    }, 400);
                }, 300);
            }
        }, 350);
    }

    public renderMenu() {
        const currentCar = this.garage.getCurrentSpec();
        const p = this.profile.data;

        this.container.innerHTML = `
            <div class="menu-content">
                <div class="menu-header">
                    <div class="menu-logo-box">
                        <span class="m-tag">NEXT-GEN ARCADE</span>
                        <h1 class="m-title">EXTREME <span>CITY DRIVE</span></h1>
                        <p class="m-sub">PHASE 4 OPEN-WORLD MOTORSPORT</p>
                    </div>
                </div>

                <div class="menu-nav-list">
                    <button class="btn-menu-action primary" id="btn-menu-play">
                        <span class="btn-icon">▶</span>
                        <div class="btn-txt-box">
                            <strong>ENTER CITY</strong>
                            <small>Free drive, drift zones & street exploration</small>
                        </div>
                    </button>

                    <button class="btn-menu-action" id="btn-menu-race">
                        <span class="btn-icon">🏁</span>
                        <div class="btn-txt-box">
                            <strong>RACE EVENTS</strong>
                            <small>Street circuits against AI opponents</small>
                        </div>
                    </button>

                    <button class="btn-menu-action" id="btn-menu-garage">
                        <span class="btn-icon">🏎️</span>
                        <div class="btn-txt-box">
                            <strong>APEX GARAGE</strong>
                            <small>Fleet showroom, paint & parts tuning</small>
                        </div>
                    </button>

                    <button class="btn-menu-action" id="btn-menu-map">
                        <span class="btn-icon">🗺️</span>
                        <div class="btn-txt-box">
                            <strong>WORLD MAP</strong>
                            <small>Explore districts & fast travel</small>
                        </div>
                    </button>

                    <button class="btn-menu-action" id="btn-menu-settings">
                        <span class="btn-icon">⚙️</span>
                        <div class="btn-txt-box">
                            <strong>SETTINGS & CONTROLS</strong>
                            <small>Graphics presets, weather, audio</small>
                        </div>
                    </button>
                </div>

                <div class="menu-footer-profile">
                    <div class="p-card-left">
                        <span class="p-lvl-badge">LVL ${p.level}</span>
                        <div class="p-name-box">
                            <strong>${p.playerName}</strong>
                            <small>${currentCar.name} (${currentCar.subtitle})</small>
                        </div>
                    </div>
                    <div class="p-card-right">
                        <div class="chip-val cash">$${p.credits.toLocaleString()}</div>
                        <div class="chip-val rep">${p.reputation} REP</div>
                    </div>
                </div>
            </div>
        `;
    }

    private bindEvents() {
        this.container.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('button');
            if (!target) return;

            if (target.id === 'btn-menu-play') {
                this.hide();
                if (this.onPlay) this.onPlay();
            } else if (target.id === 'btn-menu-race') {
                this.hide();
                if (this.onMissions) this.onMissions();
            } else if (target.id === 'btn-menu-garage') {
                this.hide();
                if (this.onGarage) this.onGarage();
            } else if (target.id === 'btn-menu-map') {
                this.hide();
                if (this.onMap) this.onMap();
            } else if (target.id === 'btn-menu-settings') {
                this.hide();
                if (this.onSettings) this.onSettings();
            }
        });
    }

    public show() {
        this.renderMenu();
        this.container.classList.remove('hidden');
        this.isOpen = true;
    }

    public hide() {
        this.container.classList.add('hidden');
        this.isOpen = false;
    }

    public toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    }
}
