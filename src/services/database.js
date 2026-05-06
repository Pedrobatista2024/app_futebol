import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('racha.db');

export const setupDatabase = () => {
    try {
        db.execSync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS jogadores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                posicao TEXT NOT NULL,
                presente INTEGER DEFAULT 0,
                time_id INTEGER DEFAULT 0 -- 0 significa sem time
            );

            CREATE TABLE IF NOT EXISTS configuracao (
                id INTEGER PRIMARY KEY CHECK (id = 1), -- Garante apenas 1 linha
                jogadores_por_time INTEGER DEFAULT 5,
                conta_goleiro INTEGER DEFAULT 1
            );

            -- Insere a config padrão se não existir
            INSERT OR IGNORE INTO configuracao (id, jogadores_por_time, conta_goleiro) VALUES (1, 5, 1);
        `);

        // Garante que a coluna time_id exista se a tabela já era antiga
        try { db.execSync('ALTER TABLE jogadores ADD COLUMN time_id INTEGER DEFAULT 0;'); } catch(e){}

        console.log("✅ [DB] Estrutura de Sorteio Pronta!");
    } catch (error) {
        console.error("❌ [DB] Erro:", error);
    }
};