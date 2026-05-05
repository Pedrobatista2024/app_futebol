import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aplicativo Racha ⚽</Text>
      
      <TouchableOpacity 
        style={styles.botaoCard} 
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.textoBotao}>👥 Gerenciar Jogadores</Text>
        <Text style={styles.subtextoBotao}>Cadastrar e ver lista global</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.botaoCard, { backgroundColor: '#4CAF50' }]} 
        onPress={() => console.log('Indo para o sorteio...')}
      >
        <Text style={[styles.textoBotao, { color: '#fff' }]}>📋 Iniciar Novo Racha</Text>
        <Text style={[styles.subtextoBotao, { color: '#E8F5E9' }]}>Fazer check-in e sortear times</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: '#333' },
  botaoCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  textoBotao: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  subtextoBotao: { fontSize: 14, color: '#666', marginTop: 5 }
});