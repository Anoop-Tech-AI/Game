import { RaceResultsData } from '../missions/RaceSystem';

export class RaceResultsUI {
    private container: HTMLElement;
    public isOpen: boolean = false;
    public onRetry?: () => void;
    public onContinue?: () => void;
    public onGarage?: () => void;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'race-results-modal';
        this.container.className = 'race-results-modal hidden';
        document.body.appendChild(this.container);
    }

    public show(results: RaceResultsData) {
        const isWin = results.position === 1;
        const posSuffix = results.position === 1 ? 'ST' : results.position === 2 ? 'ND' : results.position === 3 ? 'RD' : 'TH';
        const mins = Math.floor(results.playerTime / 60);
        const secs = (results.playerTime % 60).toFixed(2);
        const timeStr = `${mins < 10 ? '0' : ''}${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;

        this.container.innerHTML = `
            <div class="results-card ${isWin ? 'victory' : ''}">
                <div class="results-banner">
                    <h2>${isWin ? '🏆 VICTORY!' : '🏁 RACE COMPLETED'}</h2>
                    <p class="track-name-lbl">${results.trackName}</p>
                </div>

                <div class="results-grid">
                    <div class="result-stat-box position-box">
                        <span class="res-lbl">FINAL POSITION</span>
                        <div class="rank-display">
                            <span class="rank-num">${results.position}</span>
                            <span class="rank-suffix">${posSuffix}</span>
                        </div>
                    </div>

                    <div class="result-stat-box time-box">
                        <span class="res-lbl">RACE TIME</span>
                        <div class="time-display">${timeStr}</div>
                        ${results.isNewRecord ? '<span class="new-record-tag">⭐ NEW RECORD</span>' : ''}
                    </div>

                    <div class="result-stat-box reward-box">
                        <span class="res-lbl">REWARDS EARNED</span>
                        <div class="reward-row">
                            <span class="r-chip cash">+$${results.rewardCash.toLocaleString()}</span>
                            <span class="r-chip xp">+${results.rewardXp} XP</span>
                        </div>
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn-res retry" id="btn-race-retry">RETRY RACE</button>
                    <button class="btn-res continue" id="btn-race-continue">CONTINUE IN CITY</button>
                    <button class="btn-res garage" id="btn-race-garage">APEX GARAGE</button>
                </div>
            </div>
        `;

        this.container.classList.remove('hidden');
        this.isOpen = true;

        document.getElementById('btn-race-retry')?.addEventListener('click', () => {
            this.hide();
            if (this.onRetry) this.onRetry();
        });

        document.getElementById('btn-race-continue')?.addEventListener('click', () => {
            this.hide();
            if (this.onContinue) this.onContinue();
        });

        document.getElementById('btn-race-garage')?.addEventListener('click', () => {
            this.hide();
            if (this.onGarage) this.onGarage();
        });
    }

    public hide() {
        this.container.classList.add('hidden');
        this.isOpen = false;
    }
}
