import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { JogadorService } from '../services/jogadorService';

const CORES_TIMES = [
  { id: 1, nome: 'Vermelho', hex: '#F44336' },
  { id: 2, nome: 'Azul', hex: '#2196F3' },
  { id: 3, nome: 'Amarelo', hex: '#FFEB3B' },
  { id: 4, nome: 'Verde', hex: '#4CAF50' },
  { id: 5, nome: 'Preto', hex: '#212121' },
  { id: 6, nome: 'Laranja', hex: '#FF9800' },
  { id: 7, nome: 'Branco', hex: '#FFFFFF' },
];

export default function ConfigurarEstrutura({ navigation }) {
  const [jogadoresPorTime, setJogadoresPorTime] = useState(5);
  const [contaGoleiro, setContaGoleiro] = useState(true);
  
  const [totalLinha, setTotalLinha] = useState(0);
  const [totalGoleiros, setTotalGoleiros] = useState(0);

  // NOVO: Carregar dados do banco assim que a tela abrir
  useEffect(() => {
    // 1. Busca a configuração que já existe no banco
    const configSalva = JogadorService.getConfig();
    if (configSalva) {
      setJogadoresPorTime(configSalva.jogadores_por_time);
      setContaGoleiro(configSalva.conta_goleiro === 1);
    }

    // 2. Busca os jogadores presentes para o Raio-X
    const presentes = JogadorService.findAll().filter(j => j.presente === 1);
    const linha = presentes.filter(j => j.posicao === 'Jogador').length;
    const goleiros = presentes.filter(j => j.posicao === 'Goleiro').length;
    
    setTotalLinha(linha);
    setTotalGoleiros(goleiros);
  }, []);

  // CÁLCULOS AUTOMÁTICOS
  const numTimes = totalLinha > 0 ? Math.ceil(totalLinha / jogadoresPorTime) : 0;
  const vagasFantasmasLinha = (numTimes * jogadoresPorTime) - totalLinha;
  const vagasFantasmasGoleiro = contaGoleiro ? Math.max(0, numTimes - totalGoleiros) : 0;
  const timesAtivos = CORES_TIMES.slice(0, numTimes);

  // NOVO: Função para salvar de verdade no banco de dados
  const handleSalvarPermanente = () => {
    const sucesso = JogadorService.saveConfig(jogadoresPorTime, contaGoleiro);
    
    if (sucesso) {
      Alert.alert("Sucesso", "Configuração salva! Agora você pode realizar o sorteio.", [
        { text: "OK", onPress: () => navigation.goBack() } // Volta para a central de sorteio
      ]);
    } else {
      Alert.alert("Erro", "Não foi possível salvar no banco.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Configurar Equipes 👕</Text>

      <View style={styles.cardControle}>
        <View style={styles.linhaSwitch}>
          <View style={styles.textosSwitch}>
            <Text style={styles.labelSwitch}>Goleiros entram no sorteio?</Text>
            <Text style={styles.subLabelSwitch}>Fixa 1 goleiro por time</Text>
          </View>
          <Switch 
            value={contaGoleiro} 
            onValueChange={setContaGoleiro} 
            thumbColor={contaGoleiro ? '#4CAF50' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#A5D6A7' }}
          />
        </View>

        <View style={styles.divisor} />

        <Text style={styles.label}>Jogadores de Linha por Time:</Text>
        <View style={styles.controles}>
          <TouchableOpacity 
            style={styles.btnMenos} 
            onPress={() => setJogadoresPorTime(Math.max(2, jogadoresPorTime - 1))}
          >
            <Text style={styles.txtBtn}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.numero}>{jogadoresPorTime}</Text>

          <TouchableOpacity 
            style={styles.btnMais} 
            onPress={() => setJogadoresPorTime(Math.min(10, jogadoresPorTime + 1))}
          >
            <Text style={styles.txtBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Painel Raio-X */}
      <View style={styles.resumoPainel}>
        <Text style={styles.resumoTitulo}>Resumo da Estrutura</Text>
        <View style={styles.resumoGrid}>
            <View style={styles.resumoBox}>
                <Text style={styles.resumoValor}>{totalLinha}</Text>
                <Text style={styles.resumoNome}>Ativos Linha</Text>
            </View>
            
            {/* ADICIONADO: Quadrado dos Goleiros */}
            <View style={styles.resumoBox}>
                <Text style={[styles.resumoValor, {color: '#E65100'}]}>{totalGoleiros}</Text>
                <Text style={styles.resumoNome}>Ativos Goleiro</Text>
            </View>

            <View style={styles.resumoBox}>
                <Text style={[styles.resumoValor, {color: '#9C27B0'}]}>{numTimes}</Text>
                <Text style={styles.resumoNome}>Times</Text>
            </View>

            <View style={styles.resumoBox}>
                <Text style={[styles.resumoValor, {color: '#F44336'}]}>{vagasFantasmasLinha}</Text>
                <Text style={styles.resumoNome}>Vagas Vazio</Text>
            </View>
        </View>
      </View>

      <Text style={styles.subtitulo}>Lista de Times:</Text>
      {timesAtivos.map(time => (
        <View key={time.id} style={[styles.timeItem, { borderLeftColor: time.hex }]}>
          <Text style={styles.timeTexto}>Time {time.id} - {time.nome}</Text>
          <Text style={styles.timeVagas}>
            {jogadoresPorTime} Linha {contaGoleiro ? '+ 1 Goleiro' : ''}
          </Text>
        </View>
      ))}

      {/* BOTÃO ATUALIZADO AQUI */}
      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarPermanente}>
        <Text style={styles.txtSalvar}>Salvar Estrutura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  cardControle: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  linhaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  textosSwitch: { flex: 1 },
  labelSwitch: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subLabelSwitch: { fontSize: 12, color: '#777' },
  divisor: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 15 },
  label: { fontSize: 16, color: '#666', marginBottom: 10, fontWeight: 'bold' },
  controles: { flexDirection: 'row', alignItems: 'center' },
  btnMenos: { backgroundColor: '#FF5252', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnMais: { backgroundColor: '#4CAF50', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  txtBtn: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  numero: { fontSize: 35, fontWeight: 'bold', marginHorizontal: 30 },
  resumoPainel: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 15, marginVertical: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  resumoTitulo: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#1565C0', marginBottom: 10 },
  resumoGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  resumoBox: { alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, width: '23%' },
  resumoValor: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  resumoNome: { fontSize: 10, color: '#666', textAlign: 'center' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  timeItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeTexto: { fontSize: 16, fontWeight: 'bold' },
  timeVagas: { fontSize: 12, color: '#777', fontWeight: 'bold' },
  btnSalvar: { backgroundColor: '#2196F3', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  txtSalvar: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});