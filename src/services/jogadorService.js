import { db } from './database';

export const JogadorService = {
    // ==========================================
    // PARTE 1: GERENCIAMENTO DE JOGADORES (CRUD)
    // ==========================================

    create: (nome, posicao) => {
        try {
            db.runSync('INSERT INTO jogadores (nome, posicao) VALUES (?, ?)', [nome, posicao]);
            return true;
        } catch (error) { return false; }
    },

    findAll: () => {
        try { return db.getAllSync('SELECT * FROM jogadores ORDER BY nome ASC'); } 
        catch (error) { return []; }
    },

    togglePresente: (id, statusAtual) => {
        try {
            const novoStatus = statusAtual === 1 ? 0 : 1;
            db.runSync('UPDATE jogadores SET presente = ? WHERE id = ?', [novoStatus, id]);
            return true;
        } catch (error) { return false; }
    },

    update: (id, nome, posicao) => {
        try {
            db.runSync('UPDATE jogadores SET nome = ?, posicao = ? WHERE id = ?', [nome, posicao, id]);
            return true;
        } catch (error) { return false; }
    },

    updateFoto: (id, uri) => {
        try {
            db.runSync('UPDATE jogadores SET foto_uri = ? WHERE id = ?', [uri, id]);
            return true;
        } catch (error) { return false; }
    },

    updateFotoCapa: (uri) => {
        try {
            db.runSync('UPDATE configuracao SET foto_capa_uri = ? WHERE id = 1', [uri]);
            return true;
        } catch (error) { return false; }
    },

    delete: (id) => {
        try {
            db.runSync('DELETE FROM jogadores WHERE id = ?', [id]);
            return true;
        } catch (error) { return false; }
    },

    // 🔴 NOVA FUNÇÃO: Busca dados simplificados de todos para o Card de Elenco
    getElencoCompleto: () => {
        try {
            return db.getAllSync(`
                SELECT 
                    j.id, j.nome, j.foto_uri, j.posicao,
                    SUM(ep.gols) as totalGols,
                    SUM(ep.assistencias) as totalAssists,
                    SUM(ep.gols_contra) as totalContra, -- 🔴 NOVO
                    COUNT(ep.partida_id) as totalJogos,
                    SUM(CASE WHEN p.vencedor_id = ep.time_id THEN 1 ELSE 0 END) as totalVits,
                    SUM(CASE WHEN p.vencedor_id = 0 THEN 1 ELSE 0 END) as totalEmps,
                    SUM(CASE WHEN p.vencedor_id != ep.time_id AND p.vencedor_id != 0 THEN 1 ELSE 0 END) as totalDers
                FROM jogadores j
                LEFT JOIN estatisticas_partida ep ON j.id = ep.jogador_id
                LEFT JOIN partidas p ON ep.partida_id = p.id
                GROUP BY j.id
                ORDER BY totalGols DESC, j.nome ASC
            `);
        } catch (e) { return []; }
    },

    // ==========================================
    // PARTE 2: LÓGICA E MOTOR DO SORTEIO
    // ==========================================

    getConfig: () => {
        try { return db.getFirstSync('SELECT * FROM configuracao WHERE id = 1'); } 
        catch (error) { return { jogadores_por_time: 5, conta_goleiro: 1, tempo_partida: 10, gols_partida: 2 }; }
    },

    saveConfig: (qtd, goleiro) => {
        try {
            db.runSync('UPDATE configuracao SET jogadores_por_time = ?, conta_goleiro = ? WHERE id = 1', [qtd, goleiro ? 1 : 0]);
            return true;
        } catch (error) { return false; }
    },

    saveRegrasPartida: (tempo, gols) => {
        try {
            db.runSync('UPDATE configuracao SET tempo_partida = ?, gols_partida = ? WHERE id = 1', [tempo, gols]);
            return true;
        } catch (error) { return false; }
    },

    verificarSorteioRealizado: () => {
        try {
            const resultado = db.getFirstSync('SELECT COUNT(*) as total FROM jogadores WHERE time_id > 0');
            return resultado.total > 0;
        } catch (e) { return false; }
    },

    getRachaAtualId: () => {
        try {
            const result = db.getFirstSync('SELECT id FROM rachas ORDER BY id DESC LIMIT 1');
            return result ? result.id : null;
        } catch (e) { return null; }
    },

    executarSorteio: () => {
        try {
            let rachaId = JogadorService.getRachaAtualId();
            
            if (!rachaId) {
                const result = db.runSync("INSERT INTO rachas (data) VALUES (datetime('now', 'localtime'))");
                rachaId = result.lastInsertRowId;
            } else {
                const partidas = db.getFirstSync('SELECT COUNT(*) as qtd FROM partidas WHERE racha_id = ?', [rachaId]);
                if (partidas && partidas.qtd > 0) {
                    const result = db.runSync("INSERT INTO rachas (data) VALUES (datetime('now', 'localtime'))");
                    rachaId = result.lastInsertRowId;
                }
            }

            const config = db.getFirstSync('SELECT * FROM configuracao WHERE id = 1');
            const presentes = db.getAllSync('SELECT * FROM jogadores WHERE presente = 1');
            
            db.runSync('UPDATE jogadores SET time_id = 0');

            const linha = presentes.filter(j => j.posicao === 'Jogador').sort(() => Math.random() - 0.5);
            const goleiros = presentes.filter(j => j.posicao === 'Goleiro').sort(() => Math.random() - 0.5);

            const numTimes = linha.length > 0 ? Math.ceil(linha.length / config.jogadores_por_time) : 0;

            if (numTimes === 0) return false;

            if (config.conta_goleiro === 1) {
                goleiros.forEach((g, index) => {
                    if (index < numTimes) db.runSync('UPDATE jogadores SET time_id = ? WHERE id = ?', [index + 1, g.id]);
                });
            }

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
        } catch (e) { return false; }
    },

    getJogadoresPorTime: (timeId) => {
        try { return db.getAllSync('SELECT * FROM jogadores WHERE time_id = ?', [timeId]); } 
        catch (e) { return []; }
    },

    vincularJogadorAoTime: (jogadorId, timeId) => {
        try {
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
        } catch (error) { return false; }
    },

    getFilaTimes: () => {
        try {
            const resultado = db.getAllSync('SELECT DISTINCT time_id FROM jogadores WHERE time_id > 0 ORDER BY time_id ASC');
            return resultado.map(r => r.time_id);
        } catch (e) { return []; }
    },

    // ==========================================
    // PARTE 3: LÓGICA DE PARTIDAS
    // ==========================================

    salvarResultadoPartida: (timeA, golsA, timeB, golsB) => {
        try {
            const rachaId = JogadorService.getRachaAtualId(); 
            db.runSync('INSERT INTO partidas (racha_id, time_a_id, gols_a, time_b_id, gols_b, data) VALUES (?, ?, ?, ?, ?, ?)', 
            [rachaId, timeA, golsA, timeB, golsB, new Date().toISOString()]);
            return true;
        } catch (e) { return false; }
    },

    encerrarPartidaCompleto: (dadosPartida, estatisticasA, estatisticasB, vencedorManualId = null) => {
        try {
            const rachaId = JogadorService.getRachaAtualId();
            if (!rachaId) return false;

            const { time_a_id, time_b_id, gols_a, gols_b } = dadosPartida;
            
            let vencedor_id = 0; 

            // Lógica de definição do vencedor
            if (gols_a > gols_b) {
                vencedor_id = time_a_id;
            } else if (gols_b > gols_a) {
                vencedor_id = time_b_id;
            } else if (vencedorManualId) {
                // 🔴 Se empatou no placar mas o ADM definiu o vencedor (Pênaltis)
                vencedor_id = vencedorManualId;
            }

            // Grava a partida no banco
            const result = db.runSync(
                'INSERT INTO partidas (racha_id, time_a_id, time_b_id, gols_a, gols_b, vencedor_id, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [rachaId, time_a_id, time_b_id, gols_a, gols_b, vencedor_id, new Date().toISOString()]
            );

            const partidaId = result.lastInsertRowId; 

            // Função interna para salvar gols/assistências dos atletas
            const salvarScorers = (lista, timeDoJogadorId) => {
                lista.forEach(est => {
                    db.runSync(
                        'INSERT INTO estatisticas_partida (partida_id, jogador_id, gols, assistencias, gols_contra, time_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [partidaId, est.jogador_id, est.gols, est.assistencias, est.gols_contra || 0, timeDoJogadorId]
                    );
                });
            };

            salvarScorers(estatisticasA, time_a_id);
            salvarScorers(estatisticasB, time_b_id);

            return true;
        } catch (e) { 
            console.error("Erro ao encerrar partida:", e);
            return false; 
        }
    },

    getProximoConfronto: () => {
        try {
            const rachaId = JogadorService.getRachaAtualId();
            if (!rachaId) return { timeA: 1, timeB: 2 };

            const todosTimesResult = db.getAllSync('SELECT DISTINCT time_id FROM jogadores WHERE time_id > 0 ORDER BY time_id ASC');
            let fila = todosTimesResult.map(r => r.time_id); 
            const totalTimes = fila.length;

            if (totalTimes < 2) return { timeA: 1, timeB: 2 };

            const partidas = db.getAllSync('SELECT * FROM partidas WHERE racha_id = ? ORDER BY id ASC', [rachaId]);

            let timeAtualA = fila.shift(); 
            let timeAtualB = fila.shift(); 

            if (partidas.length === 0) return { timeA: timeAtualA, timeB: timeAtualB };

            for (let i = 0; i < partidas.length; i++) {
                const p = partidas[i];

                if (p.vencedor_id !== 0 && p.vencedor_id !== null) {
                    const vencedor = p.vencedor_id;
                    const perdedor = (p.time_a_id === vencedor) ? p.time_b_id : p.time_a_id;
                    fila.push(perdedor); 
                    timeAtualA = vencedor; 
                    timeAtualB = fila.shift(); 
                } else {
                    if (totalTimes >= 4) {
                        const menor = Math.min(p.time_a_id, p.time_b_id);
                        const maior = Math.max(p.time_a_id, p.time_b_id);
                        fila.push(menor);
                        fila.push(maior);
                        timeAtualA = fila.shift();
                        timeAtualB = fila.shift();
                    } else {
                        if (i === partidas.length - 1) return { timeA: p.time_a_id, timeB: p.time_b_id, empate: true };
                    }
                }
            }
            return { timeA: timeAtualA, timeB: timeAtualB };
        } catch (e) { return { timeA: 1, timeB: 2 }; }
    },

    // ==========================================
    // PARTE 4: ESTATÍSTICAS E RESUMOS
    // ==========================================

    getResumoRachaAtual: () => {
        try {
            const rachaId = JogadorService.getRachaAtualId();
            if (!rachaId) return null;

            const partidas = db.getAllSync('SELECT * FROM partidas WHERE racha_id = ?', [rachaId]);
            
            const estatisticas = db.getAllSync(`
                SELECT e.jogador_id, j.nome, j.foto_uri, SUM(e.gols) as gols, SUM(e.assistencias) as assistencias
                FROM estatisticas_partida e
                JOIN partidas p ON e.partida_id = p.id
                JOIN jogadores j ON e.jogador_id = j.id
                WHERE p.racha_id = ?
                GROUP BY e.jogador_id
            `, [rachaId]);

            let timesMap = {};
            partidas.forEach(p => {
                if (!timesMap[p.time_a_id]) timesMap[p.time_a_id] = { id: p.time_a_id, Pts: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };
                if (!timesMap[p.time_b_id]) timesMap[p.time_b_id] = { id: p.time_b_id, Pts: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };

                timesMap[p.time_a_id].J++;
                timesMap[p.time_b_id].J++;
                timesMap[p.time_a_id].GP += p.gols_a;
                timesMap[p.time_b_id].GP += p.gols_b;
                timesMap[p.time_a_id].GC += p.gols_b;
                timesMap[p.time_b_id].GC += p.gols_a;

                if (p.vencedor_id === p.time_a_id) {
                    timesMap[p.time_a_id].V++; timesMap[p.time_a_id].Pts += 3;
                    timesMap[p.time_b_id].D++;
                } else if (p.vencedor_id === p.time_b_id) {
                    timesMap[p.time_b_id].V++; timesMap[p.time_b_id].Pts += 3;
                    timesMap[p.time_a_id].D++;
                } else {
                    timesMap[p.time_a_id].E++; timesMap[p.time_a_id].Pts += 1;
                    timesMap[p.time_b_id].E++; timesMap[p.time_b_id].Pts += 1;
                }
            });

            let tabelaTimes = Object.values(timesMap).map(t => {
                t.SG = t.GP - t.GC;
                return t;
            });

            tabelaTimes.sort((a, b) => {
                if (b.Pts !== a.Pts) return b.Pts - a.Pts;
                if (b.SG !== a.SG) return b.SG - a.SG;
                if (b.GP !== a.GP) return b.GP - a.GP;
                return a.id - b.id;
            });

            // --- Lógica de Empates nos Destaques ---
            
            // Encontra qual é o maior número de gols e assistências feitos no dia
            const maxGols = Math.max(...estatisticas.map(j => j.gols), 0);
            const maxAssists = Math.max(...estatisticas.map(j => j.assistencias), 0);

            // Filtra TODOS os jogadores que atingiram esse número máximo (se for maior que zero)
            const artilheiros = estatisticas.filter(j => j.gols > 0 && j.gols === maxGols);
            const garcons = estatisticas.filter(j => j.assistencias > 0 && j.assistencias === maxAssists);

            return {
                tabelaTimes,
                artilheiros, // Agora retorna a lista de todos os empatados
                garcons      // Agora retorna a lista de todos os empatados
            };
        } catch (e) {
            console.error("Erro ao gerar resumo:", e);
            return null;
        }
    },

    encerrarRachaDeVez: () => {
        try {
            db.runSync('UPDATE jogadores SET time_id = 0');
            return true;
        } catch (e) { return false; }
    },

    getStatsJogador: (jogadorId) => {
        try {
            const jogador = db.getFirstSync('SELECT nome, posicao, foto_uri FROM jogadores WHERE id = ?', [jogadorId]);
            
            const acumulado = db.getFirstSync(`
                SELECT 
                    SUM(ep.gols) as gols, 
                    SUM(ep.assistencias) as assistencias, 
                    SUM(ep.gols_contra) as gols_contra, -- 🔴 NOVO
                    COUNT(ep.partida_id) as partidas,
                    SUM(CASE WHEN p.vencedor_id = ep.time_id THEN 1 ELSE 0 END) as vitorias,
                    SUM(CASE WHEN p.vencedor_id = 0 THEN 1 ELSE 0 END) as empates,
                    SUM(CASE WHEN p.vencedor_id != ep.time_id AND p.vencedor_id != 0 THEN 1 ELSE 0 END) as derrotas
                FROM estatisticas_partida ep
                JOIN partidas p ON ep.partida_id = p.id
                WHERE ep.jogador_id = ?
            `, [jogadorId]);

            return {
                nome: jogador.nome,
                posicao: jogador.posicao,
                foto_uri: jogador.foto_uri,
                gols: acumulado.gols || 0,
                assistencias: acumulado.assistencias || 0,
                gols_contra: acumulado.gols_contra || 0, // 🔴 NOVO
                partidas: acumulado.partidas || 0,
                vitorias: acumulado.vitorias || 0,
                derrotas: acumulado.derrotas || 0,
                empates: acumulado.empates || 0
            };
        } catch (e) { return null; }
    },

    getPerfilRacha: () => {
        try {
            const config = db.getFirstSync('SELECT foto_capa_uri FROM configuracao WHERE id = 1');
            
            const rachas = db.getFirstSync('SELECT COUNT(*) as total FROM rachas');
            const partidas = db.getFirstSync('SELECT COUNT(*) as total, SUM(gols_a + gols_b) as gols FROM partidas');
            const vitorias = db.getFirstSync('SELECT COUNT(*) as total FROM partidas WHERE vencedor_id != 0');
            const derrotas = db.getFirstSync('SELECT COUNT(*) as total FROM partidas WHERE vencedor_id != 0'); 
            const empates = db.getFirstSync('SELECT COUNT(*) as total FROM partidas WHERE vencedor_id = 0');

            const artilheiro = db.getFirstSync(`
                SELECT j.nome, j.foto_uri, SUM(e.gols) as valor 
                FROM estatisticas_partida e 
                JOIN jogadores j ON e.jogador_id = j.id 
                GROUP BY e.jogador_id 
                ORDER BY valor DESC LIMIT 1
            `);

            const garcom = db.getFirstSync(`
                SELECT j.nome, j.foto_uri, SUM(e.assistencias) as valor 
                FROM estatisticas_partida e 
                JOIN jogadores j ON e.jogador_id = j.id 
                GROUP BY e.jogador_id 
                ORDER BY valor DESC LIMIT 1
            `);

            const muralha = db.getFirstSync(`
                SELECT j.nome, j.foto_uri, 
                SUM(CASE WHEN p.time_a_id = e.time_id THEN p.gols_b ELSE p.gols_a END) as valor,
                COUNT(e.partida_id) as partidas
                FROM estatisticas_partida e 
                JOIN partidas p ON e.partida_id = p.id 
                JOIN jogadores j ON e.jogador_id = j.id 
                WHERE j.posicao = 'Goleiro'
                GROUP BY e.jogador_id 
                ORDER BY valor ASC, partidas DESC LIMIT 1
            `);

            const talisma = db.getFirstSync(`
                SELECT j.nome, j.foto_uri, COUNT(e.partida_id) as valor
                FROM estatisticas_partida e
                JOIN partidas p ON e.partida_id = p.id
                JOIN jogadores j ON e.jogador_id = j.id
                WHERE p.vencedor_id = e.time_id
                GROUP BY e.jogador_id
                ORDER BY valor DESC LIMIT 1
            `);

            // 🔴 ADICIONADO: BLOCO FOGO AMIGO (MAIOR GOLS CONTRA)
            const fogoAmigo = db.getFirstSync(`
                SELECT j.nome, j.foto_uri, SUM(e.gols_contra) as valor 
                FROM estatisticas_partida e 
                JOIN jogadores j ON e.jogador_id = j.id 
                GROUP BY e.jogador_id 
                HAVING valor > 0
                ORDER BY valor DESC LIMIT 1
            `);

            const jogadoresRecentes = db.getAllSync(`
                SELECT 
                    j.id, j.nome, j.foto_uri,
                    p.vencedor_id, e.time_id, p.id as id_partida
                FROM estatisticas_partida e
                JOIN partidas p ON e.partida_id = p.id
                JOIN jogadores j ON e.jogador_id = j.id
                ORDER BY p.id DESC
            `);

            const fasesMap = {};
            jogadoresRecentes.forEach(row => {
                if (!fasesMap[row.id]) {
                    fasesMap[row.id] = { nome: row.nome, foto_uri: row.foto_uri, jogosContados: 0, pontosFase: 0 };
                }
                
                if (fasesMap[row.id].jogosContados < 10) {
                    fasesMap[row.id].jogosContados++;
                    
                    if (row.vencedor_id === row.time_id) {
                        fasesMap[row.id].pontosFase += 3; 
                    } else if (row.vencedor_id === 0) {
                        fasesMap[row.id].pontosFase += 1; 
                    }
                }
            });

            const rankingFases = Object.values(fasesMap).filter(j => j.jogosContados >= 3);
            rankingFases.sort((a, b) => b.pontosFase - a.pontosFase);
            
            const melhorFase = rankingFases.length > 0 ? { ...rankingFases[0], valor: rankingFases[0].pontosFase } : null;
            const piorFase = rankingFases.length > 1 ? { ...rankingFases[rankingFases.length - 1], valor: rankingFases[rankingFases.length - 1].pontosFase } : null;

            return {
                foto_capa_uri: config ? config.foto_capa_uri : null, 
                estatisticas: {
                    totalRachas: rachas.total || 0,
                    totalPartidas: partidas.total || 0,
                    totalGols: partidas.gols || 0,
                    totalVitorias: vitorias.total || 0,
                    totalDerrotas: derrotas.total || 0,
                    totalEmpates: empates.total || 0,
                },
                destaques: {
                    artilheiro: artilheiro && artilheiro.valor > 0 ? artilheiro : null,
                    garcom: garcom && garcom.valor > 0 ? garcom : null,
                    muralha: muralha && muralha.partidas > 0 ? muralha : null,
                    talisma: talisma && talisma.valor > 0 ? talisma : null,
                    fogoAmigo: fogoAmigo, // 🔴 RETORNA O NOVO DESTAQUE
                    melhorFase: melhorFase,
                    piorFase: piorFase
                }
            };
        } catch (e) {
            console.error("Erro ao buscar perfil do racha:", e);
            return null;
        }
    },

    // ==========================================
    // PARTE 5: TOP 10 RANKINGS GERAIS
    // ==========================================
    
    getRankingsGerais: () => {
        try {
            // 1. Artilharia Geral
            const artilharia = db.getAllSync(`SELECT j.id, j.nome, j.foto_uri, SUM(e.gols) as valor FROM estatisticas_partida e JOIN jogadores j ON e.jogador_id = j.id GROUP BY e.jogador_id HAVING valor > 0 ORDER BY valor DESC LIMIT 10`);

            // 2. Garçom Geral
            const garcom = db.getAllSync(`SELECT j.id, j.nome, j.foto_uri, SUM(e.assistencias) as valor FROM estatisticas_partida e JOIN jogadores j ON e.jogador_id = j.id GROUP BY e.jogador_id HAVING valor > 0 ORDER BY valor DESC LIMIT 10`);

            // 3. Muralha (Média de Gols Sofridos por Jogo)
            const muralhaRaw = db.getAllSync(`
                SELECT j.id, j.nome, j.foto_uri, 
                (SUM(CASE WHEN p.time_a_id = e.time_id THEN p.gols_b ELSE p.gols_a END) * 1.0 / COUNT(e.partida_id)) as valor
                FROM estatisticas_partida e JOIN partidas p ON e.partida_id = p.id JOIN jogadores j ON e.jogador_id = j.id 
                WHERE j.posicao = 'Goleiro' GROUP BY e.jogador_id HAVING COUNT(e.partida_id) >= 3 ORDER BY valor ASC LIMIT 10
            `);
            const muralha = muralhaRaw.map(m => ({ ...m, valor: parseFloat(m.valor).toFixed(2) })); 

            // 🔴 4. FOGO AMIGO (GOLS CONTRA) - NOVO
            const fogoAmigo = db.getAllSync(`
                SELECT j.id, j.nome, j.foto_uri, SUM(e.gols_contra) as valor 
                FROM estatisticas_partida e 
                JOIN jogadores j ON e.jogador_id = j.id 
                GROUP BY e.jogador_id 
                HAVING valor > 0 
                ORDER BY valor DESC LIMIT 10
            `);

            // 5. Recordes Num Único Racha
            const recordesRacha = db.getAllSync(`
                SELECT j.id, j.nome, j.foto_uri, SUM(e.gols) as gols, SUM(e.assistencias) as assistencias, p.racha_id
                FROM estatisticas_partida e JOIN partidas p ON e.partida_id = p.id JOIN jogadores j ON e.jogador_id = j.id
                GROUP BY e.jogador_id, p.racha_id
            `);

            const bestGolsDia = {}; const bestAssDia = {};
            recordesRacha.forEach(item => {
                if (!bestGolsDia[item.id] || bestGolsDia[item.id].valor < item.gols) bestGolsDia[item.id] = { ...item, valor: item.gols };
                if (!bestAssDia[item.id] || bestAssDia[item.id].valor < item.assistencias) bestAssDia[item.id] = { ...item, valor: item.assistencias };
            });

            const recordeGolsRacha = Object.values(bestGolsDia).filter(i => i.valor > 0).sort((a,b) => b.valor - a.valor).slice(0, 10);
            const recordeAssistRacha = Object.values(bestAssDia).filter(i => i.valor > 0).sort((a,b) => b.valor - a.valor).slice(0, 10);

            // 6. Lógica de Sequências (Recorde Pessoal Histórico)
            const historicoGeral = db.getAllSync(`
                SELECT e.jogador_id as id, j.nome, j.foto_uri, e.gols, e.assistencias, e.time_id, p.vencedor_id, p.id as partida_id
                FROM estatisticas_partida e JOIN partidas p ON e.partida_id = p.id JOIN jogadores j ON e.jogador_id = j.id ORDER BY p.id ASC
            `);

            const seqData = {};
            historicoGeral.forEach(row => {
                if (!seqData[row.id]) {
                    seqData[row.id] = { id: row.id, nome: row.nome, foto_uri: row.foto_uri, currVit: 0, maxVit: 0, currGol: 0, maxGol: 0, currAss: 0, maxAss: 0 };
                }
                if (row.vencedor_id === row.time_id) {
                    seqData[row.id].currVit++;
                    if (seqData[row.id].currVit > seqData[row.id].maxVit) seqData[row.id].maxVit = seqData[row.id].currVit;
                } else seqData[row.id].currVit = 0;

                if (row.gols > 0) {
                    seqData[row.id].currGol++;
                    if (seqData[row.id].currGol > seqData[row.id].maxGol) seqData[row.id].maxGol = seqData[row.id].currGol;
                } else seqData[row.id].currGol = 0;

                if (row.assistencias > 0) {
                    seqData[row.id].currAss++;
                    if (seqData[row.id].currAss > seqData[row.id].maxAss) seqData[row.id].maxAss = seqData[row.id].currAss;
                } else seqData[row.id].currAss = 0;
            });

            const arrSeq = Object.values(seqData);
            const seqVitorias = [...arrSeq].sort((a,b) => b.maxVit - a.maxVit).map(x => ({...x, valor: x.maxVit})).filter(x => x.valor > 1).slice(0, 10);
            const seqGols = [...arrSeq].sort((a,b) => b.maxGol - a.maxGol).map(x => ({...x, valor: x.maxGol})).filter(x => x.valor > 1).slice(0, 10);
            const seqAssist = [...arrSeq].sort((a,b) => b.maxAss - a.maxAss).map(x => ({...x, valor: x.maxAss})).filter(x => x.valor > 1).slice(0, 10);

            return {
                artilharia, garcom, muralha, fogoAmigo, recordeGolsRacha, recordeAssistRacha, seqVitorias, seqGols, seqAssist
            };
        } catch (e) {
            console.error("Erro ao gerar rankings globais:", e);
            return null;
        }
    }
};