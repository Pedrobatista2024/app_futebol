import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler, Image } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function RegistroEstatisticas({ route, navigation }) {
  const { timeA, timeB, golsA, golsB } = route.params;
  
  const [estA, setEstA] = useState(JogadorService.getJogadoresPorTime(timeA.id).map(j => ({ jogador_id: j.id, nome: j.nome, foto_uri: j.foto_uri, gols: 0, assistencias: 0, gols_contra: 0 })));
  const [estB, setEstB] = useState(JogadorService.getJogadoresPorTime(timeB.id).map(j => ({ jogador_id: j.id, nome: j.nome, foto_uri: j.foto_uri, gols: 0, assistencias: 0, gols_contra: 0 })));

  const [semAutorA, setSemAutorA] = useState(0);
  const [semAutorB, setSemAutorB] = useState(0);

  // Estados para a regra de Pênaltis (3 times ou menos)
  const [vencedorPenaltis, setVencedorPenaltis] = useState(null);
  const [totalTimesAtivos, setTotalTimesAtivos] = useState(0);

  useEffect(() => {
    // Bloqueio do botão voltar
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Verifica quantos times estão participando do racha hoje
    const jogadoresAtivos = JogadorService.findAll().filter(j => j.time_id > 0);
    const idsTimes = [...new Set(jogadoresAtivos.map(j => j.time_id))];
    setTotalTimesAtivos(idsTimes.length);

    return () => backHandler.remove();
  }, []);

  const isEmpate = golsA === golsB;
  const precisaDecisaoManual = isEmpate && totalTimesAtivos <= 3;

  // Matemática de Gols e Assistências
  const currentGolsA = estA.reduce((s, j) => s + j.gols, 0) + estB.reduce((s, j) => s + j.gols_contra, 0) + semAutorA;
  const currentGolsB = estB.reduce((s, j) => s + j.gols, 0) + estA.reduce((s, j) => s + j.gols_contra, 0) + semAutorB;
  const validGolsA = golsA - estB.reduce((s, j) => s + j.gols_contra, 0);
  const validGolsB = golsB - estA.reduce((s, j) => s + j.gols_contra, 0);
  const currentAssistsA = estA.reduce((s, j) => s + j.assistencias, 0);
  const currentAssistsB = estB.reduce((s, j) => s + j.assistencias, 0);

  const update = (set, lista, id, field, val) => {
    set(lista.map(item => item.jogador_id === id ? { ...item, [field]: Math.max(0, item[field] + val) } : item));
  };

  const salvar = () => {
    if (currentGolsA !== golsA || currentGolsB !== golsB) {
      Alert.alert("Soma Incorreta ⚠️", `Justifique os gols do placar.\n\nTime ${timeA.nome}: ${currentGolsA}/${golsA}\nTime ${timeB.nome}: ${currentGolsB}/${golsB}`);
      return;
    }

    if (precisaDecisaoManual && !vencedorPenaltis) {
      Alert.alert("Decisão por Pênaltis 🧤", "Em rachas com 3 times ou menos, o empate exige um vencedor nos pênaltis. Selecione quem venceu abaixo.");
      return;
    }

    const sucesso = JogadorService.encerrarPartidaCompleto(
        { time_a_id: timeA.id, time_b_id: timeB.id, gols_a: golsA, gols_b: golsB }, 
        estA, 
        estB,
        vencedorPenaltis // Envia o vencedor manual se houver
    );

    if(sucesso) navigation.navigate('PosJogo');
    else Alert.alert("Erro", "Falha ao salvar estatísticas.");
  };

  const handlePular = () => {
    if (precisaDecisaoManual && !vencedorPenaltis) {
      Alert.alert("Atenção", "Mesmo pulando as estatísticas, você precisa definir quem venceu nos pênaltis para a fila continuar.");
      return;
    }
    Alert.alert("Pular? ⏩", "Os gols não serão salvos no perfil. Continuar?", [
      { text: "Não" },
      { text: "Sim", onPress: () => {
          JogadorService.encerrarPartidaCompleto({ time_a_id: timeA.id, time_b_id: timeB.id, gols_a: golsA, gols_b: golsB }, [], [], vencedorPenaltis);
          navigation.navigate('PosJogo');
      }}
    ]);
  };

  const StatControls = ({ value, onIncrement, onDecrement, isContra, disableIncrement }) => (
    <View style={styles.controls}>
        <TouchableOpacity onPress={onDecrement} style={styles.miniBtn}>
            <Text style={styles.miniTxt}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.val, isContra && {color: '#d32f2f'}]}>{value}</Text>
        <TouchableOpacity onPress={disableIncrement ? null : onIncrement} style={[styles.miniBtn, disableIncrement && {opacity: 0.2}]}>
            <Text style={styles.miniTxt}>+</Text>
        </TouchableOpacity>
    </View>
  );

  const renderPlayerRow = (j, set, lista, isTimeA) => {
    const disableGols = isTimeA ? (currentGolsA >= golsA) : (currentGolsB >= golsB);
    const disableContra = isTimeA ? (currentGolsB >= golsB) : (currentGolsA >= golsA);
    const validGols = isTimeA ? validGolsA : validGolsB;
    const currentAssists = isTimeA ? currentAssistsA : currentAssistsB;
    const disableAssist = (currentAssists >= validGols) || (j.assistencias >= (validGols - j.gols));

    return (
        <View key={j.jogador_id} style={styles.playerTableRow}>
            <View style={styles.cellNomeContainer}>
                {j.foto_uri ? (
                    <Image source={{ uri: j.foto_uri }} style={styles.fotoAtleta} />
                ) : (
                    <View style={styles.fotoPlaceholder}><Text style={styles.fotoTxt}>{j.nome.charAt(0)}</Text></View>
                )}
                <Text style={styles.playerName} numberOfLines={1}>{j.nome}</Text>
            </View>
            
            <StatControls value={j.gols} onIncrement={() => update(set, lista, j.jogador_id, 'gols', 1)} onDecrement={() => update(set, lista, j.jogador_id, 'gols', -1)} disableIncrement={disableGols} />
            <StatControls value={j.assistencias} onIncrement={() => update(set, lista, j.jogador_id, 'assistencias', 1)} onDecrement={() => update(set, lista, j.jogador_id, 'assistencias', -1)} disableIncrement={disableAssist} />
            <StatControls value={j.gols_contra} onIncrement={() => update(set, lista, j.jogador_id, 'gols_contra', 1)} onDecrement={() => update(set, lista, j.jogador_id, 'gols_contra', -1)} isContra disableIncrement={disableContra} />
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Registro de Gols</Text>

        {/* SEÇÃO TIME A */}
        <View style={[styles.teamHeader, { borderLeftColor: timeA.cor }]}>
            <Text style={styles.teamHeaderTitle}>Time {timeA.nome}</Text>
            <Text style={styles.teamHeaderScore}>{golsA} Gols</Text>
        </View>
        <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, {width: '32%', textAlign: 'left'}]}>Jogador</Text>
            <Text style={[styles.headerCell, {width: '22%'}]}>⚽</Text>
            <Text style={[styles.headerCell, {width: '22%'}]}>👟</Text>
            <Text style={[styles.headerCell, {width: '22%', color: '#d32f2f'}]}>-⚽</Text>
        </View>
        {estA.map(j => renderPlayerRow(j, setEstA, estA, true))}
        <View style={styles.semAutorRow}>
            <Text style={styles.semAutorTxt}>Gol Sem Autor</Text>
            <StatControls value={semAutorA} onIncrement={() => setSemAutorA(semAutorA+1)} onDecrement={() => setSemAutorA(Math.max(0, semAutorA-1))} disableIncrement={currentGolsA >= golsA} />
        </View>

        {/* SEÇÃO TIME B */}
        <View style={[styles.teamHeader, { borderLeftColor: timeB.cor, marginTop: 25 }]}>
            <Text style={styles.teamHeaderTitle}>Time {timeB.nome}</Text>
            <Text style={styles.teamHeaderScore}>{golsB} Gols</Text>
        </View>
        {estB.map(j => renderPlayerRow(j, setEstB, estB, false))}
        <View style={styles.semAutorRow}>
            <Text style={styles.semAutorTxt}>Gol Sem Autor</Text>
            <StatControls value={semAutorB} onIncrement={() => setSemAutorB(semAutorB+1)} onDecrement={() => setSemAutorB(Math.max(0, semAutorB-1))} disableIncrement={currentGolsB >= golsB} />
        </View>

        {/* LÓGICA DE PÊNALTIS */}
        {precisaDecisaoManual && (
            <View style={styles.penaltisContainer}>
                <Text style={styles.penaltisTitle}>🎯 Empate! Quem venceu nos pênaltis?</Text>
                <View style={styles.penaltisBtns}>
                    <TouchableOpacity 
                        style={[styles.btnPenalti, {borderColor: timeA.cor}, vencedorPenaltis === timeA.id && {backgroundColor: timeA.cor}]} 
                        onPress={() => setVencedorPenaltis(timeA.id)}
                    >
                        <Text style={[styles.txtPenalti, vencedorPenaltis === timeA.id && {color: '#fff'}]}>{timeA.nome}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.btnPenalti, {borderColor: timeB.cor}, vencedorPenaltis === timeB.id && {backgroundColor: timeB.cor}]} 
                        onPress={() => setVencedorPenaltis(timeB.id)}
                    >
                        <Text style={[styles.txtPenalti, vencedorPenaltis === timeB.id && {color: '#fff'}]}>{timeB.nome}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        <View style={{height: 150}} />
      </ScrollView>

      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.btnMain} onPress={salvar}>
            <Text style={styles.txtMain}>SALVAR ESTATÍSTICAS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePular}><Text style={styles.skip}>Avançar sem salvar artilharia</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scrollContent: { padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  teamHeader: { backgroundColor: '#fff', padding: 12, borderLeftWidth: 6, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, elevation: 1 },
  teamHeaderTitle: { fontSize: 16, fontWeight: 'bold' },
  teamHeaderScore: { fontSize: 22, fontWeight: 'bold' },
  tableHeaderRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerCell: { fontSize: 12, fontWeight: 'bold', color: '#8e8e93', textAlign: 'center' },
  playerTableRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cellNomeContainer: { width: '32%', flexDirection: 'row', alignItems: 'center' },
  fotoAtleta: { width: 30, height: 30, borderRadius: 15, marginRight: 5 },
  fotoPlaceholder: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e5e5ea', justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  fotoTxt: { fontSize: 12, fontWeight: 'bold', color: '#8e8e93' },
  playerName: { fontSize: 13, fontWeight: '600', flex: 1 },
  controls: { width: '22%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  miniBtn: { borderWidth: 1, borderColor: '#d1d1d6', width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  miniTxt: { fontSize: 16, fontWeight: 'bold' },
  val: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 4, minWidth: 12, textAlign: 'center' },
  semAutorRow: { flexDirection: 'row', backgroundColor: '#eee', padding: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, alignItems: 'center' },
  semAutorTxt: { width: '32%', fontSize: 12, color: '#888' },
  penaltisContainer: { marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 12, borderLevel: 1, borderColor: '#ddd' },
  penaltisTitle: { textAlign: 'center', fontWeight: 'bold', marginBottom: 15, color: '#444' },
  penaltisBtns: { flexDirection: 'row', justifyContent: 'space-around' },
  btnPenalti: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 2, minWidth: 100, alignItems: 'center' },
  txtPenalti: { fontWeight: 'bold' },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  btnMain: { backgroundColor: '#34c759', padding: 16, borderRadius: 12, alignItems: 'center' },
  txtMain: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skip: { textAlign: 'center', color: '#007aff', marginTop: 15, fontWeight: '600' }
});