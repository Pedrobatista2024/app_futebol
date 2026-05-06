import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function PlacarCronometro({ navigation }) {
  const config = JogadorService.getConfig();
  const [tempo, setTempo] = useState(config.tempo_partida * 60); // Converte para segundos
  const [rodando, setRodando] = useState(false);
  const [placarA, setPlacarA] = useState(0);
  const [placarB, setPlacarB] = useState(0);

  // Times em campo (Sempre os dois primeiros no início do racha)
  const [timeA] = useState({ id: 1, cor: '#F44336', nome: 'Time 1' });
  const [timeB] = useState({ id: 2, cor: '#2196F3', nome: 'Time 2' });

  useEffect(() => {
    let intervalo;
    if (rodando && tempo > 0) {
      intervalo = setInterval(() => setTempo(prev => prev - 1), 1000);
    } else if (tempo === 0) {
      setRodando(false);
      finalizarJogo();
    }
    return () => clearInterval(intervalo);
  }, [rodando, tempo]);

  // Regra de Gols Maximos
  useEffect(() => {
    if (placarA >= config.gols_partida || placarB >= config.gols_partida) {
      setRodando(false);
      Alert.alert("Limite de Gols!", "O limite de gols foi atingido. Encerrar partida?", [
        { text: "Continuar", onPress: () => setRodando(true) },
        { text: "Encerrar", onPress: () => finalizarJogo() }
      ]);
    }
  }, [placarA, placarB]);

  const finalizarJogo = () => {
    navigation.navigate('RegistroEstatisticas', { 
        placarA, placarB, timeA, timeB 
    });
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
          <View style={[styles.bola, { backgroundColor: timeA.cor }]} />
          <Text style={styles.gols}>{placarA}</Text>
          <View style={styles.botoesPlacar}>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => setPlacarA(prev => Math.max(0, prev - 1))}><Text style={styles.txtBtn}>-</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => setPlacarA(prev => prev + 1)}><Text style={styles.txtBtn}>+</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.vs}>X</Text>

        {/* TIME B */}
        <View style={styles.timeBox}>
          <View style={[styles.bola, { backgroundColor: timeB.cor }]} />
          <Text style={styles.gols}>{placarB}</Text>
          <View style={styles.botoesPlacar}>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => setPlacarB(prev => Math.max(0, prev - 1))}><Text style={styles.txtBtn}>-</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnPequeno} onPress={() => setPlacarB(prev => prev + 1)}><Text style={styles.txtBtn}>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.btnStart, rodando && {backgroundColor: '#FF9800'}]} onPress={() => setRodando(!rodando)}>
        <Text style={styles.txtBtn}>{rodando ? "PAUSAR" : "INICIAR JOGO"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  cronometro: { fontSize: 80, fontWeight: 'bold', color: '#fff', marginBottom: 50 },
  placarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 60 },
  timeBox: { alignItems: 'center', width: 120 },
  bola: { width: 30, height: 30, borderRadius: 15, marginBottom: 10 },
  gols: { fontSize: 60, fontWeight: 'bold', color: '#fff' },
  vs: { fontSize: 30, color: '#666', marginHorizontal: 20 },
  botoesPlacar: { flexDirection: 'row', marginTop: 10 },
  btnPequeno: { backgroundColor: '#333', padding: 15, marginHorizontal: 5, borderRadius: 5 },
  btnStart: { backgroundColor: '#4CAF50', paddingVertical: 20, paddingHorizontal: 60, borderRadius: 10 },
  txtBtn: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});