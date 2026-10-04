import * as THREE from 'three';
import { WeatherSystem, WeatherType } from '../rendering/WeatherSystem';
import { SkyEnvironment, TimeOfDayPreset } from '../rendering/SkyEnvironment';
import { AudioManager } from '../core/AudioManager';
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export class SettingsUI {
    private container: HTMLElement;
    public isOpen: boolean = false;
    private renderer: THREE.WebGLRenderer;
    private skyEnv: SkyEnvironment;
    private weatherSystem: WeatherSystem;
    private audio: AudioManager;
    public currentQuality: GraphicsQuality = 'high';
    constructor(renderer: THREE.WebGLRenderer, skyEnv: SkyEnvironment, weatherSystem: WeatherSystem, audio: AudioManager) {
        this.renderer = renderer;
        this.skyEnv = skyEnv;
        this.weatherSystem = weatherSystem;
        this.audio = audio;
        this.container = document.createElement('div');
        this.container.id = 'settings-modal';
        this.container.className = 'settings-modal hidden';
        document.body.appendChild(this.container);
        this.render();
    }
    public toggle(open?: boolean) {
        this.isOpen = open !== undefined ? open : !this.isOpen;
        if (this.isOpen) {
            this.render();
            this.container.classList.remove('hidden');
        }
        else {
            this.container.classList.add('hidden');
        }
    }
    public setQuality(quality: GraphicsQuality) {
        this.currentQuality = quality;
        if (quality === 'low') {
            this.renderer.setPixelRatio(1.0);
            this.renderer.shadowMap.enabled = false;
            this.skyEnv.sunLight.castShadow = false;
        }
        else if (quality === 'medium') {
            this.renderer.setPixelRatio(1.0);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.BasicShadowMap;
            this.skyEnv.sunLight.castShadow = true;
            this.skyEnv.sunLight.shadow.mapSize.set(1024, 1024);
        }
        else if (quality === 'high') {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.skyEnv.sunLight.castShadow = true;
            this.skyEnv.sunLight.shadow.mapSize.set(2048, 2048);
        }
        else if (quality === 'ultra') {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.skyEnv.sunLight.castShadow = true;
            this.skyEnv.sunLight.shadow.mapSize.set(2048, 2048);
        }
        this.skyEnv.sunLight.shadow.map?.dispose();
        this.skyEnv.sunLight.shadow.map = null;
    }
    public render() {
        this.container.innerHTML = `
      <div class="settings-content">
        <div class="settings-header">
          <div class="settings-title">
            <h2>⚙️ GAME SETTINGS & CONTROLS</h2>
            <p>GRAPHICS PRESETS • DYNAMIC WEATHER • AUDIO CONTROLS</p>
          </div>
          <button class="btn-close-settings" id="btn-close-settings">CLOSE [ESC]</button>
        </div>

        <div class="settings-grid">
          <!-- Graphics Section -->
          <div class="settings-box">
            <h3>GRAPHICS PRESET</h3>
            <div class="preset-buttons">
              ${(['low', 'medium', 'high', 'ultra'] as GraphicsQuality[]).map(q => `
                <button class="btn-preset ${this.currentQuality === q ? 'active' : ''}" data-quality="${q}">
                  ${q.toUpperCase()}
                </button>
              `).join('')}
            </div>
            <p class="settings-note">
              ${this.currentQuality === 'low' ? 'Low: Shadows disabled, optimized for maximum frame rate.' :
            this.currentQuality === 'medium' ? 'Medium: Standard shadows, balanced for laptops.' :
                this.currentQuality === 'high' ? 'High: PCF Soft Shadows, native resolution, full reflections.' :
                    'Ultra: 2K Shadow maps, high-fidelity shaders, max render scale.'}
            </p>
          </div>

          <!-- Weather & Atmosphere Section -->
          <div class="settings-box">
            <h3>WEATHER & TIME OF DAY</h3>
            <div class="control-row">
              <label>WEATHER</label>
              <div class="opt-buttons">
                ${(['clear', 'cloudy', 'rain', 'fog'] as WeatherType[]).map(w => `
                  <button class="btn-weather-opt ${this.weatherSystem.currentWeather === w ? 'active' : ''}" data-weather="${w}">
                    ${w.toUpperCase()}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-row">
              <label>TIME OF DAY</label>
              <div class="opt-buttons">
                ${(['afternoon', 'golden_hour', 'night'] as TimeOfDayPreset[]).map(t => `
                  <button class="btn-time-opt ${this.skyEnv.currentPreset === t ? 'active' : ''}" data-time="${t}">
                    ${t === 'golden_hour' ? 'GOLDEN' : t.toUpperCase()}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Audio Sliders Section -->
          <div class="settings-box">
            <h3>AUDIO ENGINE</h3>
            <div class="slider-row">
              <span>MASTER VOLUME</span>
              <input type="range" id="slider-master-vol" min="0" max="100" value="85" />
            </div>
            <div class="slider-row">
              <span>ENGINE ROAR</span>
              <input type="range" id="slider-engine-vol" min="0" max="100" value="90" />
            </div>
            <div class="slider-row">
              <span>SFX & NITRO</span>
              <input type="range" id="slider-sfx-vol" min="0" max="100" value="80" />
            </div>
          </div>

          <!-- Controls Reference -->
          <div class="settings-box controls-box">
            <h3>CONTROLS REFERENCE</h3>
            <div class="keybinds-grid">
              <div><span class="k-key">W / ↑</span> Accelerate / Forward</div>
              <div><span class="k-key">S / ↓</span> Brake / Reverse</div>
              <div><span class="k-key">A / ←</span> Steer Left</div>
              <div><span class="k-key">D / →</span> Steer Right</div>
              <div><span class="k-key">SPACE</span> Handbrake Drift</div>
              <div><span class="k-key">SHIFT / N</span> Nitro Boost</div>
              <div><span class="k-key">C</span> Cycle Camera Mode</div>
              <div><span class="k-key">T</span> Cycle Time of Day</div>
              <div><span class="k-key">K</span> Cycle Weather</div>
              <div><span class="k-key">H</span> Hazard Blinkers</div>
              <div><span class="k-key">L</span> Headlights Toggle</div>
              <div><span class="k-key">G</span> Apex Garage & Tuning</div>
              <div><span class="k-key">E</span> Start Mission / Interact</div>
              <div><span class="k-key">R</span> Reset Vehicle Position</div>
            </div>
          </div>
        </div>
      </div>
    `;
        this.bindEvents();
    }
    private bindEvents() {
        document.getElementById('btn-close-settings')?.addEventListener('click', () => {
            this.toggle(false);
        });
        this.container.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const q = (btn as HTMLElement).dataset.quality as GraphicsQuality;
                if (q) {
                    this.setQuality(q);
                    this.render();
                    this.audio.playCheckpointChime();
                }
            });
        });
        this.container.querySelectorAll('.btn-weather-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                const w = (btn as HTMLElement).dataset.weather as WeatherType;
                if (w) {
                    this.weatherSystem.setWeather(w);
                    this.render();
                }
            });
        });
        this.container.querySelectorAll('.btn-time-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                const t = (btn as HTMLElement).dataset.time as TimeOfDayPreset;
                if (t) {
                    this.skyEnv.setTimeOfDay(t);
                    this.render();
                }
            });
        });
        const masterSlider = document.getElementById('slider-master-vol') as HTMLInputElement;
        if (masterSlider) {
            masterSlider.addEventListener('input', () => {
                const vol = parseInt(masterSlider.value, 10) / 100;
                this.audio.setMasterVolume(vol);
            });
        }
    }
}
