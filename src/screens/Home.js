import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Home({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aplicativo Racha ⚽</Text>
      
      {/* Card 1: Gerenciar Jogadores (Azul) */}
      <TouchableOpacity 
        style={styles.botaoCard} 
        onPress={() => navigation.navigate('Cadastro')}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icone}>👥</Text>
        </View>
        <View style={styles.textoContainer}>
          <Text style={styles.textoBotao}>Gerenciar Jogadores</Text>
          <Text style={styles.subtextoBotao}>Cadastrar, editar e excluir</Text>
        </View>
      </TouchableOpacity>

      {/* Card 2: Iniciar Novo Racha (Verde) */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#4CAF50' }]} 
        onPress={() => navigation.navigate('PainelControle')} // <-- ALTERE APENAS ESSA LINHA
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icone}>📋</Text>
        </View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#4CAF50' }]}>Iniciar Novo Racha</Text>
          <Text style={styles.subtextoBotao}>Lista de presença e sorteio</Text>
        </View>
      </TouchableOpacity>

      {/* NOVO - Card 3: Estatísticas (Roxo) */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#9C27B0' }]} 
        onPress={() => navigation.navigate('EstatisticasGeraisHub')}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icone}>📊</Text>
        </View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#9C27B0' }]}>Estatísticas Gerais Futeboleiros</Text>
          <Text style={styles.subtextoBotao}>Artilharia, rankings e histórico</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, marginTop: 40, textAlign: 'center', color: '#333' },
  
  botaoCard: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#2196F3', // Cor padrão azul para o primeiro card
    alignItems: 'center'
  },
  
  iconContainer: {
    marginRight: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10
  },
  
  icone: { fontSize: 30 },
  
  textoContainer: { flex: 1 },
  
  textoBotao: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  
  subtextoBotao: { fontSize: 14, color: '#777', marginTop: 3 }
});