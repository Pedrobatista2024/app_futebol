import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('Jogador');
  const [jogadores, setJogadores] = useState([]);
  
  // NOVO: Estado para saber se estamos editando alguém
  const [editandoId, setEditandoId] = useState(null); 

  const carregarJogadores = () => {
    setJogadores(JogadorService.findAll());
  };

  useEffect(() => {
    carregarJogadores();
  }, []);

  const handleSalvar = () => {
    if (nome.trim() === '') {
      Alert.alert('Erro', 'Por favor, digite o nome do jogador.');
      return; 
    }
    
    let sucesso;
    // Se tiver um ID no estado editando, ele atualiza. Se não, ele cria um novo.
    if (editandoId) {
      sucesso = JogadorService.update(editandoId, nome, posicao);
    } else {
      sucesso = JogadorService.create(nome, posicao);
    }
    
    if (sucesso) {
      setNome(''); 
      setPosicao('Jogador'); 
      setEditandoId(null); // Sai do modo edição
      carregarJogadores(); 
    } else {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  // NOVO: Puxa os dados do jogador de volta pro Input
  const handleEditar = (jogador) => {
    setNome(jogador.nome);
    setPosicao(jogador.posicao);
    setEditandoId(jogador.id);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do peladeiro..."
        value={nome}
        onChangeText={setNome}
      />

      <View style={styles.posicaoContainer}>
        <TouchableOpacity 
          style={[styles.btnPosicao, posicao === 'Jogador' && styles.btnAtivo]}
          onPress={() => setPosicao('Jogador')}
        >
          <Text style={[styles.textoPosicao, posicao === 'Jogador' && styles.textoAtivo]}>Jogador</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnPosicao, posicao === 'Goleiro' && styles.btnAtivoGoleiro]}
          onPress={() => setPosicao('Goleiro')}
        >
          <Text style={[styles.textoPosicao, posicao === 'Goleiro' && styles.textoAtivo]}>Goleiro</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botão muda de cor e texto dependendo se está editando ou não */}
      <Button 
        title={editandoId ? "Atualizar Jogador" : "Salvar Jogador"} 
        onPress={handleSalvar} 
        color={editandoId ? "#FF9800" : "#2196F3"} 
      />

      {/* Botão extra para cancelar a edição caso o usuário desista */}
      {editandoId && (
        <TouchableOpacity style={styles.btnCancelar} onPress={() => { setEditandoId(null); setNome(''); }}>
            <Text style={styles.textoCancelar}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.subtitle}>Cadastrados ({jogadores.length}):</Text>
      
      <FlatList
        data={jogadores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            
            <View style={styles.infoContainer}>
                <Text style={styles.itemText}>{item.nome}</Text>
                <Text style={[styles.badge, item.posicao === 'Goleiro' ? styles.badgeGoleiro : styles.badgeJogador]}>
                {item.posicao}
                </Text>
            </View>

            {/* Botoes de Ação ao lado do nome */}
            <View style={styles.acoesContainer}>
                <TouchableOpacity style={styles.btnAcao} onPress={() => handleEditar(item)}>
                    <Text style={styles.iconeAcao}>✏️</Text>
                </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff', fontSize: 16 },
  
  posicaoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  btnPosicao: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#fff' },
  btnAtivo: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }, 
  btnAtivoGoleiro: { backgroundColor: '#FF9800', borderColor: '#FF9800' }, 
  textoPosicao: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  textoAtivo: { color: '#fff' },

  btnCancelar: { marginTop: 10, alignItems: 'center', padding: 10 },
  textoCancelar: { color: '#F44336', fontWeight: 'bold' },

  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 5 },
  infoContainer: { flex: 1 },
  itemText: { fontSize: 16, color: '#333', fontWeight: 'bold', marginBottom: 5 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden', alignSelf: 'flex-start' },
  badgeJogador: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  badgeGoleiro: { backgroundColor: '#FFF3E0', color: '#E65100' },

  acoesContainer: { flexDirection: 'row' },
  btnAcao: { padding: 10, marginLeft: 5, backgroundColor: '#f9f9f9', borderRadius: 8 },
  iconeAcao: { fontSize: 16 }
});