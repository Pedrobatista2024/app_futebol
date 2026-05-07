import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function PerfilJogador({ navigation }) {
  const [jogadores, setJogadores] = useState([]);
  const [busca, setBusca] = useState('');

  // Carrega os jogadores sempre que a tela ganha foco
  useEffect(() => {
    const carregarJogadores = () => {
      const lista = JogadorService.findAll();
      setJogadores(lista);
    };

    const unsubscribe = navigation.addListener('focus', carregarJogadores);
    return unsubscribe;
  }, [navigation]);

  // Lógica de filtro para a busca por nome
  const jogadoresFiltrados = jogadores.filter(j => 
    j.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderJogadorCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DetalheJogador', { jogadorId: item.id })}
    >
      <View style={[styles.avatar, { backgroundColor: item.posicao === 'Goleiro' ? '#FF9800' : '#2196F3' }]}>
        <Text style={styles.avatarTxt}>{item.nome.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.posicao}>{item.posicao}</Text>
      </View>

      <View style={styles.setaContainer}>
        <Text style={styles.seta}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalTxt}>{jogadores.length} Jogadores Cadastrados</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Pesquisar atleta..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <FlatList
        data={jogadoresFiltrados}
        keyExtractor={item => item.id.toString()}
        renderItem={renderJogadorCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTxt}>Nenhum jogador encontrado ⚽</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  totalTxt: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: 'bold' },
  searchBar: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
  list: { padding: 15, paddingBottom: 30 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 12, 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  info: { flex: 1 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1e' },
  posicao: { fontSize: 14, color: '#8e8e93', marginTop: 2 },
  setaContainer: { marginLeft: 10 },
  seta: { fontSize: 28, color: '#c7c7cc', fontWeight: '300' },
  vazio: { alignItems: 'center', marginTop: 50 },
  vazioTxt: { color: '#999', fontSize: 16 }
});