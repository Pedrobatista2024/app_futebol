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

    // Salva as regras de tempo e gols da partida
    saveRegrasPartida: (tempo, gols) => {
        try {
            db.runSync('UPDATE configuracao SET tempo_partida = ?, gols_partida = ? WHERE id = 1', [tempo, gols]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao salvar regras:", error);
            return false;
        }
    },

    // NOVO: Verifica se já existe um sorteio realizado (resolve o erro de undefined)
    verificarSorteioRealizado: () => {
        try {
            const resultado = db.getFirstSync('SELECT COUNT(*) as total FROM jogadores WHERE time_id > 0');
            return resultado.total > 0;
        } catch (e) {
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

    // Busca apenas os jogadores de um time específico
    getJogadoresPorTime: (timeId) => {
        try {
            return db.getAllSync('SELECT * FROM jogadores WHERE time_id = ?', [timeId]);
        } catch (e) { return []; }
    },

    // Coloca o jogador atrasado/inativo diretamente na vaga fantasma do time
    vincularJogadorAoTime: (jogadorId, timeId) => {
        try {
            db.runSync('UPDATE jogadores SET time_id = ?, presente = 1 WHERE id = ?', [timeId, jogadorId]);
            return true;
        } catch (e) { return false; }
    },

    // Adiciona +1 vaga global para todos os times
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
    },

    getFilaTimes: () => {
        try {
            const resultado = db.getAllSync('SELECT DISTINCT time_id FROM jogadores WHERE time_id > 0 ORDER BY time_id ASC');
            return resultado.map(r => r.time_id);
        } catch (e) { return []; }
    },

    // Salva o resultado de uma partida no histórico (opcional para o ranking depois)
    salvarResultadoPartida: (timeA, golsA, timeB, golsB) => {
        try {
            db.runSync('INSERT INTO partidas (time_a, gols_a, time_b, gols_b, data) VALUES (?, ?, ?, ?, ?)', 
            [timeA, golsA, timeB, golsB, new Date().toISOString()]);
            return true;
        } catch (e) { return false; }
    },

    encerrarPartidaCompleto: (dadosPartida, estatisticasA, estatisticasB) => {
        try {
            // 1. Insere a partida
            const { time_a_id, time_b_id, gols_a, gols_b } = dadosPartida;
            let vencedor_id = 0;
            if (gols_a > gols_b) vencedor_id = time_a_id;
            else if (gols_b > gols_a) vencedor_id = time_b_id;

            db.runSync(
                'INSERT INTO partidas (time_a_id, time_b_id, gols_a, gols_b, vencedor_id, data) VALUES (?, ?, ?, ?, ?, ?)',
                [time_a_id, time_b_id, gols_a, gols_b, vencedor_id, new Date().toISOString()]
            );

            // Pega o ID da partida que acabamos de criar
            const ultimaPartida = db.getFirstSync('SELECT id FROM partidas ORDER BY id DESC LIMIT 1');
            const partidaId = ultimaPartida.id;

            // 2. Salva estatísticas do Time A
            estatisticasA.forEach(est => {
                if (est.gols > 0 || est.assistencias > 0 || est.gols_contra > 0) {
                    db.runSync(
                        'INSERT INTO estatisticas_partida (partida_id, jogador_id, gols, assistencias, gols_contra) VALUES (?, ?, ?, ?, ?)',
                        [partidaId, est.jogador_id, est.gols, est.assistencias, est.gols_contra]
                    );
                }
            });

            // 3. Salva estatísticas do Time B
            estatisticasB.forEach(est => {
                if (est.gols > 0 || est.assistencias > 0 || est.gols_contra > 0) {
                    db.runSync(
                        'INSERT INTO estatisticas_partida (partida_id, jogador_id, gols, assistencias, gols_contra) VALUES (?, ?, ?, ?, ?)',
                        [partidaId, est.jogador_id, est.gols, est.assistencias, est.gols_contra]
                    );
                }
            });

            return true;
        } catch (e) {
            console.error("Erro ao salvar fim de jogo:", e);
            return false;
        }
    },

    // Lógica da Fila: Descobrir quem são os próximos a jogar
    getProximoConfronto: (totalTimes) => {
        try {
            const ultima = db.getFirstSync('SELECT * FROM partidas ORDER BY id DESC LIMIT 1');
            
            // Se for o primeiro jogo
            if (!ultima) return { timeA: 1, timeB: 2 };

            let proxA, proxB;
            
            // Regra: Quem ganha fica (timeA), perdedor vai pra rabieta
            if (ultima.vencedor_id !== 0) {
                proxA = ultima.vencedor_id;
                // O próximo time é o ID seguinte ao maior ID que jogou, ou volta pro 1
                let maiorIdJogado = Math.max(ultima.time_a_id, ultima.time_b_id);
                proxB = maiorIdJogado + 1 > totalTimes ? 1 : maiorIdJogado + 1;
                
                // Evita que o time jogue contra ele mesmo se só houver 2 times
                if (proxA === proxB) proxB = proxA === 1 ? 2 : 1;
            } else {
                // Regra de Empate (Saída Dupla para 4+ times)
                if (totalTimes >= 4) {
                    let maiorIdJogado = Math.max(ultima.time_a_id, ultima.time_b_id);
                    proxA = maiorIdJogado + 1 > totalTimes ? 1 : maiorIdIdJogado + 1;
                    proxB = proxA + 1 > totalTimes ? 1 : proxA + 1;
                } else {
                    // Empate com poucos times: O ADM decide (padrão mantemos o último jogo para ajuste manual)
                    return { timeA: ultima.time_a_id, timeB: ultima.time_b_id, empate: true };
                }
            }
            return { timeA: proxA, timeB: proxB };
        } catch (e) { return { timeA: 1, timeB: 2 }; }
    }
};