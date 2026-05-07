import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function EstatisticasGeraisHub({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Painel de Dados 📊</Text>
      
      {/* CARD 1: PERFIL DO RACHA */}
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: '#4CAF50' }]} 
        onPress={() => navigation.navigate('PerfilRacha')}
      >
        <Text style={styles.cardIcon}>🏟️</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Perfil do Racha</Text>
          <Text style={styles.cardDesc}>Números totais do grupo: gols, partidas e saúde da pelada.</Text>
        </View>
      </TouchableOpacity>

      {/* CARD 2: PERFIL DO JOGADOR */}
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: '#2196F3' }]} 
        onPress={() => navigation.navigate('PerfilJogador')}
      >
        <Text style={styles.cardIcon}>👤</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Perfil do Jogador</Text>
          <Text style={styles.cardDesc}>Consulte o histórico acumulado e as conquistas de cada atleta.</Text>
        </View>
      </TouchableOpacity>

      {/* CARD 3: RANKINGS */}
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: '#FF9800' }]} 
        onPress={() => navigation.navigate('RankingsGerais')}
      >
        <Text style={styles.cardIcon}>🏆</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Rankings</Text>
          <Text style={styles.cardDesc}>Top 10: Maiores Artilheiros, Garçons e Muralhas (Goleiros).</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center' },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 20, 
    alignItems: 'center',
    elevation: 3,
    borderLeftWidth: 8
  },
  cardIcon: { fontSize: 35, marginRight: 20 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 4 }
});