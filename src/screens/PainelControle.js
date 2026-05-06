import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function PainelControle({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Preparação do Racha ⚙️</Text>
      
      {/* 1. Check-in */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#4CAF50' }]} 
        onPress={() => navigation.navigate('Checkin')}
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>✅</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#4CAF50' }]}>1. Check-in</Text>
          <Text style={styles.subtextoBotao}>Marcar quem veio jogar hoje</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Central do Sorteio (AQUI ENTRA A MUDANÇA) */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#9C27B0' }]} 
        onPress={() => navigation.navigate('FazerSorteio')}
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>🎲</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#9C27B0' }]}>2. Fazer Sorteio</Text>
          <Text style={styles.subtextoBotao}>Configurar times, sortear e visualizar</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Configurar Partida */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#2196F3' }]} 
        onPress={() => console.log('Indo para Configurar Partida')}
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>⏱️</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#2196F3' }]}>3. Configurar Partida</Text>
          <Text style={styles.subtextoBotao}>Definir tempo e limite de gols</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Iniciar Racha */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#F44336', marginTop: 20 }]} 
        onPress={() => console.log('Iniciando o Racha')}
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>🚀</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#F44336' }]}>4. Iniciar Racha</Text>
          <Text style={styles.subtextoBotao}>Ir para o placar e cronômetro</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

// Estilos continuam os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, marginTop: 10, textAlign: 'center', color: '#333' },
  botaoCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderLeftWidth: 6, alignItems: 'center' },
  iconContainer: { marginRight: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  icone: { fontSize: 26 },
  textoContainer: { flex: 1 },
  textoBotao: { fontSize: 18, fontWeight: 'bold' },
  subtextoBotao: { fontSize: 14, color: '#777', marginTop: 3 }
});