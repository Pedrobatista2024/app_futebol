import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // NOVO: Ajuda a atualizar a tela quando voltamos pra ela
import { JogadorService } from '../services/jogadorService';

export default function FazerSorteio({ navigation }) {
  const [sorteioRealizado, setSorteioRealizado] = useState(false);
  const isFocused = useIsFocused(); // Detecta se o usuário está nesta tela

  // Confere se já existe um sorteio salvo no banco sempre que entra na tela
  useEffect(() => {
    if (isFocused) {
      const temTimeFormado = JogadorService.verificarSorteioRealizado();
      setSorteioRealizado(temTimeFormado);
    }
  }, [isFocused]);

  // Função que realmente vai no banco e sorteia
  const executarSorteioReal = () => {
    const ok = JogadorService.executarSorteio();
    if (ok) {
      Alert.alert("Sucesso!", "Times sorteados! Agora você pode visualizar os elencos.");
      setSorteioRealizado(true);
    } else {
      Alert.alert("Erro", "Não foi possível realizar o sorteio. Verifique se há jogadores ativos no Check-in.");
    }
  };

  // Função do Botão (Com a sua trava de segurança)
  const handleExecutarSorteio = () => {
    if (sorteioRealizado) {
      Alert.alert(
        "Sorteio já realizado! ⚠️",
        "Você já tem times formados. Se sortear novamente, a estrutura atual será apagada e os times refeitos. Tem certeza?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, refazer sorteio", onPress: executarSorteioReal }
        ]
      );
    } else {
      executarSorteioReal(); // Se não tem sorteio ainda, vai direto
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Central do Sorteio 🎲</Text>

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

      {/* Botão de Sorteio com a Trava */}
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

      <TouchableOpacity 
        style={[
          styles.botaoCard, 
          { borderLeftColor: sorteioRealizado ? '#4CAF50' : '#ccc' },
          !sorteioRealizado && styles.cardDesabilitado 
        ]} 
        onPress={() => navigation.navigate('VisualizarTimes')} 
        disabled={!sorteioRealizado} 
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
  cardDesabilitado: { opacity: 0.5, elevation: 0 },
  iconContainer: { marginRight: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  icone: { fontSize: 26 },
  textoContainer: { flex: 1 },
  textoBotao: { fontSize: 18, fontWeight: 'bold' },
  subtextoBotao: { fontSize: 14, color: '#777', marginTop: 3 }
});