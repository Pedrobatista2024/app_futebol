import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function ConfigurarPartida({ navigation }) {
  const [tempo, setTempo] = useState(10); // Padrão 10 minutos
  const [gols, setGols] = useState(2);    // Padrão 2 gols

  // Carrega as regras que já estão salvas no banco quando abre a tela
  useEffect(() => {
    const configSalva = JogadorService.getConfig();
    if (configSalva) {
      if (configSalva.tempo_partida) setTempo(configSalva.tempo_partida);
      if (configSalva.gols_partida) setGols(configSalva.gols_partida);
    }
  }, []);

  const handleSalvarRegras = () => {
    const sucesso = JogadorService.saveRegrasPartida(tempo, gols);
    
    if (sucesso) {
      Alert.alert("Sucesso", "Regras da partida definidas!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert("Erro", "Não foi possível salvar as regras.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Regras do Jogo ⏱️</Text>
      <Text style={styles.subtitulo}>Defina os limites para o fim da partida.</Text>

      {/* Controlador de Tempo */}
      <View style={styles.cardControle}>
        <Text style={styles.label}>Duração da Partida (Minutos):</Text>
        <Text style={styles.dica}>O jogo encerra quando o cronômetro zerar.</Text>
        
        <View style={styles.controles}>
          <TouchableOpacity style={styles.btnMenos} onPress={() => setTempo(Math.max(1, tempo - 1))}>
            <Text style={styles.txtBtn}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.numero}>{tempo}</Text>

          <TouchableOpacity style={styles.btnMais} onPress={() => setTempo(Math.min(90, tempo + 1))}>
            <Text style={styles.txtBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controlador de Gols */}
      <View style={styles.cardControle}>
        <Text style={styles.label}>Limite de Gols (Vitória Direta):</Text>
        <Text style={styles.dica}>O app avisa se um time atingir essa marca antes do tempo.</Text>
        
        <View style={styles.controles}>
          <TouchableOpacity style={styles.btnMenos} onPress={() => setGols(Math.max(1, gols - 1))}>
            <Text style={styles.txtBtn}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.numero}>{gols}</Text>

          <TouchableOpacity style={styles.btnMais} onPress={() => setGols(Math.min(20, gols + 1))}>
            <Text style={styles.txtBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarRegras}>
        <Text style={styles.txtSalvar}>Salvar Regras</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 26, fontWeight: 'bold', marginTop: 10, textAlign: 'center', color: '#333' },
  subtitulo: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 25 },
  
  cardControle: { backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center', elevation: 2, marginBottom: 20 },
  label: { fontSize: 18, color: '#333', fontWeight: 'bold', marginBottom: 5 },
  dica: { fontSize: 12, color: '#888', marginBottom: 20, textAlign: 'center' },
  
  controles: { flexDirection: 'row', alignItems: 'center' },
  btnMenos: { backgroundColor: '#FF5252', width: 55, height: 55, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center' },
  btnMais: { backgroundColor: '#4CAF50', width: 55, height: 55, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center' },
  txtBtn: { color: '#fff', fontSize: 35, fontWeight: 'bold', lineHeight: 40 },
  numero: { fontSize: 40, fontWeight: 'bold', marginHorizontal: 35, width: 60, textAlign: 'center' },
  
  btnSalvar: { backgroundColor: '#2196F3', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  txtSalvar: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});