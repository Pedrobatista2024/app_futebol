import { db } from './database';

export const JogadorService = {
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

    // UPDATE: Função nova para atualizar o nome e a posição
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

    // DELETE: Função nova para apagar um jogador
    delete: (id) => {
        try {
            db.runSync('DELETE FROM jogadores WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error("❌ [Service] Erro ao deletar:", error);
            return false;
        }
    }
};