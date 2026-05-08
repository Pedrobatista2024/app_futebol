import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function DetalheJogador({ route }) {
  const { jogadorId } = route.params;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const dados = JogadorService.getStatsJogador(jogadorId);
    setStats(dados);
  }, [jogadorId]);

  if (!stats) return <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {stats.foto_uri ? (
          <Image source={{ uri: stats.foto_uri }} style={styles.foto} />
        ) : (
          <View style={[styles.fotoPlaceholder, { backgroundColor: stats.posicao === 'Goleiro' ? '#FF9800' : '#2196F3' }]}>
            <Text style={styles.fotoTxt}>{stats.nome.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.nome}>{stats.nome}</Text>
        <Text style={styles.posicao}>{stats.posicao}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.gols}</Text>
            <Text style={styles.boxLab}>GOLS</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.assistencias}</Text>
            <Text style={styles.boxLab}>ASSISTÊNCIAS</Text>
          </View>
          <View style={[styles.box, { backgroundColor: '#ffebee' }]}>
            <Text style={[styles.boxVal, { color: '#d32f2f' }]}>{stats.gols_contra}</Text>
            <Text style={[styles.boxLab, { color: '#d32f2f' }]}>GOLS CONTRA 🤡</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.partidas}</Text>
            <Text style={styles.boxLab}>PARTIDAS</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.vitorias}</Text>
            <Text style={styles.boxLab}>VITÓRIAS</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.empates}</Text>
            <Text style={styles.boxLab}>EMPATES</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxVal}>{stats.derrotas}</Text>
            <Text style={styles.boxLab}>DERROTAS</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfc' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#fafcf9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  foto: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, borderWidth: 3, borderColor: '#4CAF50' },
  fotoPlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  fotoTxt: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  nome: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  posicao: { fontSize: 16, color: '#666' },
  statsContainer: { padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  box: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, elevation: 2 },
  boxVal: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50' },
  boxLab: { fontSize: 10, color: '#999', marginTop: 5, fontWeight: 'bold', textAlign: 'center' }
});