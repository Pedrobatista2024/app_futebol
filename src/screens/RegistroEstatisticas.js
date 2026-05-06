import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function RegistroEstatisticas({ route, navigation }) {
  const { placarA, placarB, timeA, timeB } = route.params;
  const [jogadoresA] = useState(JogadorService.getJogadoresPorTime(timeA.id));
  const [jogadoresB] = useState(JogadorService.getJogadoresPorTime(timeB.id));

  // Simulação de registro de gols (precisaria de uma tabela no DB para persistir)
  const handleSalvar = () => {
    Alert.alert("Sucesso", "Estatísticas salvas!");
    navigation.navigate('PosJogo');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Quem fez os gols? ⚽</Text>
      
      <Text style={styles.timeNome}>Time {timeA.id} ({placarA} gols)</Text>
      {jogadoresA.map(j => (
        <View key={j.id} style={styles.item}>
            <Text>{j.nome}</Text>
            <View style={{flexDirection: 'row'}}><Button title="+" onPress={() => {}} /></View>
        </View>
      ))}

      <TouchableOpacity style={styles.btnSalvar} onPress={() => navigation.navigate('PosJogo')}>
        <Text style={styles.txtSalvar}>Salvar e Continuar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('PosJogo')}>
        <Text style={{color: '#666', textAlign: 'center', marginTop: 15}}>Pular Estatísticas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    timeNome: { fontSize: 18, fontWeight: 'bold', marginTop: 20, backgroundColor: '#eee', padding: 5 },
    item: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    btnSalvar: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginTop: 30 },
    txtSalvar: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});