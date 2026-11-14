/**
 * CENA PRINCIPAL: VILA ESPERANÇA (MAPA EXPANDIDO 2400 x 1800)
 * Integrada ao UIManager centralizado, com máquina de estados,
 * diálogos sem sobreposição e reinício limpo sem recarregar a página.
 */
class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    init(data) {
        this.autoStart = data && data.autoStart === true;
    }

    preload() {
        AssetGenerator.create(this);
    }

    create() {
        this.score = 0;
        this.timeLeft = 300; // 5 minutos (300 segundos)
        this.gameCompleted = false;
        this.activeMinigame = null;
        this.dialogueCleanup = null;
        this.dialogueKeyReleased = true;
        this.dialogueCooldownUntil = 0;

        // Dimensões do Mundo Expandido
        this.WORLD_WIDTH = 2400;
        this.WORLD_HEIGHT = 1800;

        // Estado dos 9 cuidados
        this.missions = {
            dengue: { pot: false, tires: false, tank: false, count: 0, target: 3, done: false },
            rua: { drain: false, barricade: false, count: 0, target: 2, done: false },
            calor: { antonio: false, cooling: false, count: 0, target: 2, done: false },
            lixo: { flagrante: false, sorting: false, count: 0, target: 2, done: false }
        };

        // Limites físicos do mundo
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Montar Mapa da Vila (2400x1800)
        this.createWorldMap();

        // Criar Jogador no coração da Praça da Esperança
        this.player = this.physics.add.sprite(1200, 920, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(18, 14);
        this.player.body.setOffset(3, 18);

        // Colisões com o cenário
        this.physics.add.collider(this.player, this.colliders);

        // Câmera com acompanhamento suave
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Controles de Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SPACE,M,ESC');

        // Atalhos globais de Pausa (ESC) e Painel de Missões (M)
        this.globalKeyHandler = (e) => {
            if (e.repeat) return;
            if (!this.ui) return;

            if (e.code === 'Escape') {
                if (this.ui.state === UI_STATES.PLAYING) {
                    if (this.ui.isMissionsModalOpen) {
                        this.ui.toggleMissionsModal(false);
                    } else {
                        this.togglePause(true);
                    }
                } else if (this.ui.state === UI_STATES.PAUSED) {
                    this.togglePause(false);
                }
            } else if (e.code === 'KeyM' && this.ui.state === UI_STATES.PLAYING) {
                this.ui.toggleMissionsModal();
            }
        };
        window.addEventListener('keydown', this.globalKeyHandler);

        // Limpeza automática ao encerrar/reiniciar a cena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cleanupAllResources();
        });

        // Inicializar NPCs e Objetos das Missões
        this.createNPCs();
        this.createInteractiveObjects();

        // Cronômetro (inicia pausado se estiver no MENU)
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true,
            paused: !this.autoStart
        });

        // Inicializar UIManager Centralizado
        this.ui = new UIManager(this);
        this.ui.clearToasts();
        this.ui.updateMissions(this.missions);
        this.ui.updateScore(this.score);
        this.ui.updateTimer(this.timeLeft);
        this.updateCompass();

        if (this.autoStart) {
            this.startFromMenu();
        } else {
            this.ui.setState(UI_STATES.MENU);
        }
    }

    startFromMenu() {
        if (this.timeEvent) this.timeEvent.paused = false;
        this.ui.setState(UI_STATES.PLAYING);
        this.updateCompass();

        // Diálogo inicial da Coordenadora
        this.time.delayedCall(350, () => {
            if (this.ui && this.ui.state === UI_STATES.PLAYING && !this.gameCompleted) {
                this.showDialogue(
                    'Coordenadora',
                    'Bem-vindo à Vila Esperança! O nosso bairro precisa de cuidados urgentes hoje. Converse com os moradores e atue nas quatro frentes prioritárias antes que o tempo acabe. Siga o rastreador no topo da tela para se orientar!'
                );
            }
        });
    }

    togglePause(forcePause) {
        if (!this.ui || this.gameCompleted) return;
        const shouldPause = typeof forcePause === 'boolean'
            ? forcePause
            : this.ui.state !== UI_STATES.PAUSED;

        if (shouldPause && this.ui.state === UI_STATES.PLAYING) {
            if (this.timeEvent) this.timeEvent.paused = true;
            this.player.setVelocity(0, 0);
            this.ui.setState(UI_STATES.PAUSED);
        } else if (!shouldPause && this.ui.state === UI_STATES.PAUSED) {
            if (this.timeEvent) this.timeEvent.paused = false;
            this.ui.setState(UI_STATES.PLAYING);
        }
    }

    restartMatch(autoStart = true) {
        this.cleanupAllResources();
        this.scene.restart({ autoStart });
    }

    cleanupAllResources() {
        this.cleanupDialogueListeners();
        if (this.activeMinigame) {
            this.activeMinigame.destroy();
            this.activeMinigame = null;
        }
        if (this.globalKeyHandler) {
            window.removeEventListener('keydown', this.globalKeyHandler);
            this.globalKeyHandler = null;
        }
        if (this.timeEvent) {
            this.timeEvent.remove(false);
            this.timeEvent = null;
        }
        if (this.ui) {
            this.ui.clearToasts();
        }
    }

    createWorldMap() {
        this.colliders = this.physics.add.staticGroup();

        // 1. CHÃO GERAL (Grama de base cobrindo 2400x1800)
        this.add.tileSprite(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'tile-grass').setDepth(0);

        // 2. REDE DE RUAS E CAMINHOS PAVIMENTADOS (Depth 1)
        this.add.tileSprite(2020, this.WORLD_HEIGHT / 2, 128, this.WORLD_HEIGHT, 'tile-road').setDepth(1);
        this.add.tileSprite(1936, this.WORLD_HEIGHT / 2, 40, this.WORLD_HEIGHT, 'tile-path').setDepth(1);
        this.add.tileSprite(2104, this.WORLD_HEIGHT / 2, 40, this.WORLD_HEIGHT, 'tile-path').setDepth(1);

        // Praça da Esperança (Centro)
        this.add.tileSprite(1200, 900, 560, 360, 'tile-path').setDepth(1);

        // Via Residencial Norte
        this.add.tileSprite(1200, 390, 900, 64, 'tile-path').setDepth(1);
        this.add.tileSprite(1200, 560, 64, 340, 'tile-path').setDepth(1);

        // Via de Acesso Sul / Entrada da Comunidade
        this.add.tileSprite(1200, 1400, 72, 640, 'tile-path').setDepth(1);

        // Conexão Praça à Rua Principal Leste
        this.add.tileSprite(1710, 900, 460, 64, 'tile-path').setDepth(1);

        // Trilha de Terra para Área Ambiental Oeste
        this.add.tileSprite(685, 900, 470, 64, 'tile-dirt').setDepth(1);
        this.add.tileSprite(450, 860, 420, 320, 'tile-dirt').setDepth(1);

        // --- REGIÃO 1: PRAÇA DA ESPERANÇA (CENTRO) ---
        this.flowerBed1 = this.add.image(1150, 860, 'flowers-clean').setDepth(5);
        this.flowerBed2 = this.add.image(1250, 860, 'flowers-clean').setDepth(5);
        this.add.image(1200, 960, 'flowers-clean').setDepth(5);

        this.addBench(1060, 940);
        this.addBench(1340, 940);
        this.addBench(1130, 1020);
        this.addBench(1270, 1020);

        this.addLamp(960, 760);
        this.addLamp(1440, 760);
        this.addLamp(960, 1040);
        this.addLamp(1440, 1040);

        this.addTree(980, 800);
        this.addTree(1420, 800);
        this.addTree(980, 980);
        this.addTree(1420, 980);
        this.addTree(1200, 720);

        this.addBush(1020, 870);
        this.addBush(1380, 870);
        this.addWildFlowers(1100, 830);
        this.addWildFlowers(1300, 830);

        // --- REGIÃO 2: BAIRRO RESIDENCIAL (NORTE) ---
        this.addHouse(780, 320, 'house-blue');
        this.addHouse(920, 320, 'house-yellow');
        this.addHouse(1060, 320, 'house-green');
        this.addHouse(1340, 320, 'house-yellow');
        this.addHouse(1480, 320, 'house-red');
        this.addHouse(1620, 320, 'house-blue');

        for (let x = 740; x <= 1660; x += 32) {
            if (x < 1170 || x > 1230) {
                this.addFenceH(x, 260);
            }
        }
        this.addFenceV(730, 290);
        this.addFenceV(1670, 290);

        this.addTree(850, 210);
        this.addTree(1000, 210);
        this.addTree(1200, 210);
        this.addTree(1550, 210);
        this.addBush(900, 430);
        this.addBush(1040, 430);
        this.addBush(1360, 430);
        this.addBush(1500, 430);
        this.addLamp(760, 430);
        this.addLamp(1160, 430);
        this.addLamp(1640, 430);

        // --- REGIÃO 3: ÁREA AMBIENTAL E RECICLAGEM (OESTE) ---
        const compost = this.add.image(440, 750, 'compost-bin');
        compost.setDepth(750 + 10);
        const compostBody = this.colliders.create(440, 756, null);
        compostBody.setSize(30, 18).setVisible(false);

        this.addTree(280, 720);
        this.addTree(260, 880);
        this.addTree(320, 1020);
        this.addTree(540, 720);
        this.addTree(600, 800);
        this.addBush(240, 800);
        this.addBush(320, 770);
        this.addBush(380, 980);
        this.addBush(480, 1040);
        this.addRock(310, 830);
        this.addRock(460, 950);
        this.addRock(590, 760);
        this.addWildFlowers(350, 890);
        this.addWildFlowers(420, 830);
        this.addWildFlowers(520, 780);

        // --- REGIÃO 4: RUA PRINCIPAL (LESTE) ---
        this.addLamp(1936, 300);
        this.addLamp(1936, 600);
        this.addLamp(1936, 900);
        this.addLamp(1936, 1200);
        this.addLamp(1936, 1500);

        this.addHouse(2180, 400, 'house-yellow');
        this.addHouse(2180, 700, 'house-green');
        this.addHouse(2180, 1300, 'house-red');
        this.addTree(1900, 450);
        this.addTree(1900, 750);
        this.addTree(1900, 1050);
        this.addTree(1900, 1350);

        // --- REGIÃO 5: ENTRADA DA COMUNIDADE (SUL) ---
        const sign = this.add.image(1200, 1680, 'sign-welcome');
        sign.setDepth(1680 + 10);
        const signBody = this.colliders.create(1200, 1686, null);
        signBody.setSize(48, 16).setVisible(false);

        this.addHouse(1040, 1520, 'house-blue');
        this.addHouse(1360, 1520, 'house-yellow');
        this.addLamp(1150, 1420);
        this.addLamp(1250, 1420);
        this.addLamp(1150, 1640);
        this.addLamp(1250, 1640);
        this.addTree(1080, 1640);
        this.addTree(1320, 1640);
        this.addBush(1140, 1580);
        this.addBush(1260, 1580);
        this.addWildFlowers(1120, 1680);
        this.addWildFlowers(1280, 1680);
    }

    addHouse(x, y, key) {
        const h = this.add.image(x, y, key);
        h.setDepth(y + 25);
        const b = this.colliders.create(x, y + 10, null);
        b.setSize(56, 36).setVisible(false);
    }

    addTree(x, y) {
        const t = this.add.image(x, y, 'tree');
        t.setDepth(y + 20);
        const b = this.colliders.create(x, y + 14, null);
        b.setSize(12, 10).setVisible(false);
    }

    addBush(x, y) {
        this.add.image(x, y, 'bush').setDepth(y + 8);
    }

    addBench(x, y) {
        const b = this.add.image(x, y, 'bench');
        b.setDepth(y + 8);
        const col = this.colliders.create(x, y + 4, null);
        col.setSize(28, 10).setVisible(false);
    }

    addLamp(x, y) {
        const l = this.add.image(x, y, 'lamp-post');
        l.setDepth(y + 20);
        const col = this.colliders.create(x, y + 16, null);
        col.setSize(8, 6).setVisible(false);
    }

    addFenceH(x, y) {
        const f = this.add.image(x, y, 'fence-h');
        f.setDepth(y + 6);
        const col = this.colliders.create(x, y + 2, null);
        col.setSize(30, 8).setVisible(false);
    }

    addFenceV(x, y) {
        const f = this.add.image(x, y, 'fence-v');
        f.setDepth(y + 6);
        const col = this.colliders.create(x, y, null);
        col.setSize(8, 28).setVisible(false);
    }

    addRock(x, y) {
        this.add.image(x, y, 'rock').setDepth(y + 2);
    }

    addWildFlowers(x, y) {
        this.add.image(x, y, 'flowers-wild').setDepth(4);
    }

    createNPCs() {
        this.npcs = [];

        this.npcCoord = this.add.sprite(1200, 820, 'npc-coordenadora');
        this.npcCoord.setDepth(820 + 12);
        this.npcs.push({ sprite: this.npcCoord, name: 'Coordenadora', id: 'coordenadora' });

        this.npcAntonio = this.add.sprite(1060, 930, 'npc-antonio');
        this.npcAntonio.setDepth(930 + 12);
        this.npcs.push({ sprite: this.npcAntonio, name: 'Seu Antônio', id: 'antonio' });

        this.npcJoao = this.add.sprite(1060, 370, 'npc-joao');
        this.npcJoao.setDepth(370 + 12);
        this.npcs.push({ sprite: this.npcJoao, name: 'João', id: 'joao' });

        this.npcMorador = this.add.sprite(480, 920, 'npc-morador');
        this.npcMorador.setDepth(920 + 12);
        this.npcs.push({ sprite: this.npcMorador, name: 'Morador', id: 'morador' });
    }

    createInteractiveObjects() {
        this.interactives = [];

        // MISSÃO 1: DENGUE
        this.objPot = this.add.sprite(1260, 370, 'pot-dirty').setDepth(380);
        this.interactives.push({
            sprite: this.objPot,
            id: 'dengue-pot',
            prompt: 'Tratar prato de planta',
            action: () => this.handleDenguePot()
        });

        this.objTires = this.add.sprite(580, 1040, 'tires-dirty').setDepth(1050);
        this.interactives.push({
            sprite: this.objTires,
            id: 'dengue-tires',
            prompt: 'Virar garrafas e recolher pneus',
            action: () => this.handleDengueTires()
        });

        this.objTank = this.add.sprite(1480, 200, 'tank-open').setDepth(210);
        this.interactives.push({
            sprite: this.objTank,
            id: 'dengue-tank',
            prompt: 'Tampar caixa d’água',
            action: () => this.handleDengueTank()
        });

        // MISSÃO 2: RUA ALAGADA
        this.objDrain = this.add.sprite(1990, 600, 'drain-clogged').setDepth(610);
        this.interactives.push({
            sprite: this.objDrain,
            id: 'rua-drain',
            prompt: 'Desobstruir bueiro com segurança',
            action: () => this.handleRuaDrain()
        });

        this.objFlood = this.add.sprite(2040, 1150, 'flood-danger').setDepth(1160);
        this.interactives.push({
            sprite: this.objFlood,
            id: 'rua-flood',
            prompt: 'Sinalizar área alagada com cones',
            action: () => this.handleRuaFlood()
        });

        // MISSÃO 3: CALOR EXTREMO
        this.objFountain = this.add.sprite(1320, 840, 'fountain-off').setDepth(850);
        this.interactives.push({
            sprite: this.objFountain,
            id: 'calor-cooling',
            prompt: 'Instalar tenda e ativar bebedouro',
            action: () => this.handleCalorCooling()
        });

        // MISSÃO 4: BAIRRO LIMPO
        this.objTrash = this.add.sprite(530, 920, 'trash-dump').setDepth(930);

        this.objRecycle = this.add.sprite(360, 820, 'bench').setDepth(828);
        this.recycleSign = this.add.text(360, 792, 'COLETA SELETIVA', {
            fontFamily: 'Silkscreen, Courier, monospace',
            fontSize: '10px',
            fill: '#F3EBD6',
            backgroundColor: '#244C3A',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setDepth(829);

        this.interactives.push({
            sprite: this.objRecycle,
            id: 'lixo-sorting',
            prompt: 'Triagem da Coleta Seletiva',
            action: () => this.openSortingMinigame()
        });
    }

    update() {
        this.player.setDepth(this.player.y + 12);

        // Somente permite movimentação e interação no estado PLAYING (sem modal de missões aberto)
        if (!this.ui || this.ui.state !== UI_STATES.PLAYING || this.ui.isMissionsModalOpen || this.gameCompleted) {
            this.player.setVelocity(0, 0);
            if (this.ui) this.ui.hideInteractionPrompt();
            return;
        }

        const speed = 190;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;

        this.player.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            if (this.time.now % 260 < 20) audio.sfxFootstep();
            this.updateCompass();
        }

        // Prevenção definitiva de reabertura involuntária de diálogos
        if (!this.dialogueKeyReleased) {
            if (this.keys.SPACE.isUp && this.keys.E.isUp) {
                this.dialogueKeyReleased = true;
            } else {
                return;
            }
        }

        if (this.time.now < this.dialogueCooldownUntil) {
            return;
        }

        let activePrompt = null;
        let closestAction = null;

        for (let item of this.interactives) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.sprite.x, item.sprite.y);
            if (dist < 46) {
                activePrompt = item.prompt;
                closestAction = item.action;
                break;
            }
        }

        if (!activePrompt) {
            for (let npc of this.npcs) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
                if (dist < 48) {
                    activePrompt = `Falar com ${npc.name}`;
                    closestAction = () => this.handleNPCInteraction(npc.id);
                    break;
                }
            }
        }

        if (activePrompt) {
            this.ui.showInteractionPrompt(activePrompt);
            if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                closestAction();
            }
        } else {
            this.ui.hideInteractionPrompt();
        }
    }

    /**
     * Rastreador discreto de objetivo: mostra o cuidado pendente mais próximo
     */
    updateCompass() {
        if (!this.ui) return;

        const candidates = [];
        if (!this.missions.dengue.pot) candidates.push({ label: 'Vaso c/ Água (Dengue)', x: 1260, y: 370 });
        if (!this.missions.dengue.tires) candidates.push({ label: 'Pneus/Garrafas (Dengue)', x: 580, y: 1040 });
        if (!this.missions.dengue.tank) candidates.push({ label: 'Caixa d’Água (Dengue)', x: 1480, y: 200 });
        if (!this.missions.rua.drain) candidates.push({ label: 'Bueiro Entupido (Rua)', x: 1990, y: 600 });
        if (!this.missions.rua.barricade) candidates.push({ label: 'Área Alagada (Rua)', x: 2040, y: 1150 });
        if (!this.missions.calor.antonio) candidates.push({ label: 'Seu Antônio (Calor)', x: 1060, y: 930 });
        if (!this.missions.calor.cooling) candidates.push({ label: 'Bebedouro/Tenda (Calor)', x: 1320, y: 840 });
        if (!this.missions.lixo.flagrante) candidates.push({ label: 'Morador/Lixo (Bairro Limpo)', x: 480, y: 920 });
        if (!this.missions.lixo.sorting) candidates.push({ label: 'Coleta Seletiva (Bairro Limpo)', x: 360, y: 820 });

        if (candidates.length === 0) {
            this.ui.updateTracker('Todos os cuidados concluídos!');
            return;
        }

        // Encontrar o objetivo pendente mais próximo
        let nearest = candidates[0];
        let minDist = Infinity;
        for (const c of candidates) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
            if (d < minDist) {
                minDist = d;
                nearest = c;
            }
        }

        const dx = nearest.x - this.player.x;
        const dy = nearest.y - this.player.y;
        const meters = Math.round(minDist / 20);

        let dir = 'Aqui';
        if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
            if (dy < -60 && Math.abs(dx) <= 80) dir = 'Norte';
            else if (dy > 60 && Math.abs(dx) <= 80) dir = 'Sul';
            else if (dx > 60 && Math.abs(dy) <= 80) dir = 'Leste';
            else if (dx < -60 && Math.abs(dy) <= 80) dir = 'Oeste';
            else if (dx > 0 && dy < 0) dir = 'Nordeste';
            else if (dx > 0 && dy > 0) dir = 'Sudeste';
            else if (dx < 0 && dy > 0) dir = 'Sudoeste';
            else if (dx < 0 && dy < 0) dir = 'Noroeste';
        }

        this.ui.updateTracker(`Próximo: ${nearest.label} • ${dir} (${meters}m)`);
    }

    // --- CONTROLADOR CENTRALIZADO DE DIÁLOGOS ---

    getPortraitKey(speaker) {
        if (speaker.includes('Coordenadora')) return 'portrait-coordenadora';
        if (speaker.includes('Antônio')) return 'portrait-antonio';
        if (speaker.includes('João')) return 'portrait-joao';
        if (speaker.includes('Morador')) return 'portrait-morador';
        return 'portrait-player';
    }

    cleanupDialogueListeners() {
        if (this.dialogueCleanup) {
            this.dialogueCleanup();
            this.dialogueCleanup = null;
        }
    }

    closeDialogue(nextState = UI_STATES.PLAYING) {
        this.cleanupDialogueListeners();
        this.dialogueCooldownUntil = this.time.now + 250;
        this.dialogueKeyReleased = false;

        if (nextState && !this.gameCompleted) {
            this.ui.setState(nextState);
        }
    }

    showDialogue(speaker, text) {
        if (this.gameCompleted || this.ui.state === UI_STATES.DIALOGUE || this.ui.state === UI_STATES.MINIGAME) return;

        this.cleanupDialogueListeners();
        this.player.setVelocity(0, 0);

        const portraitEl = document.getElementById('dlg-portrait');
        const speakerEl = document.getElementById('dlg-speaker');
        const textEl = document.getElementById('dlg-text');
        const optionsEl = document.getElementById('dlg-options');
        const hintEl = document.getElementById('dlg-hint');
        const boxEl = document.getElementById('screen-dialogue');

        portraitEl.src = AssetGenerator.getDataUrl(this, this.getPortraitKey(speaker));
        speakerEl.textContent = speaker;
        textEl.textContent = text;
        optionsEl.innerHTML = '';
        optionsEl.classList.add('is-hidden');
        hintEl.textContent = '[ESPAÇO] ou [E] Continuar';
        hintEl.classList.remove('is-hidden');

        this.ui.setState(UI_STATES.DIALOGUE);

        const openedAt = this.time.now;
        let canClose = (this.keys.SPACE.isUp && this.keys.E.isUp);

        const guardTimer = this.time.delayedCall(120, () => {
            if (this.keys.SPACE.isUp && this.keys.E.isUp) canClose = true;
        });
        const forceTimer = this.time.delayedCall(220, () => { canClose = true; });

        const onKeyDown = (event) => {
            if (event.repeat) return;
            if (event.code === 'Space' || event.code === 'KeyE') {
                event.preventDefault();
                if (!canClose && (this.time.now - openedAt > 160)) canClose = true;
                if (canClose) this.closeDialogue(UI_STATES.PLAYING);
            }
        };

        const onClick = () => {
            if (this.time.now - openedAt > 120) {
                this.closeDialogue(UI_STATES.PLAYING);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        boxEl.addEventListener('click', onClick);

        this.dialogueCleanup = () => {
            window.removeEventListener('keydown', onKeyDown);
            boxEl.removeEventListener('click', onClick);
            guardTimer.remove(false);
            forceTimer.remove(false);
        };
    }

    showDialogueWithOptions(speaker, promptText, options, onChoiceCallback) {
        if (this.gameCompleted || this.ui.state === UI_STATES.DIALOGUE || this.ui.state === UI_STATES.MINIGAME) return;

        this.cleanupDialogueListeners();
        this.player.setVelocity(0, 0);

        const portraitEl = document.getElementById('dlg-portrait');
        const speakerEl = document.getElementById('dlg-speaker');
        const textEl = document.getElementById('dlg-text');
        const optionsEl = document.getElementById('dlg-options');
        const hintEl = document.getElementById('dlg-hint');
        const boxEl = document.getElementById('screen-dialogue');

        portraitEl.src = AssetGenerator.getDataUrl(this, this.getPortraitKey(speaker));
        speakerEl.textContent = speaker;
        textEl.textContent = promptText;
        optionsEl.innerHTML = '';
        optionsEl.classList.remove('is-hidden');
        hintEl.textContent = 'Escolha [1] ou [2]';

        this.ui.setState(UI_STATES.DIALOGUE);

        const openedAt = this.time.now;
        let optionSelected = false;
        let canFinalClose = false;
        let selectTime = 0;
        let guardTimer = null;
        let forceTimer = null;

        const selectOption = (chosen) => {
            if (optionSelected) return;
            optionSelected = true;
            selectTime = this.time.now;

            if (chosen.correct) audio.sfxInteract();
            else audio.sfxError();

            optionsEl.innerHTML = '';
            optionsEl.classList.add('is-hidden');
            textEl.textContent = chosen.response;
            hintEl.textContent = '[ESPAÇO] ou [E] Fechar';

            guardTimer = this.time.delayedCall(160, () => {
                if (this.keys.SPACE.isUp && this.keys.E.isUp) canFinalClose = true;
            });
            forceTimer = this.time.delayedCall(240, () => { canFinalClose = true; });
        };

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dlg-option-btn';
            btn.innerHTML = `<span class="dlg-opt-key">${idx + 1}</span><span>${opt.text.replace(/^\d+\.\s*/, '')}</span>`;
            btn.onclick = (ev) => {
                ev.stopPropagation();
                selectOption(opt);
            };
            optionsEl.appendChild(btn);
        });

        let selectedOptionRef = null;
        const wrappedSelect = (chosen) => {
            selectedOptionRef = chosen;
            selectOption(chosen);
        };

        // Rebind click para capturar referência da opção escolhida
        Array.from(optionsEl.children).forEach((btn, idx) => {
            btn.onclick = (ev) => {
                ev.stopPropagation();
                wrappedSelect(options[idx]);
            };
        });

        const finishAndCallback = () => {
            this.closeDialogue(UI_STATES.PLAYING);
            if (selectedOptionRef && onChoiceCallback) {
                onChoiceCallback(selectedOptionRef);
            }
        };

        const onKeyDown = (e) => {
            if (e.repeat) return;
            if (!optionSelected) {
                if (this.time.now - openedAt < 100) return;
                if (e.key === '1' && options[0]) {
                    e.preventDefault();
                    wrappedSelect(options[0]);
                } else if (e.key === '2' && options[1]) {
                    e.preventDefault();
                    wrappedSelect(options[1]);
                }
            } else {
                if (e.code === 'Space' || e.code === 'KeyE') {
                    e.preventDefault();
                    if (!canFinalClose && (this.time.now - selectTime > 160)) canFinalClose = true;
                    if (canFinalClose) finishAndCallback();
                }
            }
        };

        const onBoxClick = () => {
            if (optionSelected && this.time.now - selectTime > 120) {
                finishAndCallback();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        boxEl.addEventListener('click', onBoxClick);

        this.dialogueCleanup = () => {
            window.removeEventListener('keydown', onKeyDown);
            boxEl.removeEventListener('click', onBoxClick);
            if (guardTimer) guardTimer.remove(false);
            if (forceTimer) forceTimer.remove(false);
        };
    }

    // --- TRATAMENTO DOS CUIDADOS DAS MISSÕES ---

    handleDenguePot() {
        if (this.missions.dengue.pot) return;
        this.missions.dengue.pot = true;
        this.objPot.setTexture('pot-clean');
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Esvaziei a água acumulada e preenchi o pratinho com areia grossa até as bordas. Menos um criadouro para o mosquito!'
        );
        this.updateMissionProgress('dengue', 1);
    }

    handleDengueTires() {
        if (this.missions.dengue.tires) return;
        this.missions.dengue.tires = true;
        this.objTires.setTexture('tires-clean');
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Virei as garrafas com o gargalo para baixo e retirei os pneus que acumulavam água de chuva para encaminhamento aos serviços ambientais.'
        );
        this.updateMissionProgress('dengue', 1);
    }

    handleDengueTank() {
        if (this.missions.dengue.tank) return;
        this.missions.dengue.tank = true;
        this.objTank.setTexture('tank-capped');
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Caixa d’água tampada e vedada com segurança! Reservatórios fechados protegem toda a vizinhança contra a dengue.'
        );
        this.updateMissionProgress('dengue', 1);
    }

    handleRuaDrain() {
        if (this.missions.rua.drain) return;
        this.missions.rua.drain = true;
        this.objDrain.setTexture('drain-clean');
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Removi com segurança as folhas e sacolas superficiais da grade, sem colocar as mãos na água contaminada. A água agora escoa!'
        );
        this.updateMissionProgress('rua', 1);
    }

    handleRuaFlood() {
        if (this.missions.rua.barricade) return;
        this.missions.rua.barricade = true;
        this.objFlood.setTexture('flood-barricade');
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Posicionei cones e cavaletes reflexivos delimitando rota alternativa segura. Evitar contato com enchentes previne leptospirose e acidentes!'
        );
        this.updateMissionProgress('rua', 1);
    }

    handleAntonioRelief() {
        if (this.missions.calor.antonio) return;
        this.missions.calor.antonio = true;
        audio.sfxInteract();
        this.parasolAntonio = this.add.image(1060, 920, 'parasol').setDepth(928);
        this.updateMissionProgress('calor', 1);
        if (!this.gameCompleted) {
            this.showDialogue(
                'Seu Antônio',
                'Muito obrigado, meu filho! Essa sombra com o guarda-sol e essa água fresquinha me salvaram da tontura. Calor assim é perigoso!'
            );
        }
    }

    handleCalorCooling() {
        if (this.missions.calor.cooling) return;
        this.missions.calor.cooling = true;
        this.objFountain.setTexture('fountain-on');
        this.coolingTent = this.add.image(1320, 800, 'cooling-tent').setDepth(808);
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Tenda comunitária erguida e bebedouro higienizado em funcionamento! O bairro agora conta com um Ponto de Resfriamento essencial.'
        );
        this.updateMissionProgress('calor', 1);
    }

    handleMoradorLixoDialogue() {
        if (this.missions.lixo.flagrante) {
            this.showDialogue('Morador', 'Obrigado pela orientação! Agora sei o dia certo da coleta e coloco na lixeira suspensa.');
            return;
        }

        this.showDialogueWithOptions(
            'Morador da Praça',
            'Vou deixar esse saco de lixo aqui no chão mesmo, já tem outros sacos...',
            [
                {
                    text: '1. "A coleta passa amanhã de manhã. Deixe o saco na lixeira suspensa para não atrair animais."',
                    correct: true,
                    response: 'Você tem razão! Deixar no chão rasga com os cachorros e atrai vetores. Vou colocar na lixeira suspensa.'
                },
                {
                    text: '2. "Deixa que eu recolho sozinho e jogo em qualquer terreno."',
                    correct: false,
                    response: 'Jogar em terreno baldio gera focos de doença! Precisamos do descarte correto.'
                }
            ],
            (selected) => {
                if (selected.correct) {
                    this.missions.lixo.flagrante = true;
                    this.objTrash.setTexture('trash-clean');
                    this.updateMissionProgress('lixo', 1);
                }
            }
        );
    }

    openSortingMinigame() {
        if (this.missions.lixo.sorting) {
            this.showDialogue('Agente Comunitário', 'A coleta seletiva e a composteira comunitária já estão organizadas e em pleno funcionamento!');
            return;
        }
        // Fechar qualquer diálogo residual antes do minigame
        this.closeDialogue(null);
        this.activeMinigame = new SortingMinigame(this, () => {
            this.activeMinigame = null;
            this.missions.lixo.sorting = true;
            this.dialogueCooldownUntil = this.time.now + 250;
            this.dialogueKeyReleased = false;
            this.ui.setState(UI_STATES.PLAYING);
            this.updateMissionProgress('lixo', 1);

            if (!this.gameCompleted) {
                this.showDialogue(
                    'Agente Comunitário',
                    'Triagem concluída com sucesso! Papel, plástico e vidro direcionados para reciclagem, e cascas para a composteira.'
                );
            }
        });
    }

    handleNPCInteraction(id) {
        if (id === 'coordenadora') {
            const pending = 4 - (
                (this.missions.dengue.done ? 1 : 0) +
                (this.missions.rua.done ? 1 : 0) +
                (this.missions.calor.done ? 1 : 0) +
                (this.missions.lixo.done ? 1 : 0)
            );
            if (pending === 0) {
                this.showDialogue('Coordenadora', 'Sensacional! Todas as quatro frentes foram cuidadas com maestria!');
            } else {
                this.showDialogue(
                    'Coordenadora',
                    `Ainda temos ${pending} frente(s) prioritária(s) precisando de cuidado na Vila Esperança. Acompanhe o rastreador e siga firme!`
                );
            }
        } else if (id === 'antonio') {
            if (!this.missions.calor.antonio) {
                this.showDialogueWithOptions(
                    'Seu Antônio',
                    'Estou aqui nesse banco descansando, mas o sol do meio-dia está muito forte... minha boca está até seca e a cabeça rodando.',
                    [
                        {
                            text: '1. "Seu Antônio, abra este guarda-sol para fazer sombra, beba esta água fresca e descanse."',
                            correct: true,
                            response: 'Ah, que alívio! Muito obrigado por cuidar de nós idosos.'
                        },
                        {
                            text: '2. "Continue no sol forte, já vai passar."',
                            correct: false,
                            response: 'Calor extremo em pessoas vulneráveis pode causar choque térmico e desidratação grave!'
                        }
                    ],
                    (opt) => {
                        if (opt.correct) this.handleAntonioRelief();
                    }
                );
            } else {
                this.showDialogue('Seu Antônio', 'Graças a você estou hidratado e na sombra fresca!');
            }
        } else if (id === 'joao') {
            if (!this.missions.dengue.tank) {
                this.showDialogue(
                    'João',
                    'Olá, Agente! Notei que a caixa d’água ali nos fundos das casas está completamente aberta. A água da chuva está caindo direto lá, precisamos tampar!'
                );
            } else {
                this.showDialogue('João', 'Muito bem! A caixa d’água bem tampada protege toda a vizinhança.');
            }
        } else if (id === 'morador') {
            this.handleMoradorLixoDialogue();
        }
    }

    updateMissionProgress(missionKey, inc) {
        const m = this.missions[missionKey];
        m.count += inc;

        this.ui.updateMissions(this.missions);
        this.updateCompass();

        const titles = {
            dengue: 'Operação Dengue Concluída',
            rua: 'Rua Alagada Concluída',
            calor: 'Calor Extremo Concluído',
            lixo: 'Bairro Limpo Concluído'
        };

        if (m.count >= m.target && !m.done) {
            m.done = true;
            audio.sfxComplete();
            const pts = missionKey === 'lixo' ? 150 : 100;
            this.score += pts;
            this.ui.updateScore(this.score);
            this.ui.updateMissions(this.missions);
            this.ui.showToast(titles[missionKey], pts);
        }

        if (this.missions.dengue.done && this.missions.rua.done && this.missions.calor.done && this.missions.lixo.done) {
            this.triggerCinematicVictory();
        }
    }

    getSummaryStats() {
        const completedMissions =
            (this.missions.dengue.done ? 1 : 0) +
            (this.missions.rua.done ? 1 : 0) +
            (this.missions.calor.done ? 1 : 0) +
            (this.missions.lixo.done ? 1 : 0);

        const caresCount =
            this.missions.dengue.count +
            this.missions.rua.count +
            this.missions.calor.count +
            this.missions.lixo.count;

        return {
            score: this.score,
            timeLeft: this.timeLeft,
            completedMissions,
            caresCount
        };
    }

    tickTimer() {
        if (this.gameCompleted || !this.ui || this.ui.state !== UI_STATES.PLAYING) return;

        this.timeLeft--;
        this.ui.updateTimer(this.timeLeft);

        if (this.timeLeft <= 0) {
            if (this.timeEvent) this.timeEvent.remove(false);
            this.triggerGameOver();
        }
    }

    // ENCERRAMENTO CINEMATOGRÁFICO DE VITÓRIA (SEM SOBREPOSIÇÃO)
    triggerCinematicVictory() {
        if (this.gameCompleted) return;
        this.gameCompleted = true;

        // 1. Parar cronômetro
        if (this.timeEvent) this.timeEvent.remove(false);

        // 2. Finalizar qualquer diálogo ou minigame e ocultar todo o HUD
        this.closeDialogue(null);
        if (this.activeMinigame) {
            this.activeMinigame.destroy();
            this.activeMinigame = null;
        }
        this.ui.hideAllOverlays();
        this.ui.clearToasts();

        // 3. Bloquear movimentação do jogador
        this.player.setVelocity(0, 0);
        audio.sfxFanfare();

        // 4. Animação curta de celebração na Praça da Esperança
        this.cameras.main.stopFollow();
        this.cameras.main.pan(1200, 880, 1400, 'Power2');

        this.tweens.add({
            targets: [this.flowerBed1, this.flowerBed2],
            scaleX: 1.3,
            scaleY: 1.3,
            yoyo: true,
            repeat: 4,
            duration: 280
        });

        this.tweens.add({ targets: this.npcCoord, x: 1180, y: 860, duration: 1100 });
        this.tweens.add({ targets: this.npcAntonio, x: 1140, y: 880, duration: 1100 });
        this.tweens.add({ targets: this.npcJoao, x: 1220, y: 860, duration: 1100 });
        this.tweens.add({ targets: this.npcMorador, x: 1250, y: 880, duration: 1100 });

        // 5. Abrir tela de vitória exclusiva e limpa
        this.time.delayedCall(1800, () => {
            this.ui.setState(UI_STATES.VICTORY, this.getSummaryStats());
        });
    }

    triggerGameOver() {
        if (this.gameCompleted) return;
        this.gameCompleted = true;

        this.closeDialogue(null);
        if (this.activeMinigame) {
            this.activeMinigame.destroy();
            this.activeMinigame = null;
        }
        this.player.setVelocity(0, 0);
        this.ui.clearToasts();
        this.ui.setState(UI_STATES.GAME_OVER, this.getSummaryStats());
    }
}
