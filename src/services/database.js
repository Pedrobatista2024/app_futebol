import * as SQLite from 'expo-sqlite';

// Abre a conexão com o arquivo local
export const db = SQLite.openDatabaseSync('racha.db');

export const setupDatabase = () => {
    try {
        // Criando apenas a tabela de jogadores para começar
        db.execSync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS jogadores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                posicao TEXT NOT NULL -- 'Goleiro' ou 'Jogador'
            );
        `);
        console.log("⚽ Banco de Dados inicializado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao configurar banco:", error);
    }
};