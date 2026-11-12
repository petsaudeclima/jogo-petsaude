/**
 * MINIGAME: TRIAGEM DE COLETA SELETIVA
 * O jogador seleciona 4 resíduos e os envia ao destino correto.
 */
class SortingMinigame {
    constructor(scene, onComplete) {
        this.scene = scene;
        this.onComplete = onComplete;
        this.items = [
            { name: 'Papelão seco', type: 'papel', label: '📦 Papelão' },
            { name: 'Frasco de Vidro', type: 'vidro', label: '🍾 Vidro' },
            { name: 'Garrafa PET', type: 'plastico', label: '🥤 PET' },
            { name: 'Restos de Fruta', type: 'organico', label: '🍎 Orgânico' }
        ];
        this.currentIndex = 0;
        this.createUI();
    }

    createUI() {
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x121417, 0.94);
        overlay.fillRect(0, 0, 960, 540);
        this.container.add(overlay);

        const title = this.scene.add.text(480, 80, 'ESTAÇÃO DE TRIAGEM COMUNITÁRIA', {
            font: 'bold 20px Courier', fill: '#e09f3e'
        }).setOrigin(0.5);
        this.container.add(title);

        const subtitle = this.scene.add.text(480, 110, 'Direcione cada resíduo para a destinação correta:', {
            font: '14px Courier', fill: '#cbd5e0'
        }).setOrigin(0.5);
        this.container.add(subtitle);

        // Item Atual a ser descartado
        this.itemText = this.scene.add.text(480, 180, '', {
            font: 'bold 22px Courier', fill: '#ffffff', backgroundColor: '#2d3748', padding: { x: 18, y: 10 }
        }).setOrigin(0.5);
        this.container.add(this.itemText);

        // 4 Coletores Coloridos Oficiais
        const bins = [
            { name: 'Azul: Papel', type: 'papel', color: '#3182ce', key: '1', x: 240, y: 320 },
            { name: 'Verde: Vidro', type: 'vidro', color: '#38a169', key: '2', x: 400, y: 320 },
            { name: 'Vermelho: Plástico', type: 'plastico', color: '#e53e3e', key: '3', x: 560, y: 320 },
            { name: 'Castanho: Composteira', type: 'organico', color: '#7b4f2c', key: '4', x: 720, y: 320 }
        ];

        bins.forEach(b => {
            const box = this.scene.add.text(b.x, b.y, `[${b.key}]\n${b.name}`, {
                font: 'bold 12px Courier',
                fill: '#ffffff',
                align: 'center',
                backgroundColor: b.color,
                padding: { x: 10, y: 14 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            box.on('pointerdown', () => this.trySort(b.type));
            this.container.add(box);
        });

        this.feedbackText = this.scene.add.text(480, 420, '', {
            font: '14px Courier', fill: '#e09f3e'
        }).setOrigin(0.5);
        this.container.add(this.feedbackText);

        // Suporte ao teclado (1, 2, 3, 4)
        this.keyHandler = (e) => {
            if (e.key === '1') this.trySort('papel');
            if (e.key === '2') this.trySort('vidro');
            if (e.key === '3') this.trySort('plastico');
            if (e.key === '4') this.trySort('organico');
        };
        window.addEventListener('keydown', this.keyHandler);

        this.showNextItem();
    }

    showNextItem() {
        if (this.currentIndex >= this.items.length) {
            window.removeEventListener('keydown', this.keyHandler);
            this.container.destroy();
            this.onComplete();
            return;
        }
        const current = this.items[this.currentIndex];
        this.itemText.setText(`Resíduo: ${current.label}`);
        this.feedbackText.setText('');
    }

    trySort(type) {
        const current = this.items[this.currentIndex];
        if (current.type === type) {
            audio.sfxInteract();
            this.feedbackText.setColor('#68d391').setText(`✓ Correto! ${current.name} descartado adequadamente.`);
            this.currentIndex++;
            this.scene.time.delayedCall(600, () => this.showNextItem());
        } else {
            audio.sfxError();
            this.feedbackText.setColor('#ff4757').setText(`Atenção: Destino incorreto para ${current.name}. Tente novamente!`);
        }
    }
}

