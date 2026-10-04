export class HUD {
    private speedElem: HTMLElement | null;
    private gearElem: HTMLElement | null;
    private rpmBarElem: HTMLElement | null;
    private todElem: HTMLElement | null;
    private weatherElem: HTMLElement | null;
    private fpsElem: HTMLElement | null;
    private camElem: HTMLElement | null;
    private toastElem: HTMLElement | null;
    private toastTimeout: number | null = null;
    private nitroBarElem: HTMLElement | null;
    private cashElem: HTMLElement | null;
    private repElem: HTMLElement | null;
    private stuntBannerElem: HTMLElement | null;
    private stuntTimeout: number | null = null;
    private missionBoxElem: HTMLElement | null;
    private missionTitleElem: HTMLElement | null;
    private missionStatusElem: HTMLElement | null;
    private missionTimerElem: HTMLElement | null;
    private promptElem: HTMLElement | null;
    private speedTrapFlashElem: HTMLElement | null;
    private frameCount: number = 0;
    private lastFpsTime: number = performance.now();
    constructor() {
        this.speedElem = document.getElementById('speed-val');
        this.gearElem = document.getElementById('gear-val');
        this.rpmBarElem = document.getElementById('rpm-bar');
        this.todElem = document.getElementById('tod-indicator');
        this.weatherElem = document.getElementById('weather-indicator');
        this.fpsElem = document.getElementById('fps-counter');
        this.camElem = document.getElementById('cam-name');
        this.toastElem = document.getElementById('toast');
        this.nitroBarElem = document.getElementById('nitro-bar');
        this.cashElem = document.getElementById('hud-cash-val');
        this.repElem = document.getElementById('hud-rep-val');
        this.stuntBannerElem = document.getElementById('stunt-banner');
        this.missionBoxElem = document.getElementById('mission-hud-box');
        this.missionTitleElem = document.getElementById('mission-title');
        this.missionStatusElem = document.getElementById('mission-status');
        this.missionTimerElem = document.getElementById('mission-timer');
        this.promptElem = document.getElementById('interaction-prompt');
        this.speedTrapFlashElem = document.getElementById('speed-trap-flash');
    }
    public update(speedKmh: number, gear: number, rpm: number, nitroPercent: number = 100, isBoosting: boolean = false) {
        if (this.speedElem) {
            this.speedElem.textContent = Math.round(speedKmh).toString();
        }
        if (this.gearElem) {
            if (gear === -1)
                this.gearElem.textContent = 'R';
            else if (gear === 0)
                this.gearElem.textContent = 'N';
            else
                this.gearElem.textContent = gear.toString();
        }
        if (this.rpmBarElem) {
            const rpmPercent = Math.min(100, Math.max(0, ((rpm - 800) / (8500 - 800)) * 100));
            this.rpmBarElem.style.width = `${rpmPercent}%`;
        }
        if (this.nitroBarElem) {
            this.nitroBarElem.style.width = `${Math.max(0, Math.min(100, nitroPercent))}%`;
            if (isBoosting) {
                this.nitroBarElem.classList.add('boosting');
            }
            else {
                this.nitroBarElem.classList.remove('boosting');
            }
        }
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 500) {
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
            if (this.fpsElem) {
                this.fpsElem.textContent = `${fps} FPS`;
            }
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }
    public updateWallet(cash: number, rep: number) {
        if (this.cashElem)
            this.cashElem.textContent = `$${cash.toLocaleString()}`;
        if (this.repElem)
            this.repElem.textContent = rep.toString();
    }
    public showStunt(title: string, score: number, type: 'drift' | 'near_miss' | 'speed_trap') {
        if (!this.stuntBannerElem)
            return;
        this.stuntBannerElem.innerHTML = `
      <span class="stunt-tag ${type}">${type.replace('_', ' ').toUpperCase()}</span>
      <span class="stunt-title">${title}</span>
      <span class="stunt-score">+$${score.toLocaleString()}</span>
    `;
        this.stuntBannerElem.classList.remove('hidden', 'fade-out');
        this.stuntBannerElem.classList.add('pop-in');
        if (this.stuntTimeout)
            window.clearTimeout(this.stuntTimeout);
        this.stuntTimeout = window.setTimeout(() => {
            this.stuntBannerElem?.classList.add('fade-out');
            setTimeout(() => this.stuntBannerElem?.classList.add('hidden'), 350);
        }, 1800);
    }
    public updateMissionStatus(active: boolean, title?: string, status?: string, timeRemaining?: number) {
        if (!this.missionBoxElem)
            return;
        if (!active) {
            this.missionBoxElem.classList.add('hidden');
            return;
        }
        this.missionBoxElem.classList.remove('hidden');
        if (this.missionTitleElem && title)
            this.missionTitleElem.textContent = title;
        if (this.missionStatusElem && status)
            this.missionStatusElem.textContent = status;
        if (this.missionTimerElem && timeRemaining !== undefined) {
            const secs = Math.max(0, Math.ceil(timeRemaining));
            this.missionTimerElem.textContent = `00:${secs < 10 ? '0' : ''}${secs}`;
        }
    }
    public showInteractionPrompt(text: string | null) {
        if (!this.promptElem)
            return;
        if (!text) {
            this.promptElem.classList.add('hidden');
        }
        else {
            this.promptElem.innerHTML = text;
            this.promptElem.classList.remove('hidden');
        }
    }
    public flashSpeedTrap() {
        if (!this.speedTrapFlashElem)
            return;
        this.speedTrapFlashElem.classList.remove('flash-anim');
        void this.speedTrapFlashElem.offsetWidth;
        this.speedTrapFlashElem.classList.add('flash-anim');
    }
    public setTimeOfDayLabel(text: string) {
        if (this.todElem) {
            this.todElem.textContent = text.toUpperCase();
        }
    }
    public setWeatherLabel(text: string) {
        if (this.weatherElem) {
            this.weatherElem.textContent = text.toUpperCase();
        }
    }
    public setCameraLabel(text: string) {
        if (this.camElem) {
            this.camElem.textContent = text;
        }
    }
    public showToast(message: string) {
        if (!this.toastElem)
            return;
        this.toastElem.textContent = message;
        this.toastElem.classList.remove('toast-hidden');
        if (this.toastTimeout !== null) {
            window.clearTimeout(this.toastTimeout);
        }
        this.toastTimeout = window.setTimeout(() => {
            this.toastElem?.classList.add('toast-hidden');
            this.toastTimeout = null;
        }, 2200);
    }
}
