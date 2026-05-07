import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function DetalheJogador({ route }) {
  const { jogadorId } = route.params;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const dados = JogadorService.getStatsJogador(jogadorId);
    setStats(dados);
  }, [jogadorId]);

  if (!stats) return null;

  const StatCard = ({ label, value, color }) => (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: color || '#333' }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.nome}>{stats.nome}</Text>
        <Text style={styles.posicao}>{stats.posicao}</Text>
      </View>

      <View style={styles.grid}>
        <StatCard label="Gols Marcados" value={stats.gols} color="#4CAF50" />
        <StatCard label="Assistências" value={stats.assistencias} color="#2196F3" />
        <StatCard label="Total de Jogos" value={stats.partidas} color="#9C27B0" />
        {/* Espaços reservados para V/D/E */}
        <StatCard label="Vitórias" value="--" color="#4CAF50" />
        <StatCard label="Derrotas" value="--" color="#F44336" />
        <StatCard label="Empates" value="--" color="#FF9800" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 30, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  nome: { fontSize: 28, fontWeight: 'bold', color: '#1c1c1e' },
  posicao: { fontSize: 16, color: '#8e8e93', marginTop: 5, textTransform: 'uppercase' },
  grid: { padding: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 2 },
  label: { fontSize: 12, color: '#666', fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  value: { fontSize: 24, fontWeight: 'bold' }
});