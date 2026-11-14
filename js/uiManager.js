/**
 * UIMANAGER CENTRALIZADO
 * Controla a máquina de estados da interface, visibilidade exclusiva de overlays,
 * transições, ícones pixel-art e coordenação entre Phaser e HTML.
 */
const UI_STATES = Object.freeze({
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    DIALOGUE: 'DIALOGUE',
    MINIGAME: 'MINIGAME',
    PAUSED: 'PAUSED',
    VICTORY: 'VICTORY',
    GAME_OVER: 'GAME_OVER'
});

class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.state = null;
        this.isMissionsModalOpen = false;

        // Referências aos overlays exclusivos
        this.els = {
            container: document.getElementById('game-container'),
            menu: document.getElementById('screen-menu'),
            hud: document.getElementById('hud-overlay'),
            prompt: document.getElementById('prompt-interaction'),
            missionsModal: document.getElementById('modal-missions'),
            dialogue: document.getElementById('screen-dialogue'),
            minigame: document.getElementById('screen-minigame'),
            pause: document.getElementById('screen-pause'),
            victory: document.getElementById('screen-victory'),
            gameover: document.getElementById('screen-gameover'),
            toastContainer: document.getElementById('toast-container')
        };

        this.populatePixelIcons();
        this.bindButtons();
    }

    /**
     * Injeta as texturas pixel-art geradas pelo AssetGenerator em todos os elementos [data-icon]
     */
    populatePixelIcons() {
        const iconEls = document.querySelectorAll('[data-icon]');
        iconEls.forEach((img) => {
            const key = img.getAttribute('data-icon');
            const url = AssetGenerator.getDataUrl(this.scene, key);
            if (url) {
                img.src = url;
            }
        });
    }

    bindButtons() {
        // Remover listeners antigos clonando ou usando referências diretas
        const bind = (id, handler) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.onclick = handler;
        };

        bind('btn-start-game', () => this.scene.startFromMenu());
        bind('btn-pause', () => this.scene.togglePause());
        bind('btn-missions-toggle', () => this.toggleMissionsModal());
        bind('btn-missions-close', () => this.toggleMissionsModal(false));

        bind('btn-pause-resume', () => this.scene.togglePause(false));
        bind('btn-pause-restart', () => this.scene.restartMatch(true));
        bind('btn-pause-menu', () => this.scene.restartMatch(false));

        bind('btn-victory-replay', () => this.scene.restartMatch(true));
        bind('btn-victory-menu', () => this.scene.restartMatch(false));

        bind('btn-gameover-retry', () => this.scene.restartMatch(true));
        bind('btn-gameover-menu', () => this.scene.restartMatch(false));
    }

    /**
     * Transição explícita de estado. Garante exclusividade de overlays e limpeza.
     */
    setState(newState, payload = {}) {
        if (!UI_STATES[newState]) {
            console.warn('Estado de UI inválido:', newState);
            return;
        }

        this.state = newState;
        this.els.container.setAttribute('data-ui-state', newState);

        // 1. Ocultar todos os overlays por padrão antes de ativar os permitidos
        this.hideAllOverlays();

        // 2. Fechar modal de missões expandido em qualquer mudança de estado
        this.isMissionsModalOpen = false;
        this.setVisible(this.els.missionsModal, false);

        // 3. Aplicar regras estritas por estado
        switch (newState) {
            case UI_STATES.MENU:
                this.setVisible(this.els.menu, true);
                break;

            case UI_STATES.PLAYING:
                this.setVisible(this.els.hud, true);
                this.els.hud.classList.remove('hud-dimmed');
                break;

            case UI_STATES.DIALOGUE:
                this.setVisible(this.els.hud, true);
                this.els.hud.classList.add('hud-dimmed');
                this.setVisible(this.els.dialogue, true);
                break;

            case UI_STATES.MINIGAME:
                // HUD completamente oculto durante minigame
                this.setVisible(this.els.minigame, true);
                break;

            case UI_STATES.PAUSED:
                this.setVisible(this.els.hud, true);
                this.els.hud.classList.add('hud-dimmed');
                this.setVisible(this.els.pause, true);
                break;

            case UI_STATES.VICTORY:
                // HUD, diálogos e minigame totalmente ocultos/destruídos
                this.renderVictorySummary(payload);
                this.setVisible(this.els.victory, true);
                break;

            case UI_STATES.GAME_OVER:
                this.renderGameOverSummary(payload);
                this.setVisible(this.els.gameover, true);
                break;
        }
    }

    hideAllOverlays() {
        this.setVisible(this.els.menu, false);
        this.setVisible(this.els.hud, false);
        this.setVisible(this.els.prompt, false);
        this.setVisible(this.els.missionsModal, false);
        this.setVisible(this.els.dialogue, false);
        this.setVisible(this.els.minigame, false);
        this.setVisible(this.els.pause, false);
        this.setVisible(this.els.victory, false);
        this.setVisible(this.els.gameover, false);
    }

    setVisible(el, visible) {
        if (!el) return;
        if (visible) {
            el.classList.remove('is-hidden');
            el.setAttribute('aria-hidden', 'false');
        } else {
            el.classList.add('is-hidden');
            el.setAttribute('aria-hidden', 'true');
        }
    }

    toggleMissionsModal(forceState) {
        if (this.state !== UI_STATES.PLAYING) return;
        this.isMissionsModalOpen = typeof forceState === 'boolean' ? forceState : !this.isMissionsModalOpen;
        this.setVisible(this.els.missionsModal, this.isMissionsModalOpen);
        if (this.isMissionsModalOpen) {
            this.setVisible(this.els.prompt, false);
        }
    }

    showInteractionPrompt(text) {
        if (this.state !== UI_STATES.PLAYING || this.isMissionsModalOpen) {
            this.setVisible(this.els.prompt, false);
            return;
        }
        const textEl = document.getElementById('prompt-text');
        if (textEl) textEl.textContent = text;
        this.setVisible(this.els.prompt, true);
    }

    hideInteractionPrompt() {
        this.setVisible(this.els.prompt, false);
    }

    updateMissions(missions) {
        const list = [
            { key: 'dengue', rowId: 'row-dengue', countId: 'm-dengue', pipsId: 'pips-dengue' },
            { key: 'rua', rowId: 'row-rua', countId: 'm-rua', pipsId: 'pips-rua' },
            { key: 'calor', rowId: 'row-calor', countId: 'm-calor', pipsId: 'pips-calor' },
            { key: 'lixo', rowId: 'row-lixo', countId: 'm-lixo', pipsId: 'pips-lixo' }
        ];

        list.forEach(({ key, rowId, countId, pipsId }) => {
            const m = missions[key];
            const row = document.getElementById(rowId);
            const countEl = document.getElementById(countId);
            const pipsEl = document.getElementById(pipsId);

            if (countEl) countEl.textContent = `${m.count}/${m.target}`;
            if (row) row.classList.toggle('mission-done', m.done);

            if (pipsEl) {
                let html = '';
                for (let i = 0; i < m.target; i++) {
                    html += `<span class="pip ${i < m.count ? 'filled' : ''}"></span>`;
                }
                pipsEl.innerHTML = html;
            }
        });
    }

    updateScore(score) {
        const el = document.getElementById('hud-score-val');
        if (el) el.textContent = `${score}/450`;
    }

    updateTimer(timeLeft) {
        const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const sec = (timeLeft % 60).toString().padStart(2, '0');
        const valEl = document.getElementById('hud-timer-val');
        const cardEl = document.getElementById('hud-timer-card');
        if (valEl) valEl.textContent = `${min}:${sec}`;
        if (cardEl) cardEl.classList.toggle('timer-warn', timeLeft <= 30);
    }

    updateTracker(text) {
        const el = document.getElementById('hud-tracker-text');
        if (el) el.textContent = text;
    }

    showToast(title, points) {
        if (!this.els.toastContainer || this.state === UI_STATES.VICTORY || this.state === UI_STATES.GAME_OVER) return;
        const toast = document.createElement('div');
        toast.className = 'pixel-toast';
        const iconUrl = AssetGenerator.getDataUrl(this.scene, 'icon-check');
        toast.innerHTML = `<img src="${iconUrl}" alt="" class="pixel-img" width="16" height="16"> <span>${title} (+${points} pts)</span>`;
        this.els.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 2300);
    }

    clearToasts() {
        if (this.els.toastContainer) this.els.toastContainer.innerHTML = '';
    }

    renderVictorySummary({ score, timeLeft, completedMissions, caresCount }) {
        const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const sec = (timeLeft % 60).toString().padStart(2, '0');

        const set = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };
        set('vic-missions', `${completedMissions}/4`);
        set('vic-cares', `${caresCount}/9`);
        set('vic-score', `${score}/450`);
        set('vic-time', `${min}:${sec}`);
    }

    renderGameOverSummary({ score, completedMissions, caresCount }) {
        const set = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };
        set('go-missions', `${completedMissions}/4`);
        set('go-cares', `${caresCount}/9`);
        set('go-score', `${score}/450`);
    }
}
