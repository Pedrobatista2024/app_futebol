import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PosJogo({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Fim da Partida! 🏁</Text>

      <TouchableOpacity style={[styles.card, {backgroundColor: '#2196F3'}]} onPress={() => navigation.navigate('PlacarCronometro')}>
        <Text style={styles.txt}>Ir para Próximo Jogo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, {backgroundColor: '#FF9800'}]} onPress={() => navigation.navigate('PainelControle')}>
        <Text style={styles.txt}>Voltar ao Painel (Ajustar Times)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, {backgroundColor: '#F44336'}]} onPress={() => navigation.navigate('Estatisticas')}>
        <Text style={styles.txt}>Finalizar Racha (Relatório)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  card: { padding: 20, borderRadius: 10, marginBottom: 20 },
  txt: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});