import { GarageSystem, VehicleSpec, PlayerCustomization } from '../garage/GarageSystem';
import { SportsCar } from '../vehicle/SportsCar';
import { CarController } from '../vehicle/CarController';
import { AudioManager } from '../core/AudioManager';
export class GarageUI {
    private container: HTMLElement;
    private garageSystem: GarageSystem;
    private car: SportsCar;
    private carController: CarController;
    private audio: AudioManager;
    public isOpen: boolean = false;
    constructor(garageSystem: GarageSystem, car: SportsCar, carController: CarController, audio: AudioManager) {
        this.garageSystem = garageSystem;
        this.car = car;
        this.carController = carController;
        this.audio = audio;
        this.container = document.createElement('div');
        this.container.id = 'garage-modal';
        this.container.className = 'garage-modal hidden';
        document.body.appendChild(this.container);
        this.applyInitialCustomization();
    }
    public applyInitialCustomization() {
        const currentCar = this.garageSystem.getCurrentSpec();
        const custom = this.garageSystem.getCurrentCustomization();
        const tunedStats = this.garageSystem.getTunedStats();
        this.car.setModel(currentCar.id as any);
        this.car.setPaint(custom.paintColor, custom.finish);
        this.car.setRimColor(custom.rimColor);
        this.car.setUnderglow(custom.underglowColor);
        this.carController.applyTuning(tunedStats);
    }
    public toggle(open?: boolean) {
        this.isOpen = open !== undefined ? open : !this.isOpen;
        if (this.isOpen) {
            this.render();
            this.container.classList.remove('hidden');
            this.audio.playCashChime();
        }
        else {
            this.container.classList.add('hidden');
        }
    }
    public render() {
        const currentCar = this.garageSystem.getCurrentSpec();
        const custom = this.garageSystem.getCurrentCustomization();
        const up = this.garageSystem.getCurrentUpgrades();
        const tunedStats = this.garageSystem.getTunedStats();
        const paintColors = [
            { name: 'Apex Violet', hex: '#c026d3' },
            { name: 'Rosso Corsa', hex: '#dc2626' },
            { name: 'Midnight Purple', hex: '#7c3aed' },
            { name: 'Electric Cyan', hex: '#00f5ff' },
            { name: 'Nardo Grey', hex: '#64748b' },
            { name: 'Acid Green', hex: '#84cc16' },
            { name: 'Stealth Black', hex: '#0f172a' },
            { name: 'Sunburst Gold', hex: '#f59e0b' },
            { name: 'Pearl White', hex: '#f8fafc' }
        ];
        const underglowOptions = [
            { name: 'OFF', hex: 'off' },
            { name: 'Cyan', hex: '#00f5ff' },
            { name: 'Purple', hex: '#c084fc' },
            { name: 'Crimson', hex: '#ef4444' },
            { name: 'Gold', hex: '#fbbf24' },
            { name: 'Lime', hex: '#22c55e' }
        ];
        const rimColors = [
            { name: 'Chrome', hex: '#f1f5f9' },
            { name: 'Gunmetal', hex: '#334155' },
            { name: 'Bronze', hex: '#78350f' },
            { name: 'Gold', hex: '#d97706' },
            { name: 'Stealth', hex: '#0f172a' }
        ];
        this.container.innerHTML = `
      <div class="garage-content">
        <div class="garage-header">
          <div class="garage-title-box">
            <h2>⚡ APEX PERFORMANCE & CUSTOMS</h2>
            <p>VEHICLE TUNING • PAINT SHOP • PARTS UPGRADES</p>
          </div>
          <div class="garage-wallet">
            <div class="wallet-badge">
              <span class="w-label">BANK</span>
              <span class="w-val">$${this.garageSystem.cash.toLocaleString()}</span>
            </div>
            <div class="wallet-badge rep">
              <span class="w-label">REP</span>
              <span class="w-val">${this.garageSystem.reputation}</span>
            </div>
            <button class="btn-close-garage" id="btn-close-garage">EXIT TO CITY [ESC/G]</button>
          </div>
        </div>

        <div class="garage-body">
          <!-- Left Column: Vehicle Select & Specs -->
          <div class="garage-col vehicles-col">
            <h3>FLEET SHOWROOM</h3>
            <div class="vehicle-list">
              ${Object.values(this.garageSystem.vehicles).map(veh => `
                <div class="vehicle-card ${veh.id === currentCar.id ? 'active' : ''} ${!veh.unlocked ? 'locked' : ''}" data-car="${veh.id}">
                  <div class="v-card-top">
                    <h4>${veh.name}</h4>
                    <span class="v-badge">${veh.unlocked ? (veh.id === currentCar.id ? 'ACTIVE' : 'OWNED') : `$${veh.price.toLocaleString()}`}</span>
                  </div>
                  <p class="v-sub">${veh.subtitle}</p>
                </div>
              `).join('')}
            </div>

            <!-- Current Car Stats -->
            <div class="stats-panel">
              <h4>PERFORMANCE METRICS</h4>
              <div class="stat-row">
                <span>TOP SPEED</span>
                <strong>${tunedStats.topSpeedKmh} KM/H</strong>
              </div>
              <div class="stat-bar-outer"><div class="stat-bar-inner" style="width: ${Math.min(100, (tunedStats.topSpeedKmh / 340) * 100)}%"></div></div>

              <div class="stat-row">
                <span>TORQUE & POWER</span>
                <strong>${Math.round(tunedStats.torque * 22)} HP</strong>
              </div>
              <div class="stat-bar-outer"><div class="stat-bar-inner torque" style="width: ${Math.min(100, (tunedStats.torque / 35) * 100)}%"></div></div>

              <div class="stat-row">
                <span>STEERING AGILITY</span>
                <strong>${tunedStats.handling.toFixed(1)} / 6.0</strong>
              </div>
              <div class="stat-bar-outer"><div class="stat-bar-inner handling" style="width: ${Math.min(100, (tunedStats.handling / 6.0) * 100)}%"></div></div>
            </div>

            <div class="car-action-area">
              ${currentCar.unlocked
            ? `<button class="btn-primary" disabled>CURRENTLY DRIVING</button>`
            : `<button class="btn-buy-car btn-primary" id="btn-buy-car">PURCHASE FOR $${currentCar.price.toLocaleString()}</button>`}
            </div>
          </div>

          <!-- Middle Column: Performance Upgrades -->
          <div class="garage-col upgrades-col">
            <h3>TUNING SHOP</h3>
            <div class="upgrade-list">
              ${['engineStage', 'transmissionStage', 'brakesStage', 'tiresStage', 'suspensionStage', 'nitroStage', 'aeroStage'].map(partKey => {
            const pKey = partKey as keyof typeof up;
            const stage = up[pKey] || 0;
            const isMax = stage >= 5;
            const cost = isMax ? 0 : this.garageSystem.upgradeCosts[stage];
            const titles: Record<string, string> = {
                engineStage: 'Twin-Turbo ECU & Intake',
                transmissionStage: 'Sport Dual-Clutch Gearbox',
                brakesStage: 'Carbon-Ceramic Rotors',
                tiresStage: 'Competition Semi-Slicks',
                suspensionStage: 'Track Coilovers & Sway Bars',
                nitroStage: 'High-Pressure Nitrous Oxide',
                aeroStage: 'Carbon Diffuser & Active Wing'
            };
            return `
                  <div class="upgrade-card">
                    <div class="u-info">
                      <strong>${titles[partKey]}</strong>
                      <div class="stage-pips">
                        <span class="pip ${stage >= 1 ? 'filled' : ''}"></span>
                        <span class="pip ${stage >= 2 ? 'filled' : ''}"></span>
                        <span class="pip ${stage >= 3 ? 'filled' : ''}"></span>
                        <span class="pip ${stage >= 4 ? 'filled' : ''}"></span>
                        <span class="pip ${stage >= 5 ? 'filled' : ''}"></span>
                        <span class="stage-txt">STAGE ${stage} / 5</span>
                      </div>
                    </div>
                    <button class="btn-upgrade ${isMax ? 'maxed' : ''}" data-part="${partKey}" ${isMax || this.garageSystem.cash < cost ? 'disabled' : ''}>
                      ${isMax ? 'MAX STAGE' : `UPGRADE $${cost.toLocaleString()}`}
                    </button>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <!-- Right Column: Visual Paint & Neon Customization -->
          <div class="garage-col visual-col">
            <h3>COSMETICS & UNDERGLOW</h3>
            <div class="custom-section">
              <label>BODY PAINT</label>
              <div class="swatches-grid">
                ${paintColors.map(c => `
                  <div class="swatch ${custom.paintColor === c.hex ? 'active' : ''}" style="background: ${c.hex}" data-color="${c.hex}" title="${c.name}"></div>
                `).join('')}
              </div>
            </div>

            <div class="custom-section">
              <label>FINISH</label>
              <div class="finish-buttons">
                ${['gloss', 'metallic', 'matte'].map(f => `
                  <button class="btn-finish ${custom.finish === f ? 'active' : ''}" data-finish="${f}">${f.toUpperCase()}</button>
                `).join('')}
              </div>
            </div>

            <div class="custom-section">
              <label>NEON UNDERGLOW</label>
              <div class="swatches-grid">
                ${underglowOptions.map(ug => `
                  <div class="swatch underglow ${custom.underglowColor === (ug.hex === 'off' ? null : ug.hex) ? 'active' : ''}" style="${ug.hex === 'off' ? 'background: #334155; border: 1px dashed #64748b;' : `background: ${ug.hex}; box-shadow: 0 0 10px ${ug.hex};`}" data-underglow="${ug.hex}" title="${ug.name}"></div>
                `).join('')}
              </div>
            </div>

            <div class="custom-section">
              <label>WHEEL RIMS</label>
              <div class="swatches-grid">
                ${rimColors.map(rc => `
                  <div class="swatch rim ${custom.rimColor === rc.hex ? 'active' : ''}" style="background: ${rc.hex}" data-rim="${rc.hex}" title="${rc.name}"></div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
        this.bindEvents();
    }
    private bindEvents() {
        document.getElementById('btn-close-garage')?.addEventListener('click', () => {
            this.toggle(false);
        });
        this.container.querySelectorAll('.vehicle-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const carId = (card as HTMLElement).dataset.car;
                if (!carId)
                    return;
                const veh = this.garageSystem.vehicles[carId];
                if (veh.unlocked) {
                    this.garageSystem.selectVehicle(carId);
                    this.applyInitialCustomization();
                    this.render();
                    this.audio.playCashChime();
                }
                else {
                    this.garageSystem.currentCarId = carId;
                    this.render();
                }
            });
        });
        document.getElementById('btn-buy-car')?.addEventListener('click', () => {
            const carId = this.garageSystem.currentCarId;
            if (this.garageSystem.buyVehicle(carId)) {
                this.applyInitialCustomization();
                this.render();
                this.audio.playVictoryFanfare();
            }
        });
        this.container.querySelectorAll('.btn-upgrade').forEach(btn => {
            btn.addEventListener('click', () => {
                const part = (btn as HTMLElement).dataset.part as any;
                if (part && this.garageSystem.upgradePart(this.garageSystem.currentCarId, part)) {
                    this.applyInitialCustomization();
                    this.render();
                    this.audio.playCashChime();
                }
            });
        });
        this.container.querySelectorAll('.swatch[data-color]').forEach(sw => {
            sw.addEventListener('click', () => {
                const color = (sw as HTMLElement).dataset.color;
                if (!color)
                    return;
                this.garageSystem.setCustomization(this.garageSystem.currentCarId, { paintColor: color });
                this.applyInitialCustomization();
                this.render();
            });
        });
        this.container.querySelectorAll('.btn-finish').forEach(btn => {
            btn.addEventListener('click', () => {
                const finish = (btn as HTMLElement).dataset.finish as any;
                if (!finish)
                    return;
                this.garageSystem.setCustomization(this.garageSystem.currentCarId, { finish });
                this.applyInitialCustomization();
                this.render();
            });
        });
        this.container.querySelectorAll('.swatch[data-underglow]').forEach(sw => {
            sw.addEventListener('click', () => {
                const ug = (sw as HTMLElement).dataset.underglow;
                const underglowColor = (ug === 'off' || !ug) ? null : ug;
                this.garageSystem.setCustomization(this.garageSystem.currentCarId, { underglowColor });
                this.applyInitialCustomization();
                this.render();
            });
        });
        this.container.querySelectorAll('.swatch[data-rim]').forEach(sw => {
            sw.addEventListener('click', () => {
                const rimColor = (sw as HTMLElement).dataset.rim;
                if (!rimColor)
                    return;
                this.garageSystem.setCustomization(this.garageSystem.currentCarId, { rimColor });
                this.applyInitialCustomization();
                this.render();
            });
        });
    }
}
