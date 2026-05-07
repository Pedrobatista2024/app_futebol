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

    delete: (id) => {
        try {
            db.runSync('DELETE FROM jogadores WHERE id = ?', [id]);
            return true;
        } catch (error) { return false; }
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

    encerrarPartidaCompleto: (dadosPartida, estatisticasA, estatisticasB) => {
        try {
            const rachaId = JogadorService.getRachaAtualId();
            if (!rachaId) return false;

            const { time_a_id, time_b_id, gols_a, gols_b } = dadosPartida;
            let vencedor_id = 0; 
            if (gols_a > gols_b) vencedor_id = time_a_id;
            else if (gols_b > gols_a) vencedor_id = time_b_id;

            const result = db.runSync(
                'INSERT INTO partidas (racha_id, time_a_id, time_b_id, gols_a, gols_b, vencedor_id, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [rachaId, time_a_id, time_b_id, gols_a, gols_b, vencedor_id, new Date().toISOString()]
            );

            const partidaId = result.lastInsertRowId; 

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

            salvarScorers(estatisticasA);
            salvarScorers(estatisticasB);

            return true;
        } catch (e) { return false; }
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
    // PARTE 4: ESTATÍSTICAS DO FIM DO RACHA
    // ==========================================

    getResumoRachaAtual: () => {
        try {
            const rachaId = JogadorService.getRachaAtualId();
            if (!rachaId) return null;

            // Busca os jogos apenas de hoje
            const partidas = db.getAllSync('SELECT * FROM partidas WHERE racha_id = ?', [rachaId]);
            
            // Busca gols e assistências somados por jogador, apenas do racha de hoje
            const estatisticas = db.getAllSync(`
                SELECT e.jogador_id, j.nome, SUM(e.gols) as gols, SUM(e.assistencias) as assistencias
                FROM estatisticas_partida e
                JOIN partidas p ON e.partida_id = p.id
                JOIN jogadores j ON e.jogador_id = j.id
                WHERE p.racha_id = ?
                GROUP BY e.jogador_id
            `, [rachaId]);

            // 1. Tabela Estilo Brasileirão
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

            // Ordem: Pontos > Saldo de Gols > Gols Feitos
            tabelaTimes.sort((a, b) => {
                if (b.Pts !== a.Pts) return b.Pts - a.Pts;
                if (b.SG !== a.SG) return b.SG - a.SG;
                if (b.GP !== a.GP) return b.GP - a.GP;
                return a.id - b.id;
            });

            // 2. Melhores do Dia
            let artilheiros = [...estatisticas].sort((a, b) => b.gols - a.gols).filter(j => j.gols > 0);
            let garcons = [...estatisticas].sort((a, b) => b.assistencias - a.assistencias).filter(j => j.assistencias > 0);

            return {
                tabelaTimes,
                artilheiro: artilheiros.length > 0 ? artilheiros[0] : null,
                garcom: garcons.length > 0 ? garcons[0] : null
            };
        } catch (e) {
            console.error("Erro ao gerar resumo:", e);
            return null;
        }
    },

    // Executado apenas quando o botão vermelho FIM for clicado
    encerrarRachaDeVez: () => {
        try {
            db.runSync('UPDATE jogadores SET time_id = 0');
            return true;
        } catch (e) { return false; }
    }
};