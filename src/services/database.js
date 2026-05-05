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
                presente INTEGER DEFAULT 0 
            );
        `);
        // Medida de segurança: Adiciona a coluna presente caso a tabela já exista sem ela
        try {
            db.execSync('ALTER TABLE jogadores ADD COLUMN presente INTEGER DEFAULT 0;');
        } catch (e) {
            // Se cair aqui, é porque a coluna já existe, tudo bem.
        }
        console.log("✅ [DB] Banco pronto para Check-in!");
    } catch (error) {
        console.error("❌ [DB] Erro ao iniciar banco:", error);
    }
};