import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { JogadorService } from '../services/jogadorService';

const CORES = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#212121', '#FF9800', '#FFFFFF'];

export default function PlacarCronometro({ navigation }) {
  const config = JogadorService.getConfig();
  
  const [proximos, setProximos] = useState(() => {
    const totalTimes = JogadorService.getFilaTimes().length || 2;
    return JogadorService.getProximoConfronto(totalTimes);
  });

  const [tempo, setTempo] = useState(config.tempo_partida * 60);
  const [rodando, setRodando] = useState(false);
  const [jogoIniciado, setJogoIniciado] = useState(false); 
  
  const [placarA, setPlacarA] = useState(0);
  const [placarB, setPlacarB] = useState(0);

  // NOVO: Guarda o placar anterior para podermos "desfazer" o clique errado
  const [placarAnterior, setPlacarAnterior] = useState({ a: 0, b: 0 });

  const timeA = { id: proximos.timeA, cor: CORES[proximos.timeA - 1] || '#999', nome: `Time ${proximos.timeA}` };
  const timeB = { id: proximos.timeB, cor: CORES[proximos.timeB - 1] || '#999', nome: `Time ${proximos.timeB}` };

  // 🛡️ BLOQUEIO DO GESTO DE VOLTAR DO CELULAR
  useEffect(() => {
    const backAction = () => {
      return true; // Retornar 'true' anula a ação nativa de voltar do celular
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Efeito do Cronômetro
  useEffect(() => {
    let intervalo;
    if (rodando && tempo > 0) {
      intervalo = setInterval(() => setTempo(prev => prev - 1), 1000);
    } else if (tempo === 0 && rodando) {
      setRodando(false);
      Alert.alert("Tempo Esgotado! ⏱️", "O tempo regulamentar acabou. Deseja registrar as estatísticas?", [
        { text: "Confirmar", onPress: () => finalizarJogo() }
      ]);
    }
    return () => clearInterval(intervalo);
  }, [rodando, tempo]);

  // Efeito de Limite de Gols (COM A CORREÇÃO DO LOOP)
  useEffect(() => {
    if (rodando && (placarA >= config.gols_partida || placarB >= config.gols_partida)) {
      setRodando(false); // Pausa o jogo imediatamente
      
      Alert.alert(
        "Limite de Gols Atingido! ⚽", 
        `O placar bateu o limite de ${config.gols_partida} gols. O que deseja fazer?`, 
        [
          { 
            text: "Ajustar Placar (Erro)", 
            onPress: () => {
              // Desfaz a ação voltando ao placar de 1 segundo atrás
              setPlacarA(placarAnterior.a);
              setPlacarB(placarAnterior.b);
              setRodando(true); // Volta a rolar a bola
            },
            style: 'cancel' 
          },
          { 
            text: "Encerrar Partida", 
            onPress: () => finalizarJogo() 
          }
        ]
      );
    }
  }, [placarA, placarB, rodando, config.gols_partida, placarAnterior]);

  const finalizarJogo = () => {
    navigation.navigate('RegistroEstatisticas', { 
        timeA, 
        timeB, 
        golsA: placarA, 
        golsB: placarB 
    });
  };

  // Trava de confirmação manual
  const confirmarEncerramentoManual = () => {
    Alert.alert(
      "Encerrar Partida? 🛑",
      "Tem certeza que deseja encerrar o jogo agora antes do tempo acabar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Encerrar", onPress: () => { setRodando(false); finalizarJogo(); } }
      ]
    );
  };

  // Alterar placar salvando o histórico para o "Ctrl+Z"
  const alterarPlacar = (time, operacao) => {
    if (!jogoIniciado) {
      Alert.alert("Atenção ⚠️", "Inicie o cronômetro para poder marcar gols!");
      return;
    }

    // Salva a "fotografia" do placar antes de mudar
    setPlacarAnterior({ a: placarA, b: placarB });

    if (time === 'A') {
      setPlacarA(prev => operacao === '+' ? prev + 1 : Math.max(0, prev - 1));
    } else if (time === 'B') {
      setPlacarB(prev => operacao === '+' ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const iniciarOuPausar = () => {
    if (!jogoIniciado) {
      setJogoIniciado(true); 
    }
    setRodando(!rodando);
  };

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cronometro}>{formatarTempo(tempo)}</Text>
      
      <View style={styles.placarContainer}>
        {/* TIME A */}
        <View style={styles.timeBox}>
          <Text style={styles.nomeTime}>{timeA.nome}</Text>
          <View style={[styles.bola, { backgroundColor: timeA.cor }]} />
          <Text style={styles.gols}>{placarA}</Text>
          <View style={styles.botoesPlacar}>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => alterarPlacar('A', '-')}>
              <Text style={styles.txtBtn}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => alterarPlacar('A', '+')}>
              <Text style={styles.txtBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.vs}>X</Text>

        {/* TIME B */}
        <View style={styles.timeBox}>
          <Text style={styles.nomeTime}>{timeB.nome}</Text>
          <View style={[styles.bola, { backgroundColor: timeB.cor }]} />
          <Text style={styles.gols}>{placarB}</Text>
          <View style={styles.botoesPlacar}>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => alterarPlacar('B', '-')}>
              <Text style={styles.txtBtn}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => alterarPlacar('B', '+')}>
              <Text style={styles.txtBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.btnStart, rodando && { backgroundColor: '#FF9800' }]} 
        onPress={iniciarOuPausar}
      >
        <Text style={styles.txtBtnStart}>{rodando ? "PAUSAR CRONÔMETRO" : "INICIAR JOGO"}</Text>
      </TouchableOpacity>

      {/* Botão de Encerrar visível sempre que o jogo já tiver começado */}
      {jogoIniciado && (
        <TouchableOpacity style={styles.btnEncerrarForcado} onPress={confirmarEncerramentoManual}>
          <Text style={styles.txtBtnEncerrar}>Encerrar e Ir para Estatísticas ➡️</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  cronometro: { fontSize: 80, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  
  placarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 50 },
  timeBox: { alignItems: 'center', width: 120 },
  nomeTime: { color: '#ccc', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  bola: { width: 30, height: 30, borderRadius: 15, marginBottom: 10 },
  gols: { fontSize: 60, fontWeight: 'bold', color: '#fff' },
  
  vs: { fontSize: 30, color: '#666', marginHorizontal: 20, marginTop: 30 },
  
  botoesPlacar: { flexDirection: 'row', marginTop: 10 },
  btnPequeno: { backgroundColor: '#333', width: 50, height: 50, marginHorizontal: 5, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  txtBtn: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  btnStart: { backgroundColor: '#4CAF50', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 10, width: '80%', alignItems: 'center' },
  txtBtnStart: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Estilização do botão de Encerrar de forma que chame a atenção sem ser invasivo
  btnEncerrarForcado: { marginTop: 40, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#F44336', borderRadius: 8 },
  txtBtnEncerrar: { color: '#F44336', fontSize: 14, fontWeight: 'bold' }
});