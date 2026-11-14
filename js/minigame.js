/**
 * MINIGAME: ESTAÇÃO DE TRIAGEM (COLETA SELETIVA)
 * Interface dedicada em camada exclusiva com sprites pixel-art,
 * bloqueio de repetição de tecla e feedback educativo.
 */
class SortingMinigame {
    constructor(scene, onComplete) {
        this.scene = scene;
        this.onComplete = onComplete;
        this.items = [
            {
                name: 'Caixa de Papelão Seco',
                type: 'papel',
                sprite: 'waste-papel',
                tip: 'Papéis secos e papelão vão para o coletor azul.'
            },
            {
                name: 'Frasco de Vidro',
                type: 'vidro',
                sprite: 'waste-vidro',
                tip: 'Vidros devem ser separados com cuidado no coletor verde.'
            },
            {
                name: 'Garrafa PET',
                type: 'plastico',
                sprite: 'waste-plastico',
                tip: 'Plásticos recicláveis vão para o coletor vermelho.'
            },
            {
                name: 'Restos de Fruta',
                type: 'organico',
                sprite: 'waste-organico',
                tip: 'Resíduos orgânicos viram adubo na composteira marrom!'
            }
        ];

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.isFinished = false;
        this.isDestroyed = false;

        this.els = {
            progressText: document.getElementById('mg-progress-text'),
            progressPips: document.getElementById('mg-progress-pips'),
            itemCard: document.getElementById('mg-item-card'),
            itemImg: document.getElementById('mg-item-img'),
            itemName: document.getElementById('mg-item-name'),
            feedback: document.getElementById('mg-feedback'),
            binsWrap: document.getElementById('mg-bins'),
            conclusionWrap: document.getElementById('mg-conclusion'),
            btnFinish: document.getElementById('btn-mg-finish')
        };

        this.init();
    }

    init() {
        this.scene.ui.setState(UI_STATES.MINIGAME);
        this.els.conclusionWrap.classList.add('is-hidden');
        this.els.binsWrap.classList.remove('is-hidden');
        this.els.itemCard.classList.remove('is-hidden', 'discard-anim');

        // Vincular cliques dos 4 coletores
        this.binButtons = Array.from(document.querySelectorAll('.mg-bin-btn'));
        this.binButtons.forEach((btn) => {
            btn.classList.remove('bin-correct', 'bin-wrong');
            btn.onclick = () => {
                const type = btn.getAttribute('data-bin');
                this.trySort(type, btn);
            };
        });

        // Suporte a teclado (1, 2, 3, 4) sem repetição automática ao segurar
        this.keyHandler = (e) => {
            if (e.repeat || this.isTransitioning || this.isFinished) return;
            if (this.scene.ui.state !== UI_STATES.MINIGAME) return;

            const map = { '1': 'papel', '2': 'vidro', '3': 'plastico', '4': 'organico' };
            if (map[e.key]) {
                e.preventDefault();
                const btn = this.binButtons.find(b => b.getAttribute('data-bin') === map[e.key]);
                this.trySort(map[e.key], btn);
            }
        };
        window.addEventListener('keydown', this.keyHandler);

        this.renderCurrentItem();
    }

    renderCurrentItem() {
        this.updateProgress();

        if (this.currentIndex >= this.items.length) {
            this.showConclusion();
            return;
        }

        const current = this.items[this.currentIndex];
        this.els.itemImg.src = AssetGenerator.getDataUrl(this.scene, current.sprite);
        this.els.itemName.textContent = current.name;
        this.els.itemCard.classList.remove('discard-anim');
        this.els.feedback.className = 'mg-feedback';
        this.els.feedback.textContent = 'Escolha o coletor correspondente ou pressione 1, 2, 3 ou 4.';
    }

    updateProgress() {
        const doneCount = Math.min(this.currentIndex, this.items.length);
        this.els.progressText.textContent = `Progresso da triagem: ${doneCount}/${this.items.length}`;

        let pipsHtml = '';
        for (let i = 0; i < this.items.length; i++) {
            pipsHtml += `<span class="mg-pip ${i < doneCount ? 'filled' : ''}"></span>`;
        }
        this.els.progressPips.innerHTML = pipsHtml;
    }

    trySort(type, btnEl) {
        if (this.isTransitioning || this.isFinished) return;
        const current = this.items[this.currentIndex];

        if (current.type === type) {
            this.isTransitioning = true;
            audio.sfxInteract();

            if (btnEl) btnEl.classList.add('bin-correct');
            this.els.itemCard.classList.add('discard-anim');
            this.els.feedback.className = 'mg-feedback is-success';
            this.els.feedback.textContent = `Correto! ${current.tip}`;

            this.currentIndex++;
            this.updateProgress();

            this.advanceTimer = this.scene.time.delayedCall(650, () => {
                if (btnEl) btnEl.classList.remove('bin-correct');
                this.isTransitioning = false;
                this.renderCurrentItem();
            });
        } else {
            audio.sfxError();
            if (btnEl) {
                btnEl.classList.add('bin-wrong');
                this.scene.time.delayedCall(350, () => btnEl.classList.remove('bin-wrong'));
            }
            this.els.feedback.className = 'mg-feedback is-error';
            this.els.feedback.textContent = `Destino incorreto! ${current.tip}`;
        }
    }

    showConclusion() {
        this.isFinished = true;
        audio.sfxComplete();

        this.els.itemCard.classList.add('is-hidden');
        this.els.binsWrap.classList.add('is-hidden');
        this.els.feedback.textContent = '';
        this.els.conclusionWrap.classList.remove('is-hidden');

        const finishAndClose = () => {
            if (this.isDestroyed) return;
            this.destroy();
            if (this.onComplete) this.onComplete();
        };

        this.els.btnFinish.onclick = finishAndClose;

        // Também permitir fechar com Espaço / Enter / E após breve intervalo
        this.finishKeyHandler = (e) => {
            if (e.repeat || this.isDestroyed) return;
            if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
                e.preventDefault();
                finishAndClose();
            }
        };
        this.finishTimer = this.scene.time.delayedCall(250, () => {
            if (this.isFinished && !this.isDestroyed) {
                window.addEventListener('keydown', this.finishKeyHandler);
            }
        });
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.isFinished = true;

        window.removeEventListener('keydown', this.keyHandler);
        if (this.finishKeyHandler) {
            window.removeEventListener('keydown', this.finishKeyHandler);
        }
        if (this.advanceTimer) {
            this.advanceTimer.remove(false);
        }
        if (this.finishTimer) {
            this.finishTimer.remove(false);
        }
        this.binButtons.forEach((btn) => {
            btn.onclick = null;
            btn.classList.remove('bin-correct', 'bin-wrong');
        });
        this.els.btnFinish.onclick = null;
    }
}
