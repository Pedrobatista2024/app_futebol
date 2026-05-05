import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function Checkin() {
  const [jogadores, setJogadores] = useState([]);
  const [filtroPresentes, setFiltroPresentes] = useState(false); // Alterna a visualização

  const carregarDados = () => {
    const lista = JogadorService.findAll();
    setJogadores(lista);
  };

  useEffect(() => { carregarDados(); }, []);

  const handleToggle = (id, status) => {
    JogadorService.togglePresente(id, status);
    carregarDados(); // Recarrega para atualizar a cor na tela
  };

  // Filtra a lista se o botão de visualização estiver ativo
  const listaExibida = filtroPresentes 
    ? jogadores.filter(j => j.presente === 1) 
    : jogadores;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in do Racha ✅</Text>
      
      <View style={styles.headerBotoes}>
        <TouchableOpacity 
            style={[styles.btnFiltro, !filtroPresentes && styles.btnFiltroAtivo]} 
            onPress={() => setFiltroPresentes(false)}
        >
            <Text style={styles.txtFiltro}>Marcar Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.btnFiltro, filtroPresentes && styles.btnFiltroAtivo]} 
            onPress={() => setFiltroPresentes(true)}
        >
            <Text style={styles.txtFiltro}>Ver Confirmados ({jogadores.filter(j => j.presente === 1).length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listaExibida}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, item.presente === 1 ? styles.cardAtivo : styles.cardInativo]}
            onPress={() => handleToggle(item.id, item.presente)}
          >
            <View>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.posicao}>{item.posicao}</Text>
            </View>
            <Text style={styles.checkIcon}>{item.presente === 1 ? '✅' : '⬜'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum jogador encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  headerBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  btnFiltro: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#ddd', marginHorizontal: 5, borderRadius: 8 },
  btnFiltroAtivo: { backgroundColor: '#2196F3' },
  txtFiltro: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
  cardAtivo: { backgroundColor: '#E8F5E9', borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  cardInativo: { backgroundColor: '#fff' },
  nome: { fontSize: 18, fontWeight: 'bold' },
  posicao: { fontSize: 14, color: '#666' },
  checkIcon: { fontSize: 22 },
  vazio: { textAlign: 'center', marginTop: 50, color: '#999' }
});