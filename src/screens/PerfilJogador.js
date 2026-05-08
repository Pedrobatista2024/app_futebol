import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
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
      {item.foto_uri ? (
        <Image source={{ uri: item.foto_uri }} style={styles.avatarImage} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: item.posicao === 'Goleiro' ? '#FF9800' : '#2196F3' }]}>
          <Text style={styles.avatarTxt}>{item.nome.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      
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

      {/* 🔴 NOVO: BOTÃO FLUTUANTE PARA GERAR O PÔSTER DO ELENCO */}
      <TouchableOpacity 
        style={styles.fabElenco} 
        onPress={() => navigation.navigate('ElencoCard')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTxt}>Gerar Pôster do Elenco 🖼️</Text>
      </TouchableOpacity>
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
  list: { padding: 15, paddingBottom: 100 }, // Aumentado para não cobrir o último card
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
  avatarImage: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  info: { flex: 1 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1e' },
  posicao: { fontSize: 14, color: '#8e8e93', marginTop: 2 },
  setaContainer: { marginLeft: 10 },
  seta: { fontSize: 28, color: '#c7c7cc', fontWeight: '300' },
  vazio: { alignItems: 'center', marginTop: 50 },
  vazioTxt: { color: '#999', fontSize: 16 },

  // 🔴 ESTILO DO BOTÃO FLUTUANTE
  fabElenco: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20, // Faz o botão ficar centralizado e larguinho como uma pílula
    backgroundColor: '#4CAF50', // Verde Racha
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabTxt: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});