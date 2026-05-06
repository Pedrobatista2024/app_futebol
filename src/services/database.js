import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('racha.db');

export const setupDatabase = () => {
    try {
        // 1. Criação das Tabelas Base
        db.execSync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            -- Tabela de Jogadores
            CREATE TABLE IF NOT EXISTS jogadores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                posicao TEXT NOT NULL,
                presente INTEGER DEFAULT 0,
                time_id INTEGER DEFAULT 0
            );

            -- Tabela de Configurações do Racha e da Partida
            CREATE TABLE IF NOT EXISTS configuracao (
                id INTEGER PRIMARY KEY CHECK (id = 1), 
                jogadores_por_time INTEGER DEFAULT 5,
                conta_goleiro INTEGER DEFAULT 1,
                tempo_partida INTEGER DEFAULT 10,
                gols_partida INTEGER DEFAULT 2
            );

            -- Tabela de Partidas (Histórico de jogos)
            CREATE TABLE IF NOT EXISTS partidas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time_a_id INTEGER,
                time_b_id INTEGER,
                gols_a INTEGER DEFAULT 0,
                gols_b INTEGER DEFAULT 0,
                vencedor_id INTEGER DEFAULT 0, -- 0 para empate
                data TEXT
            );

            -- Tabela de Estatísticas Individuais (Gols e Assistências)
            CREATE TABLE IF NOT EXISTS estatisticas_partida (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                partida_id INTEGER,
                jogador_id INTEGER,
                gols INTEGER DEFAULT 0,
                assistencias INTEGER DEFAULT 0,
                gols_contra INTEGER DEFAULT 0,
                FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
                FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
            );

            -- Insere a config padrão se o banco for novo
            INSERT OR IGNORE INTO configuracao (id, jogadores_por_time, conta_goleiro, tempo_partida, gols_partida) 
            VALUES (1, 5, 1, 10, 2);
        `);

        // 2. Comandos de Atualização (Migrações)
        // Usamos try/catch individual para cada ALTER TABLE porque se a coluna já existir, o SQLite dá erro.
        
        try { db.execSync('ALTER TABLE jogadores ADD COLUMN time_id INTEGER DEFAULT 0;'); } catch(e){}
        
        // Colunas de Regras da Partida
        try { db.execSync('ALTER TABLE configuracao ADD COLUMN tempo_partida INTEGER DEFAULT 10;'); } catch(e){}
        try { db.execSync('ALTER TABLE configuracao ADD COLUMN gols_partida INTEGER DEFAULT 2;'); } catch(e){}

        console.log("✅ [DB] Estrutura Completa e Atualizada!");
    } catch (error) {
        console.error("❌ [DB] Erro Crítico na configuração:", error);
    }
};