import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';

export default function PosJogo({ navigation }) {

  // 🛡️ BLOQUEIO DO GESTO DE VOLTAR DO CELULAR
  useEffect(() => {
    const backAction = () => {
      return true; // Impede voltar para a tela de estatísticas
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partida Encerrada! 🏁</Text>

      <TouchableOpacity style={[styles.card, {backgroundColor: '#2196F3'}]} onPress={() => navigation.navigate('PlacarCronometro')}>
        <Text style={styles.txt}>🎮 Próxima Partida (Fila)</Text>
      </TouchableOpacity>

      {/* ADICIONADO: O parâmetro { vindoDoJogo: true } para avisar o Painel */}
      <TouchableOpacity style={[styles.card, {backgroundColor: '#FF9800'}]} onPress={() => navigation.navigate('PainelControle', { vindoDoJogo: true })}>
        <Text style={styles.txt}>⚙️ Ajustar Times / Atrasados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, {backgroundColor: '#F44336'}]} onPress={() => navigation.navigate('Estatisticas')}>
        <Text style={styles.txt}>🏆 Encerrar Racha e Ver Ranking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  card: { padding: 25, borderRadius: 15, marginBottom: 20, elevation: 5 },
  txt: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});