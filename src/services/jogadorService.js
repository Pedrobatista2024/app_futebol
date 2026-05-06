import { db } from './database';

export const JogadorService = {
    // ==========================================
    // PARTE 1: GERENCIAMENTO DE JOGADORES (CRUD)
    // ==========================================

    // CREATE
    create: (nome, posicao) => {
        try {
            db.runSync(
                'INSERT INTO jogadores (nome, posicao) VALUES (?, ?)',
                [nome, posicao]
            );
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao salvar:", error);
            return false;
        }
    },

    // READ
    findAll: () => {
        try {
            return db.getAllSync('SELECT * FROM jogadores ORDER BY nome ASC');
        } catch (error) {
            console.error("❌ [Service] Erro ao buscar:", error);
            return [];
        }
    },

    // UPDATE: Toggle do Check-in
    togglePresente: (id, statusAtual) => {
        try {
            const novoStatus = statusAtual === 1 ? 0 : 1;
            db.runSync('UPDATE jogadores SET presente = ? WHERE id = ?', [novoStatus, id]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro no check-in:", error);
            return false;
        }
    },

    // UPDATE: Atualizar nome e posição
    update: (id, nome, posicao) => {
        try {
            db.runSync(
                'UPDATE jogadores SET nome = ?, posicao = ? WHERE id = ?',
                [nome, posicao, id]
            );
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao atualizar:", error);
            return false;
        }
    },

    // DELETE: Apagar um jogador
    delete: (id) => {
        try {
            db.runSync('DELETE FROM jogadores WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao deletar:", error);
            return false;
        }
    },

    // ==========================================
    // PARTE 2: LÓGICA E MOTOR DO SORTEIO
    // ==========================================

    // Busca a configuração salva no banco (Qtd Jogadores e Chave do Goleiro)
    getConfig: () => {
        try {
            return db.getFirstSync('SELECT * FROM configuracao WHERE id = 1');
        } catch (error) {
            return { jogadores_por_time: 5, conta_goleiro: 1 }; // Padrão se der erro
        }
    },

    // Salva a configuração vinda da tela de "Configurar Estrutura"
    saveConfig: (qtd, goleiro) => {
        try {
            db.runSync('UPDATE configuracao SET jogadores_por_time = ?, conta_goleiro = ? WHERE id = 1', [qtd, goleiro ? 1 : 0]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao salvar config:", error);
            return false;
        }
    },

    // A MÁGICA: Executa o Sorteio
    executarSorteio: () => {
        try {
            const config = db.getFirstSync('SELECT * FROM configuracao WHERE id = 1');
            const presentes = db.getAllSync('SELECT * FROM jogadores WHERE presente = 1');
            
            // 1. Limpa os times antigos (Todo mundo fica sem time)
            db.runSync('UPDATE jogadores SET time_id = 0');

            // 2. Separa a galera por posição e EMBARALHA a ordem (Sorteio Aleatório)
            const linha = presentes.filter(j => j.posicao === 'Jogador').sort(() => Math.random() - 0.5);
            const goleiros = presentes.filter(j => j.posicao === 'Goleiro').sort(() => Math.random() - 0.5);

            // 3. Calcula quantos times teremos baseado APENAS na quantidade da linha
            const numTimes = linha.length > 0 ? Math.ceil(linha.length / config.jogadores_por_time) : 0;

            if (numTimes === 0) return false;

            // 4. Distribui os Goleiros (Se o ADM decidiu que eles entram no sorteio)
            if (config.conta_goleiro === 1) {
                goleiros.forEach((g, index) => {
                    // Pega 1 goleiro para cada time. Se sobrar goleiro, fica sem time por enquanto.
                    if (index < numTimes) {
                        db.runSync('UPDATE jogadores SET time_id = ? WHERE id = ?', [index + 1, g.id]);
                    }
                });
            }

            // 5. Distribui os Jogadores de Linha
            let timeAtual = 1;
            let vagasNoTime = 0;

            linha.forEach((j) => {
                db.runSync('UPDATE jogadores SET time_id = ? WHERE id = ?', [timeAtual, j.id]);
                vagasNoTime++;
                
                // Se o time encheu a cota da linha, passa para o próximo time
                if (vagasNoTime >= config.jogadores_por_time) {
                    timeAtual++;
                    vagasNoTime = 0;
                }
            });

            return true;
        } catch (e) { 
            console.error("❌ [Service] Erro no Sorteio:", e); 
            return false; 
        }
    },

    // Busca apenas os jogadores de um time específico (1, 2, 3, etc)
    getJogadoresPorTime: (timeId) => {
        try {
            return db.getAllSync('SELECT * FROM jogadores WHERE time_id = ?', [timeId]);
        } catch (e) { return []; }
    },

    // Coloca o jogador atrasado/inativo diretamente na vaga fantasma do time
    vincularJogadorAoTime: (jogadorId, timeId) => {
        try {
            // Se ele foi vinculado, ele automaticamente está "presente" no racha
            db.runSync('UPDATE jogadores SET time_id = ?, presente = 1 WHERE id = ?', [timeId, jogadorId]);
            return true;
        } catch (e) { return false; }
    },
    adicionarVagaReservaGlobal: () => {
        try {
            const config = db.getFirstSync('SELECT * FROM configuracao WHERE id = 1');
            const novaQtd = config.jogadores_por_time + 1;
            db.runSync('UPDATE configuracao SET jogadores_por_time = ? WHERE id = 1', [novaQtd]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao adicionar vaga extra:", error);
            return false;
        }
    }
};