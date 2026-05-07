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
            return { jogadores_por_time: 5, conta_goleiro: 1, tempo_partida: 10, gols_partida: 2 }; // Padrão se der erro
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

    // NOVO: Verifica se já existe um sorteio realizado
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

            // IMPORTANTE: Ao fazer um novo sorteio, limpamos o histórico do racha anterior
            db.runSync('DELETE FROM partidas');
            db.runSync('DELETE FROM estatisticas_partida');

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

    // ==========================================
    // PARTE 3: LÓGICA DE PARTIDAS E ESTATÍSTICAS
    // ==========================================

    // Salva o resultado de uma partida simples
    salvarResultadoPartida: (timeA, golsA, timeB, golsB) => {
        try {
            db.runSync('INSERT INTO partidas (time_a_id, gols_a, time_b_id, gols_b, data) VALUES (?, ?, ?, ?, ?)', 
            [timeA, golsA, timeB, golsB, new Date().toISOString()]);
            return true;
        } catch (e) { return false; }
    },

    // Salva a partida COMPLETA com artilheiros e assistências (Usado no Pós Jogo)
    encerrarPartidaCompleto: (dadosPartida, estatisticasA, estatisticasB) => {
        try {
            // 1. Insere a partida
            const { time_a_id, time_b_id, gols_a, gols_b } = dadosPartida;
            let vencedor_id = 0; // 0 = Empate
            if (gols_a > gols_b) vencedor_id = time_a_id;
            else if (gols_b > gols_a) vencedor_id = time_b_id;

            db.runSync(
                'INSERT INTO partidas (time_a_id, time_b_id, gols_a, gols_b, vencedor_id, data) VALUES (?, ?, ?, ?, ?, ?)',
                [time_a_id, time_b_id, gols_a, gols_b, vencedor_id, new Date().toISOString()]
            );

            // Pega o ID da partida que acabamos de criar
            const ultimaPartida = db.getFirstSync('SELECT id FROM partidas ORDER BY id DESC LIMIT 1');
            const partidaId = ultimaPartida.id;

            // Função interna para limpar o código de salvar
            const salvarScorers = (lista) => {
                lista.forEach(est => {
                    if (est.gols > 0 || est.assistencias > 0 || est.gols_contra > 0) {
                        db.runSync(
                            'INSERT INTO estatisticas_partida (partida_id, jogador_id, gols, assistencias, gols_contra) VALUES (?, ?, ?, ?, ?)',
                            [partidaId, est.jogador_id, est.gols, est.assistencias, est.gols_contra || 0]
                        );
                    }
                });
            };

            // 2. Salva estatísticas de ambos os times
            salvarScorers(estatisticasA);
            salvarScorers(estatisticasB);

            return true;
        } catch (e) {
            console.error("Erro ao salvar fim de jogo:", e);
            return false;
        }
    },

    // Lógica da Fila: Descobrir quem são os próximos a jogar
    // Lógica da Fila REAL: Simula a fila desde o jogo 1 para saber quem joga agora
    getProximoConfronto: () => {
        try {
            // 1. Pega todos os times que estão no racha ordenados (A fila original do começo do dia)
            const todosTimesResult = db.getAllSync('SELECT DISTINCT time_id FROM jogadores WHERE time_id > 0 ORDER BY time_id ASC');
            let fila = todosTimesResult.map(r => r.time_id); // Ex: [1, 2, 3, 4]
            const totalTimes = fila.length;

            if (totalTimes < 2) return { timeA: 1, timeB: 2 }; // Proteção

            // 2. Busca todas as partidas já jogadas hoje
            const partidas = db.getAllSync('SELECT * FROM partidas ORDER BY id ASC');

            // 3. Inicia a simulação tirando os dois primeiros que jogaram a Partida 1
            let timeAtualA = fila.shift(); // Tira o 1º da fila
            let timeAtualB = fila.shift(); // Tira o 2º da fila

            // 4. Se não tem nenhuma partida no histórico, manda o Jogo 1
            if (partidas.length === 0) {
                return { timeA: timeAtualA, timeB: timeAtualB };
            }

            // 5. Roda a fita: Simula o histórico do racha inteiro para montar a fila atual
            for (let i = 0; i < partidas.length; i++) {
                const p = partidas[i];

                if (p.vencedor_id !== 0) {
                    // REGRA 1: TEVE VENCEDOR (QUEM GANHA FICA)
                    const vencedor = p.vencedor_id;
                    const perdedor = (p.time_a_id === vencedor) ? p.time_b_id : p.time_a_id;

                    fila.push(perdedor); // O perdedor vai pro final da fila de espera
                    timeAtualA = vencedor; // O vencedor continua na quadra
                    timeAtualB = fila.shift(); // O próximo da fila de espera entra
                } else {
                    // REGRA 2: DEU EMPATE
                    if (totalTimes >= 4) {
                        // SAÍDA DUPLA: Os dois saem
                        const menor = Math.min(p.time_a_id, p.time_b_id);
                        const maior = Math.max(p.time_a_id, p.time_b_id);
                        
                        // O número menor entra na fila primeiro (para voltar a jogar mais cedo)
                        fila.push(menor);
                        fila.push(maior);

                        // Como a quadra ficou vazia, entram os dois próximos da fila
                        timeAtualA = fila.shift();
                        timeAtualB = fila.shift();
                    } else {
                        // EMPATE COM 3 TIMES OU MENOS
                        // A regra diz que não tem saída dupla, TEM que ir pros pênaltis
                        // Se essa for a última partida do banco (a que acabou de acontecer), avisa a tela
                        if (i === partidas.length - 1) {
                            return { timeA: p.time_a_id, timeB: p.time_b_id, empate: true };
                        }
                    }
                }
            }

            // Depois de simular todo o histórico aplicando as regras de quem sai e quem entra,
            // sabemos exatamente quem são os dois times que ficaram na ponta para jogar agora!
            return { timeA: timeAtualA, timeB: timeAtualB };

        } catch (e) {
            console.error("Erro no Simulador de Fila:", e);
            return { timeA: 1, timeB: 2 };
        }
    }
};