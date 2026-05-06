import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService'; // <-- IMPORTANTE: Puxando o motor do banco!

export default function FazerSorteio({ navigation }) {
  // Estado que controla se o sorteio já foi feito ou não
  const [sorteioRealizado, setSorteioRealizado] = useState(false);

  // Função que chama o banco de dados e executa o sorteio real
  const handleExecutarSorteio = () => {
    const ok = JogadorService.executarSorteio();
    
    if (ok) {
      Alert.alert("Sucesso!", "Times sorteados! Agora você pode visualizar os elencos.");
      setSorteioRealizado(true); // Libera o botão verde de Visualizar
    } else {
      Alert.alert("Erro", "Não foi possível realizar o sorteio. Verifique se há jogadores presentes no Check-in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Central do Sorteio 🎲</Text>

      {/* 1. Configurar Estrutura */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#FF9800' }]} 
        onPress={() => navigation.navigate('ConfigurarEstrutura')} 
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>👕</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#FF9800' }]}>Configurar Estrutura</Text>
          <Text style={styles.subtextoBotao}>Qtd de times, vagas e cores</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Executar Sorteio */}
      <TouchableOpacity 
        style={[styles.botaoCard, { borderLeftColor: '#9C27B0' }]} 
        onPress={handleExecutarSorteio}
      >
        <View style={styles.iconContainer}><Text style={styles.icone}>🎰</Text></View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: '#9C27B0' }]}>Executar Sorteio</Text>
          <Text style={styles.subtextoBotao}>Distribuir jogadores presentes</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Visualizar Times (Só libera após sortear) */}
      <TouchableOpacity 
        style={[
          styles.botaoCard, 
          { borderLeftColor: sorteioRealizado ? '#4CAF50' : '#ccc' },
          !sorteioRealizado && styles.cardDesabilitado // Aplica opacidade se não sorteou
        ]} 
        onPress={() => navigation.navigate('VisualizarTimes')} // <-- Rota conectada!
        disabled={!sorteioRealizado} // Bloqueia o clique nativamente
      >
        <View style={[styles.iconContainer, !sorteioRealizado && { backgroundColor: '#eee' }]}>
            <Text style={styles.icone}>👀</Text>
        </View>
        <View style={styles.textoContainer}>
          <Text style={[styles.textoBotao, { color: sorteioRealizado ? '#4CAF50' : '#999' }]}>Visualizar Times</Text>
          <Text style={styles.subtextoBotao}>Ver elencos e preencher vagas</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, marginTop: 10, textAlign: 'center', color: '#333' },
  
  botaoCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderLeftWidth: 6, alignItems: 'center' },
  
  // Estilo aplicado quando o botão está bloqueado
  cardDesabilitado: { opacity: 0.5, elevation: 0 },

  iconContainer: { marginRight: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  icone: { fontSize: 26 },
  textoContainer: { flex: 1 },
  textoBotao: { fontSize: 18, fontWeight: 'bold' },
  subtextoBotao: { fontSize: 14, color: '#777', marginTop: 3 }
});