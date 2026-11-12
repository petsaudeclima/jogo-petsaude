/**
 * CENA PRINCIPAL: VILA ESPERANÇA (MAPA EXPANDIDO 2400 x 1800)
 */
class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    preload() {
        AssetGenerator.create(this);
    }

    create() {
        this.score = 0;
        this.timeLeft = 300; // 5 minutos (300 segundos)
        this.isDialogueActive = false;
        this.activeDialogue = null;
        this.dialogueKeyReleased = true;
        this.dialogueCooldownUntil = 0;
        this.isMinigameActive = false;
        this.gameCompleted = false;

        // Dimensões do Novo Mundo Expandido
        this.WORLD_WIDTH = 2400;
        this.WORLD_HEIGHT = 1800;

        // Estado dos 9 cuidados
        this.missions = {
            dengue: { pot: false, tires: false, tank: false, count: 0, target: 3, done: false },
            rua: { drain: false, barricade: false, count: 0, target: 2, done: false },
            calor: { antonio: false, cooling: false, count: 0, target: 2, done: false },
            lixo: { flagrante: false, sorting: false, count: 0, target: 2, done: false }
        };

        // Configuração dos Limites Físicos do Mundo
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Montar Mapa Rico da Vila (2400x1800)
        this.createWorldMap();

        // Criar Jogador no coração da Praça da Esperança (1200, 920)
        this.player = this.physics.add.sprite(1200, 920, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(18, 14);
        this.player.body.setOffset(3, 18);

        // Colisões do Jogador com o Cenário
        this.physics.add.collider(this.player, this.colliders);

        // Câmera: Acompanhamento suave e limites
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Controles de Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SPACE,ONE,TWO,THREE,FOUR,ESC');

        // Inicializar NPCs e Objetos das Missões
        this.createNPCs();
        this.createInteractiveObjects();

        // Iniciar Cronômetro
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true
        });

        // Diálogo inicial da Coordenadora
        this.time.delayedCall(400, () => {
            this.showDialogue(
                'Coordenadora',
                'Bem-vindo à Vila Esperança! O nosso bairro precisa de cuidados urgentes hoje. Converse com os moradores e atue nas quatro frentes prioritárias antes que o tempo acabe. Siga a bússola no painel para se orientar pelo bairro!'
            );
        });

        this.interactionPrompt = document.getElementById('prompt-interaction');

        // Atualizar Bússola inicial
        this.updateCompass();
    }

    createWorldMap() {
        // Grupo de colisores estáticos
        this.colliders = this.physics.add.staticGroup();

        // 1. CHÃO GERAL (Grama de base cobrindo 2400x1800)
        this.add.tileSprite(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'tile-grass').setDepth(0);

        // 2. REDE DE RUAS E CAMINHOS PAVIMENTADOS (Depth 1)

        // Rua Principal Asfaltada (Leste - X: 2020)
        this.add.tileSprite(2020, this.WORLD_HEIGHT / 2, 128, this.WORLD_HEIGHT, 'tile-road').setDepth(1);
        // Calçadas da Rua Principal
        this.add.tileSprite(1936, this.WORLD_HEIGHT / 2, 40, this.WORLD_HEIGHT, 'tile-path').setDepth(1);
        this.add.tileSprite(2104, this.WORLD_HEIGHT / 2, 40, this.WORLD_HEIGHT, 'tile-path').setDepth(1);

        // Praça da Esperança (Centro - X: 920..1480, Y: 720..1080)
        this.add.tileSprite(1200, 900, 560, 360, 'tile-path').setDepth(1);

        // Via Residencial Norte (X: 750..1650, Y: 390)
        this.add.tileSprite(1200, 390, 900, 64, 'tile-path').setDepth(1);
        // Conexão Praça ao Norte Residencial
        this.add.tileSprite(1200, 560, 64, 340, 'tile-path').setDepth(1);

        // Via de Acesso Sul / Entrada da Comunidade (X: 1200, Y: 1080..1750)
        this.add.tileSprite(1200, 1400, 72, 640, 'tile-path').setDepth(1);

        // Conexão Praça à Rua Principal Leste (X: 1480..1936, Y: 900)
        this.add.tileSprite(1710, 900, 460, 64, 'tile-path').setDepth(1);

        // Trilha de Terra para Área Ambiental Oeste (X: 450..920, Y: 900)
        this.add.tileSprite(685, 900, 470, 64, 'tile-dirt').setDepth(1);
        // Pátio ecológico de compostagem e triagem (X: 440, Y: 860)
        this.add.tileSprite(450, 860, 420, 320, 'tile-dirt').setDepth(1);

        // 3. CONSTRUÇÃO E MOBILIÁRIO DAS 5 REGIÕES

        // --- REGIÃO 1: PRAÇA DA ESPERANÇA (CENTRO) ---
        // Canteiros e jardins centrais (Depth 5)
        this.flowerBed1 = this.add.image(1150, 860, 'flowers-clean').setDepth(5);
        this.flowerBed2 = this.add.image(1250, 860, 'flowers-clean').setDepth(5);
        this.add.image(1200, 960, 'flowers-clean').setDepth(5);

        // Bancos da Praça
        this.addBench(1060, 940); // Banco do Seu Antônio
        this.addBench(1340, 940);
        this.addBench(1130, 1020);
        this.addBench(1270, 1020);

        // Postes de Iluminação Colonial
        this.addLamp(960, 760);
        this.addLamp(1440, 760);
        this.addLamp(960, 1040);
        this.addLamp(1440, 1040);

        // Árvores Frondosas da Praça
        this.addTree(980, 800);
        this.addTree(1420, 800);
        this.addTree(980, 980);
        this.addTree(1420, 980);
        this.addTree(1200, 720);

        // Arbustos e Flores Silvestres
        this.addBush(1020, 870);
        this.addBush(1380, 870);
        this.addWildFlowers(1100, 830);
        this.addWildFlowers(1300, 830);

        // --- REGIÃO 2: BAIRRO RESIDENCIAL (NORTE) ---
        // Casas Coloniais
        this.addHouse(780, 320, 'house-blue');
        this.addHouse(920, 320, 'house-yellow');
        this.addHouse(1060, 320, 'house-green'); // Próximo a João
        this.addHouse(1340, 320, 'house-yellow'); // Próximo ao vaso
        this.addHouse(1480, 320, 'house-red');    // Quintal da caixa d'água
        this.addHouse(1620, 320, 'house-blue');

        // Cercas dos quintais norte
        for (let x = 740; x <= 1660; x += 32) {
            if (x < 1170 || x > 1230) {
                this.addFenceH(x, 260);
            }
        }
        this.addFenceV(730, 290);
        this.addFenceV(1670, 290);

        // Árvores e jardins do Bairro Residencial
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
        // Composteira Comunitária
        const compost = this.add.image(440, 750, 'compost-bin');
        compost.setDepth(750 + 10);
        const compostBody = this.colliders.create(440, 756, null);
        compostBody.setSize(30, 18).setVisible(false);

        // Vegetação densa e pedras da Área Ambiental
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
        // Postes ao longo da calçada
        this.addLamp(1936, 300);
        this.addLamp(1936, 600);
        this.addLamp(1936, 900);
        this.addLamp(1936, 1200);
        this.addLamp(1936, 1500);

        // Casas e árvores leste
        this.addHouse(2180, 400, 'house-yellow');
        this.addHouse(2180, 700, 'house-green');
        this.addHouse(2180, 1300, 'house-red');
        this.addTree(1900, 450);
        this.addTree(1900, 750);
        this.addTree(1900, 1050);
        this.addTree(1900, 1350);

        // --- REGIÃO 5: ENTRADA DA COMUNIDADE (SUL) ---
        // Placa de Boas-Vindas
        const sign = this.add.image(1200, 1680, 'sign-welcome');
        sign.setDepth(1680 + 10);
        const signBody = this.colliders.create(1200, 1686, null);
        signBody.setSize(48, 16).setVisible(false);

        // Casas na entrada
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

    // Métodos utilitários de criação de elementos com profundidade (Y-depth) e colisão
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
        const b = this.add.image(x, y, 'bush');
        b.setDepth(y + 8);
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

        // Coordenadora (Praça da Esperança - Centro)
        this.npcCoord = this.add.sprite(1200, 820, 'npc-coordenadora');
        this.npcCoord.setDepth(820 + 12);
        this.npcs.push({ sprite: this.npcCoord, name: 'Coordenadora', id: 'coordenadora' });

        // Seu Antônio (Praça da Esperança - No banco sob o sol)
        this.npcAntonio = this.add.sprite(1060, 930, 'npc-antonio');
        this.npcAntonio.setDepth(930 + 12);
        this.npcs.push({ sprite: this.npcAntonio, name: 'Seu Antônio', id: 'antonio' });

        // João (Bairro Residencial Norte)
        this.npcJoao = this.add.sprite(1060, 370, 'npc-joao');
        this.npcJoao.setDepth(370 + 12);
        this.npcs.push({ sprite: this.npcJoao, name: 'João', id: 'joao' });

        // Morador do Lixo (Área Ambiental Oeste)
        this.npcMorador = this.add.sprite(480, 920, 'npc-morador');
        this.npcMorador.setDepth(920 + 12);
        this.npcs.push({ sprite: this.npcMorador, name: 'Morador', id: 'morador' });
    }

    createInteractiveObjects() {
        this.interactives = [];

        // MISSÃO 1: DENGUE
        // 1. Vaso de planta (Bairro Residencial Norte, próximo à casa amarela)
        this.objPot = this.add.sprite(1260, 370, 'pot-dirty');
        this.objPot.setDepth(370 + 10);
        this.interactives.push({
            sprite: this.objPot,
            id: 'dengue-pot',
            prompt: 'Tratar prato de planta',
            action: () => this.handleDenguePot()
        });

        // 2. Garrafas e pneus (Área Ambiental Oeste)
        this.objTires = this.add.sprite(580, 1040, 'tires-dirty');
        this.objTires.setDepth(1040 + 10);
        this.interactives.push({
            sprite: this.objTires,
            id: 'dengue-tires',
            prompt: 'Virar garrafas e recolher pneus',
            action: () => this.handleDengueTires()
        });

        // 3. Caixa d'água (Quintal residencial Norte)
        this.objTank = this.add.sprite(1480, 200, 'tank-open');
        this.objTank.setDepth(200 + 10);
        this.interactives.push({
            sprite: this.objTank,
            id: 'dengue-tank',
            prompt: 'Tampar caixa d’água',
            action: () => this.handleDengueTank()
        });

        // MISSÃO 2: RUA ALAGADA
        // 1. Bueiro obstruído (Rua Principal Leste)
        this.objDrain = this.add.sprite(1990, 600, 'drain-clogged');
        this.objDrain.setDepth(600 + 10);
        this.interactives.push({
            sprite: this.objDrain,
            id: 'rua-drain',
            prompt: 'Desobstruir bueiro com segurança',
            action: () => this.handleRuaDrain()
        });

        // 2. Sinalização de poça profunda (Rua Principal Leste)
        this.objFlood = this.add.sprite(2040, 1150, 'flood-danger');
        this.objFlood.setDepth(1150 + 10);
        this.interactives.push({
            sprite: this.objFlood,
            id: 'rua-flood',
            prompt: 'Sinalizar área alagada com cones',
            action: () => this.handleRuaFlood()
        });

        // MISSÃO 3: CALOR EXTREMO
        // 1. Apoio ao Seu Antônio (através de interação direta na Praça)
        // 2. Ponto de resfriamento (Bebedouro & Tenda na Praça)
        this.objFountain = this.add.sprite(1320, 840, 'fountain-off');
        this.objFountain.setDepth(840 + 10);
        this.interactives.push({
            sprite: this.objFountain,
            id: 'calor-cooling',
            prompt: 'Instalar tenda e ativar bebedouro',
            action: () => this.handleCalorCooling()
        });

        // MISSÃO 4: BAIRRO LIMPO
        // 1. Descarte inadequado / lixeira suspensa (Área Ambiental Oeste)
        this.objTrash = this.add.sprite(530, 920, 'trash-dump');
        this.objTrash.setDepth(920 + 10);

        // 2. Estação de coleta seletiva (Minigame)
        this.objRecycle = this.add.sprite(360, 820, 'bench');
        this.objRecycle.setDepth(820 + 8);
        this.recycleSign = this.add.text(330, 795, '♻️ COLETA', {
            font: '10px Courier',
            fill: '#ffffff',
            backgroundColor: '#2f855a',
            padding: { x: 3, y: 1 }
        }).setDepth(820 + 9);

        this.interactives.push({
            sprite: this.objRecycle,
            id: 'lixo-sorting',
            prompt: 'Triagem da Coleta Seletiva',
            action: () => this.openSortingMinigame()
        });
    }

    update() {
        // Depth-sorting do Jogador em tempo real (2.5D)
        this.player.setDepth(this.player.y + 12);

        // Se diálogo, minigame ou fim de jogo estiver ativo: congelar movimentação e ocultar prompt
        if (this.isDialogueActive || this.isMinigameActive || this.gameCompleted) {
            this.player.setVelocity(0, 0);
            if (this.interactionPrompt) this.interactionPrompt.style.display = 'none';
            return;
        }

        // Movimentação do Agente Comunitário (Velocidade fluida 190 para o mapa expandido)
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
            // Atualizar orientação na bússola ao andar
            this.updateCompass();
        }

        // --- SISTEMA DE PREVENÇÃO DE REABERTURA DE DIÁLOGO ---
        // Verifica se a tecla de fechar já foi solta pelo jogador
        if (!this.dialogueKeyReleased) {
            if (this.keys.SPACE.isUp && this.keys.E.isUp) {
                this.dialogueKeyReleased = true;
            } else {
                return; // Aguarda soltura obrigatória da tecla
            }
        }

        // Respeita período de cooldown curto para evitar acionamentos acidentais
        if (this.time.now < this.dialogueCooldownUntil) {
            return;
        }

        // Checagem de Proximidade para Interações
        let activePrompt = null;
        let closestAction = null;

        // Checar Objetos Interativos
        for (let item of this.interactives) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.sprite.x, item.sprite.y);
            if (dist < 46) {
                activePrompt = item.prompt;
                closestAction = item.action;
                break;
            }
        }

        // Checar NPCs
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
            this.interactionPrompt.innerText = `[E] ou [ESPAÇO] ${activePrompt}`;
            this.interactionPrompt.style.display = 'block';

            // Somente dispara quando houver um NOVO pressionamento intencional
            if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                closestAction();
            }
        } else {
            this.interactionPrompt.style.display = 'none';
        }
    }

    // --- BÚSSOLA DINÂMICA DE ORIENTAÇÃO (INDICADORES DE OBJETIVOS) ---
    updateCompass() {
        const px = this.player.x;
        const py = this.player.y;

        const getTargetInfo = (tx, ty) => {
            const dx = tx - px;
            const dy = ty - py;
            const dist = Math.round(Math.hypot(dx, dy) / 20); // metros aproximados
            let dir = '⊙ Aqui';
            if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
                if (dy < -60 && Math.abs(dx) <= 80) dir = '↑ Norte';
                else if (dy > 60 && Math.abs(dx) <= 80) dir = '↓ Sul';
                else if (dx > 60 && Math.abs(dy) <= 80) dir = '→ Leste';
                else if (dx < -60 && Math.abs(dy) <= 80) dir = '← Oeste';
                else if (dx > 0 && dy < 0) dir = '↗ Nordeste';
                else if (dx > 0 && dy > 0) dir = '↘ Sudeste';
                else if (dx < 0 && dy > 0) dir = '↙ Sudoeste';
                else if (dx < 0 && dy < 0) dir = '↖ Noroeste';
            }
            return `${dir} (${dist}m)`;
        };

        // 1. Dengue
        const elDengue = document.getElementById('dir-dengue');
        if (elDengue) {
            if (this.missions.dengue.done) {
                elDengue.innerHTML = '<span style="color: #68d391;">✓ Dengue: Concluída</span>';
            } else {
                let tx = 1260, ty = 370;
                if (this.missions.dengue.pot && !this.missions.dengue.tires) { tx = 580; ty = 1040; }
                else if (this.missions.dengue.pot && this.missions.dengue.tires) { tx = 1480; ty = 200; }
                elDengue.innerText = `🪣 Dengue: ${getTargetInfo(tx, ty)}`;
            }
        }

        // 2. Rua Alagada
        const elRua = document.getElementById('dir-rua');
        if (elRua) {
            if (this.missions.rua.done) {
                elRua.innerHTML = '<span style="color: #68d391;">✓ Rua: Concluída</span>';
            } else {
                let tx = 1990, ty = 600;
                if (this.missions.rua.drain) { tx = 2040; ty = 1150; }
                elRua.innerText = `🌊 Rua: ${getTargetInfo(tx, ty)}`;
            }
        }

        // 3. Calor Extremo
        const elCalor = document.getElementById('dir-calor');
        if (elCalor) {
            if (this.missions.calor.done) {
                elCalor.innerHTML = '<span style="color: #68d391;">✓ Calor: Concluída</span>';
            } else {
                let tx = 1060, ty = 930;
                if (this.missions.calor.antonio) { tx = 1320; ty = 840; }
                elCalor.innerText = `☀️ Calor: ${getTargetInfo(tx, ty)}`;
            }
        }

        // 4. Bairro Limpo
        const elLixo = document.getElementById('dir-lixo');
        if (elLixo) {
            if (this.missions.lixo.done) {
                elLixo.innerHTML = '<span style="color: #68d391;">✓ Lixo: Concluído</span>';
            } else {
                let tx = 480, ty = 920;
                if (this.missions.lixo.flagrante) { tx = 360; ty = 820; }
                elLixo.innerText = `♻️ Lixo: ${getTargetInfo(tx, ty)}`;
            }
        }
    }

    // --- SISTEMA ROBUSTO E DEFINITIVO DE DIÁLOGOS ---

    // Fecha o diálogo de maneira atômica e limpa
    closeDialogue() {
        if (this.activeDialogue) {
            this.activeDialogue.destroy();
            this.activeDialogue = null;
        }
        this.isDialogueActive = false;
        // Cooldown de 250ms e trava de tecla pressionada
        this.dialogueCooldownUntil = this.time.now + 250;
        this.dialogueKeyReleased = false;
    }

    // Exibe Diálogo Simples
    showDialogue(speaker, text) {
        if (this.isDialogueActive || this.activeDialogue) return;
        this.isDialogueActive = true;
        this.player.setVelocity(0, 0);
        if (this.interactionPrompt) this.interactionPrompt.style.display = 'none';

        const container = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.activeDialogue = container;

        const box = this.createDialogueBox();
        container.add(box);

        const txtSpeaker = this.add.text(480 - 270, 418, speaker, { font: 'bold 14px Courier', fill: '#e09f3e' });
        const txtBody = this.add.text(480 - 270, 440, text, { font: '13px Courier', fill: '#ffffff', wordWrap: { width: 540 } });
        const txtHint = this.add.text(480 + 260, 502, '[ESPAÇO] ou [E] Fechar', { font: '10px Courier', fill: '#a0aec0' }).setOrigin(1, 1);

        container.add([txtSpeaker, txtBody, txtHint]);

        // Caixa interativa com o mouse para fechar
        box.setInteractive(new Phaser.Geom.Rectangle(480 - 290, 400, 580, 115), Phaser.Geom.Rectangle.Contains);

        const openedAt = this.time.now;
        let canClose = false;

        // Limpeza de listeners ao encerrar
        const cleanup = () => {
            window.removeEventListener('keydown', keyListener);
        };

        const executeClose = () => {
            cleanup();
            this.closeDialogue();
        };

        box.on('pointerdown', () => {
            if (this.time.now - openedAt > 120) executeClose();
        });

        const keyListener = (event) => {
            if (event.code === 'Space' || event.code === 'KeyE') {
                if (!canClose && (this.time.now - openedAt > 150)) {
                    canClose = true;
                }
                if (canClose) {
                    executeClose();
                }
            }
        };

        // Permite fechar assim que a tecla que abriu for solta ou passar o período de guarda
        this.time.delayedCall(150, () => {
            if (this.keys.SPACE.isUp && this.keys.E.isUp) canClose = true;
        });
        this.time.delayedCall(220, () => { canClose = true; });

        window.addEventListener('keydown', keyListener);
    }

    // Exibe Diálogo com Escolhas Múltiplas (Opções Numeradas 1 e 2)
    showDialogueWithOptions(speaker, promptText, options, onChoiceCallback) {
        if (this.isDialogueActive || this.activeDialogue) return;
        this.isDialogueActive = true;
        this.player.setVelocity(0, 0);
        if (this.interactionPrompt) this.interactionPrompt.style.display = 'none';

        const container = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.activeDialogue = container;

        const box = this.createDialogueBox();
        container.add(box);

        const txtSpeaker = this.add.text(480 - 270, 408, speaker, { font: 'bold 14px Courier', fill: '#e09f3e' });
        const txtPrompt = this.add.text(480 - 270, 426, promptText, { font: '12px Courier', fill: '#cbd5e0', wordWrap: { width: 540 } });
        container.add([txtSpeaker, txtPrompt]);

        const optButtons = [];
        options.forEach((opt, idx) => {
            const optT = this.add.text(480 - 270, 456 + (idx * 24), opt.text, {
                font: 'bold 12px Courier',
                fill: '#f6e05e',
                backgroundColor: '#2d3748',
                padding: { x: 6, y: 2 }
            }).setInteractive({ useHandCursor: true });

            container.add(optT);
            optButtons.push({ element: optT, option: opt });
        });

        const openedAt = this.time.now;
        let optionSelected = false;

        const cleanup = () => {
            window.removeEventListener('keydown', keyListener);
        };

        const handleChoice = (chosen) => {
            if (optionSelected) return;
            optionSelected = true;

            // Remove botões de opção
            optButtons.forEach(b => b.element.destroy());

            // Toca efeito sonoro correspondente
            if (chosen.correct) audio.sfxInteract();
            else audio.sfxError();

            // Atualiza o texto na mesma caixa sem recriar listeners
            txtPrompt.setText(chosen.response).setColor('#ffffff');

            const txtCloseHint = this.add.text(480 + 260, 502, '[ESPAÇO] ou [E] Fechar', {
                font: '10px Courier', fill: '#ecc94b'
            }).setOrigin(1, 1);
            container.add(txtCloseHint);

            box.setInteractive(new Phaser.Geom.Rectangle(480 - 290, 400, 580, 115), Phaser.Geom.Rectangle.Contains);

            const selectTime = this.time.now;
            let canFinalClose = false;

            this.time.delayedCall(160, () => {
                if (this.keys.SPACE.isUp && this.keys.E.isUp) canFinalClose = true;
            });
            this.time.delayedCall(240, () => { canFinalClose = true; });

            box.on('pointerdown', () => {
                if (this.time.now - selectTime > 120) {
                    cleanup();
                    this.closeDialogue();
                    onChoiceCallback(chosen);
                }
            });

            const finalKeyListener = (e) => {
                if (e.code === 'Space' || e.code === 'KeyE') {
                    if (!canFinalClose && (this.time.now - selectTime > 180)) canFinalClose = true;
                    if (canFinalClose) {
                        window.removeEventListener('keydown', finalKeyListener);
                        cleanup();
                        this.closeDialogue();
                        onChoiceCallback(chosen);
                    }
                }
            };
            window.addEventListener('keydown', finalKeyListener);
        };

        // Suporte a clique direto nas opções
        optButtons.forEach(b => {
            b.element.on('pointerdown', () => handleChoice(b.option));
        });

        const keyListener = (e) => {
            if (optionSelected) return;
            if (this.time.now - openedAt < 100) return; // Evita propagação imediata

            if (e.key === '1' && options[0]) handleChoice(options[0]);
            else if (e.key === '2' && options[1]) handleChoice(options[1]);
        };

        window.addEventListener('keydown', keyListener);
    }

    createDialogueBox() {
        const g = this.add.graphics();
        g.fillStyle(0x181c24, 0.96);
        g.fillRect(480 - 290, 400, 580, 115);
        g.lineStyle(2, 0xb8ae9c, 1);
        g.strokeRect(480 - 290, 400, 580, 115);
        return g;
    }

    // --- TRATAMENTO DOS CUIDADOS DAS MISSÕES ---

    // Missão 1 - Cuidado 1: Vaso
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

    // Missão 1 - Cuidado 2: Pneus e Garrafas
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

    // Missão 1 - Cuidado 3: Caixa d'água
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

    // Missão 2 - Cuidado 1: Bueiro
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

    // Missão 2 - Cuidado 2: Sinalização de Risco
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

    // Missão 3 - Cuidado 1: Seu Antônio
    handleAntonioRelief() {
        if (this.missions.calor.antonio) return;
        this.missions.calor.antonio = true;
        audio.sfxInteract();
        // Instalar guarda-sol sobre o banco do Seu Antônio
        this.parasolAntonio = this.add.image(1060, 920, 'parasol').setDepth(920 + 8);
        this.showDialogue(
            'Seu Antônio',
            'Muito obrigado, meu filho! Essa sombra com o guarda-sol e essa água fresquinha me salvaram da tontura. Calor assim é perigoso!'
        );
        this.updateMissionProgress('calor', 1);
    }

    // Missão 3 - Cuidado 2: Ponto de Resfriamento
    handleCalorCooling() {
        if (this.missions.calor.cooling) return;
        this.missions.calor.cooling = true;
        this.objFountain.setTexture('fountain-on');
        this.coolingTent = this.add.image(1320, 800, 'cooling-tent').setDepth(800 + 8);
        audio.sfxInteract();
        this.showDialogue(
            'Agente Comunitário',
            'Tenda comunitária erguida e bebedouro higienizado em funcionamento! O bairro agora conta com um Ponto de Resfriamento essencial.'
        );
        this.updateMissionProgress('calor', 1);
    }

    // Missão 4 - Cuidado 1: Flagrante de Lixo (Diálogo com Escolha)
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

    // Missão 4 - Cuidado 2: Minigame de Triagem
    openSortingMinigame() {
        if (this.missions.lixo.sorting) {
            this.showDialogue('Agente Comunitário', 'A coleta seletiva e a composteira comunitária já estão organizadas e em pleno funcionamento!');
            return;
        }
        this.isMinigameActive = true;
        new SortingMinigame(this, () => {
            this.isMinigameActive = false;
            this.missions.lixo.sorting = true;
            audio.sfxComplete();
            this.showDialogue(
                'Agente Comunitário',
                'Triagem concluída com sucesso! Papel, plástico e vidro direcionados para reciclagem, e cascas para a composteira.'
            );
            this.updateMissionProgress('lixo', 1);
        });
    }

    // Interações de Diálogo com NPCs
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
                    `Ainda temos ${pending} frente(s) prioritária(s) precisando de cuidado na Vila Esperança. Acompanhe as orientações na bússola e siga firme!`
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

    // Atualização dos Contadores e Pontuação (Exatos 450 Pontos)
    updateMissionProgress(missionKey, inc) {
        const m = this.missions[missionKey];
        m.count += inc;

        // Atualizar UI HTML
        document.getElementById('m-dengue').innerText = `🪣 Operação Dengue: ${this.missions.dengue.count}/3`;
        document.getElementById('m-rua').innerText = `🌊 Rua Alagada: ${this.missions.rua.count}/2`;
        document.getElementById('m-calor').innerText = `☀️ Calor Extremo: ${this.missions.calor.count}/2`;
        document.getElementById('m-lixo').innerText = `♻️ Bairro Limpo: ${this.missions.lixo.count}/2`;

        this.updateCompass();

        // Checar conclusão da missão específica
        if (m.count >= m.target && !m.done) {
            m.done = true;
            audio.sfxComplete();
            let pts = 100;
            if (missionKey === 'lixo') pts = 150; // Missão 4 vale 150 pts conforme roteiro
            this.score += pts;
            document.getElementById('hud-score').innerText = `PONTOS: ${this.score} / 450`;

            const toast = this.add.text(
                480, 160,
                `✓ ${missionKey.toUpperCase()} CONCLUÍDA! (+${pts} pts)`,
                { font: '16px Courier', fill: '#ecc94b', backgroundColor: '#1a202c', padding: { x: 10, y: 5 } }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(2500);

            this.tweens.add({
                targets: toast,
                y: 130,
                alpha: 0,
                duration: 2500,
                onComplete: () => toast.destroy()
            });

            this.updateCompass();
        }

        // Checar Vitória Total (4/4 Missões = 450 Pontos)
        if (this.missions.dengue.done && this.missions.rua.done && this.missions.calor.done && this.missions.lixo.done) {
            this.triggerCinematicVictory();
        }
    }

    tickTimer() {
        if (this.gameCompleted || this.isDialogueActive || this.isMinigameActive) return;

        this.timeLeft--;
        const min = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const sec = (this.timeLeft % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('hud-timer');
        if (timerEl) {
            timerEl.innerText = `TEMPO: ${min}:${sec}`;
            if (this.timeLeft <= 30) {
                timerEl.classList.add('timer-warn');
            }
        }

        if (this.timeLeft <= 0) {
            this.timeEvent.remove();
            this.triggerGameOver();
        }
    }

    // ENCERRAMENTO CINEMATOGRÁFICO DE VITÓRIA
    triggerCinematicVictory() {
        this.gameCompleted = true;
        if (this.timeEvent) this.timeEvent.remove();
        audio.sfxFanfare();

        // Centralizar câmera na Praça da Esperança (1200, 880)
        this.cameras.main.stopFollow();
        this.cameras.main.pan(1200, 880, 1500, 'Power2');

        // Iluminação festiva e flores florescendo
        this.tweens.add({
            targets: [this.flowerBed1, this.flowerBed2],
            scaleX: 1.3,
            scaleY: 1.3,
            yoyo: true,
            repeat: 5,
            duration: 300
        });

        // Reunião dos moradores celebrando na Praça
        this.tweens.add({ targets: this.npcCoord, x: 1180, y: 860, duration: 1200 });
        this.tweens.add({ targets: this.npcAntonio, x: 1140, y: 880, duration: 1200 });
        this.tweens.add({ targets: this.npcJoao, x: 1220, y: 860, duration: 1200 });
        this.tweens.add({ targets: this.npcMorador, x: 1250, y: 880, duration: 1200 });

        this.time.delayedCall(2000, () => {
            // Tela Final de Celebração
            const bg = this.add.graphics().setScrollFactor(0).setDepth(3000);
            bg.fillStyle(0x000000, 0.88);
            bg.fillRect(0, 0, 960, 540);

            this.add.text(480, 100, 'PARABÉNS! 🌟', {
                font: 'bold 32px Courier', fill: '#ecc94b'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            const msg = "Missão Cumprida! Graças à sua vigilância e cuidado comunitário, a Vila Esperança agora é um bairro saudável, sustentável e seguro para todos!";
            this.add.text(480, 180, msg, {
                font: '16px Courier', fill: '#ffffff', align: 'center', wordWrap: { width: 680 }
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            const minutesLeft = Math.floor(this.timeLeft / 60);
            const secondsLeft = (this.timeLeft % 60).toString().padStart(2, '0');

            this.add.text(480, 270,
                `• Missões Concluídas: 4/4\n• Pontuação Final: ${this.score} / 450 pts\n• Tempo Restante: ${minutesLeft}:${secondsLeft}\n• 9 Cuidados Preventivos Atuados`,
                { font: '15px Courier', fill: '#68d391', lineSpacing: 8 }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            // Botão Jogar Novamente
            const btn = this.add.text(480, 390, '🔄 JOGAR NOVAMENTE', {
                font: 'bold 16px Courier',
                fill: '#121417',
                backgroundColor: '#e09f3e',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(3001);

            btn.on('pointerdown', () => {
                window.location.reload();
            });
        });
    }

    triggerGameOver() {
        const bg = this.add.graphics().setScrollFactor(0).setDepth(3000);
        bg.fillStyle(0x000000, 0.92);
        bg.fillRect(0, 0, 960, 540);

        this.add.text(480, 180, 'TEMPO ESGOTADO NA VILA ESPERANÇA', {
            font: 'bold 24px Courier', fill: '#ff4757'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

        this.add.text(480, 240, `Você completou cuidados parciais e somou ${this.score} pontos.\nNão desista, a prevenção em saúde é um aprendizado contínuo!`, {
            font: '15px Courier', fill: '#ffffff', align: 'center', lineSpacing: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

        const btn = this.add.text(480, 340, 'TENTAR NOVAMENTE', {
            font: 'bold 16px Courier',
            fill: '#ffffff',
            backgroundColor: '#2b6cb0',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(3001);

        btn.on('pointerdown', () => window.location.reload());
    }
}
