import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function RegistroEstatisticas({ route, navigation }) {
  const { timeA, timeB, golsA, golsB } = route.params;
  
  const [estA, setEstA] = useState(JogadorService.getJogadoresPorTime(timeA.id).map(j => ({ jogador_id: j.id, nome: j.nome, gols: 0, assistencias: 0, gols_contra: 0 })));
  const [estB, setEstB] = useState(JogadorService.getJogadoresPorTime(timeB.id).map(j => ({ jogador_id: j.id, nome: j.nome, gols: 0, assistencias: 0, gols_contra: 0 })));

  const [semAutorA, setSemAutorA] = useState(0);
  const [semAutorB, setSemAutorB] = useState(0);

  // 🛡️ BLOQUEIO DO GESTO DE VOLTAR DO CELULAR
  useEffect(() => {
    const backAction = () => {
      return true; // Impede o gesto nativo de voltar
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);
  // ==========================================
  // MATEMÁTICA DE TRAVAS EM TEMPO REAL
  // ==========================================
  
  // 1. Quantos gols já foram distribuídos para cada time?
  const currentGolsA = estA.reduce((s, j) => s + j.gols, 0) + estB.reduce((s, j) => s + j.gols_contra, 0) + semAutorA;
  const currentGolsB = estB.reduce((s, j) => s + j.gols, 0) + estA.reduce((s, j) => s + j.gols_contra, 0) + semAutorB;

  // 2. Quantos gols são "Válidos para Assistência"? (Placar - Gols Contra do adversário)
  const validGolsA = golsA - estB.reduce((s, j) => s + j.gols_contra, 0);
  const validGolsB = golsB - estA.reduce((s, j) => s + j.gols_contra, 0);

  // 3. Quantas assistências já foram distribuídas no total daquele time?
  const currentAssistsA = estA.reduce((s, j) => s + j.assistencias, 0);
  const currentAssistsB = estB.reduce((s, j) => s + j.assistencias, 0);


  const update = (set, lista, id, field, val) => {
    set(lista.map(item => item.jogador_id === id ? { ...item, [field]: Math.max(0, item[field] + val) } : item));
  };

  const handlePular = () => {
    Alert.alert(
      "Pular Estatísticas? ⏩",
      "Os gols e assistências não serão salvos no perfil dos jogadores. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Pular", onPress: () => navigation.navigate('PosJogo') }
      ]
    );
  };

  const salvar = () => {
    if (currentGolsA !== golsA || currentGolsB !== golsB) {
      Alert.alert(
        "Soma Incorreta ⚠️", 
        `Justifique os gols do placar:\n\n` +
        `Time ${timeA.nome}: Placar ${golsA} / Marcados ${currentGolsA}\n` +
        `Time ${timeB.nome}: Placar ${golsB} / Marcados ${currentGolsB}`
      );
      return;
    }

    const sucesso = JogadorService.encerrarPartidaCompleto(
        { time_a_id: timeA.id, time_b_id: timeB.id, gols_a: golsA, gols_b: golsB }, 
        estA, 
        estB
    );

    if(sucesso){
        navigation.navigate('PosJogo');
    } else {
        Alert.alert("Erro", "Falha ao salvar as estatísticas.");
    }
  };

  const TableHeader = () => (
    <View style={styles.tableHeaderRow}>
        <Text style={[styles.headerCell, styles.cellNome]}>Jogador</Text>
        <Text style={[styles.headerCell, styles.cellStat]}>⚽</Text>
        <Text style={[styles.headerCell, styles.cellStat]}>👟</Text>
        <Text style={[styles.headerCell, styles.cellStat, {color: '#d32f2f'}]}>-⚽</Text>
    </View>
  );

  // NOVO PARÂMETRO 'disableIncrement' para travar visualmente e logicamente o clique do botão '+'
  const StatControls = ({ value, onIncrement, onDecrement, isContra, disableIncrement }) => (
    <View style={styles.controls}>
        <TouchableOpacity onPress={onDecrement} style={[styles.miniBtn, isContra ? {borderColor: '#ffcdd2'} : null]}>
            <Text style={[styles.miniTxt, isContra ? {color: '#d32f2f'} : null]}>-</Text>
        </TouchableOpacity>
        
        <Text style={[styles.val, isContra ? {color: '#d32f2f'} : null]}>{value}</Text>
        
        <TouchableOpacity 
            onPress={disableIncrement ? null : onIncrement} 
            activeOpacity={disableIncrement ? 1 : 0.2}
            style={[
                styles.miniBtn, 
                isContra ? {backgroundColor: '#ffebee', borderColor: '#ffcdd2'} : null,
                disableIncrement ? { opacity: 0.3 } : null // Visual de botão "travado"
            ]}>
            <Text style={[styles.miniTxt, isContra ? {color: '#d32f2f'} : null]}>+</Text>
        </TouchableOpacity>
    </View>
  );

  // isTimeA é um booleano (true ou false) que ajuda a aplicar as regras certas para cada lado
  const renderPlayerRow = (j, set, lista, isTimeA) => {
    // Definindo as variáveis das regras de travamento para essa linha específica
    const disableGols = isTimeA ? (currentGolsA >= golsA) : (currentGolsB >= golsB);
    
    // Trava de Gol Contra: O Gol contra do A, conta pro limite do B, e vice-versa.
    const disableContra = isTimeA ? (currentGolsB >= golsB) : (currentGolsA >= golsA);

    // REGRA DE OURO (Assistência e Auto-Passe):
    const validGols = isTimeA ? validGolsA : validGolsB;
    const currentAssists = isTimeA ? currentAssistsA : currentAssistsB;
    
    // Trava se o time já distribuiu todas as assistências possíveis OU se o jogador está tentando dar assistência pro próprio gol
    const disableAssist = (currentAssists >= validGols) || (j.assistencias >= (validGols - j.gols));

    return (
        <View key={j.jogador_id} style={styles.playerTableRow}>
            <Text style={[styles.playerName, styles.cellNome]} numberOfLines={1}>{j.nome}</Text>
            
            <View style={[styles.cellStat, styles.centerStat]}>
                <StatControls 
                    value={j.gols} 
                    onIncrement={() => update(set, lista, j.jogador_id, 'gols', 1)} 
                    onDecrement={() => update(set, lista, j.jogador_id, 'gols', -1)} 
                    disableIncrement={disableGols}
                />
            </View>

            <View style={[styles.cellStat, styles.centerStat]}>
                <StatControls 
                    value={j.assistencias} 
                    onIncrement={() => update(set, lista, j.jogador_id, 'assistencias', 1)} 
                    onDecrement={() => update(set, lista, j.jogador_id, 'assistencias', -1)} 
                    disableIncrement={disableAssist}
                />
            </View>

            <View style={[styles.cellStat, styles.centerStat]}>
                <StatControls 
                    value={j.gols_contra} 
                    onIncrement={() => update(set, lista, j.jogador_id, 'gols_contra', 1)} 
                    onDecrement={() => update(set, lista, j.jogador_id, 'gols_contra', -1)} 
                    isContra={true} 
                    disableIncrement={disableContra}
                />
            </View>
        </View>
    );
  };

  const renderSemAutorRow = (valor, setVal, isTimeA) => {
    const disableGols = isTimeA ? (currentGolsA >= golsA) : (currentGolsB >= golsB);
    return (
        <View style={styles.semAutorTableRow}>
            <Text style={[styles.playerName, styles.cellNome, {color: '#888', fontWeight: 'normal'}]} numberOfLines={1}>Gol Sem Autor</Text>
            <View style={[styles.cellStat, styles.centerStat]}>
                <StatControls 
                    value={valor} 
                    onIncrement={() => setVal(valor + 1)} 
                    onDecrement={() => setVal(Math.max(0, valor - 1))} 
                    disableIncrement={disableGols}
                />
            </View>
            <View style={styles.cellStat} />
            <View style={styles.cellStat} />
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Resumo do Jogo</Text>
        <Text style={styles.subtitle}>Distribua os gols do placar regulamentar.</Text>
        
        <View style={[styles.teamHeader, { borderLeftColor: timeA.cor }]}>
            <Text style={styles.teamHeaderTitle}>Time {timeA.nome}</Text>
            <Text style={styles.teamHeaderScore}>{golsA} <Text style={{fontSize: 14, color: '#666'}}>Gols</Text></Text>
        </View>
        
        <TableHeader />
        {estA.map(j => renderPlayerRow(j, setEstA, estA, true))}
        {renderSemAutorRow(semAutorA, setSemAutorA, true)}

        <View style={[styles.teamHeader, { borderLeftColor: timeB.cor, marginTop: 30 }]}>
            <Text style={styles.teamHeaderTitle}>Time {timeB.nome}</Text>
            <Text style={styles.teamHeaderScore}>{golsB} <Text style={{fontSize: 14, color: '#666'}}>Gols</Text></Text>
        </View>
        
        <TableHeader />
        {estB.map(j => renderPlayerRow(j, setEstB, estB, false))}
        {renderSemAutorRow(semAutorB, setSemAutorB, false)}

        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.btnMain} onPress={salvar}>
            <Text style={styles.txtMain}>SALVAR ESTATÍSTICAS</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePular}>
            <Text style={styles.skip}>Avançar sem salvar artilharia</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scrollContent: { padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 10, color: '#1c1c1e' },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 20, color: '#8e8e93' },
  
  teamHeader: { backgroundColor: '#fff', padding: 15, borderLeftWidth: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1 },
  teamHeaderTitle: { fontSize: 17, fontWeight: 'bold', color: '#1c1c1e' },
  teamHeaderScore: { fontSize: 28, fontWeight: 'bold', color: '#1c1c1e' },

  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e5ea', marginBottom: 5 },
  playerTableRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 5, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  semAutorTableRow: { flexDirection: 'row', backgroundColor: '#e5e5ea', paddingHorizontal: 5, paddingVertical: 8, alignItems: 'center', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },

  // LARGURAS EXATAS (Conforme testado por você)
  cellNome: { width: '32%' },
  cellStat: { width: '23%' },
  centerStat: { alignItems: 'center', justifyContent: 'center' },

  headerCell: { fontSize: 12, fontWeight: 'bold', color: '#8e8e93', textAlign: 'center' },
  playerName: { fontSize: 14, fontWeight: '600', color: '#1c1c1e', paddingRight: 5 },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  miniBtn: { borderWidth: 1, borderColor: '#d1d1d6', width: 25, height: 25, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  miniTxt: { fontSize: 17, fontWeight: '500', color: '#1c1c1e', lineHeight: 20 },
  val: { fontSize: 14, fontWeight: 'bold', width: 14, textAlign: 'center', color: '#1c1c1e', marginHorizontal: 2 },
  
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#e5e5ea', elevation: 10 },
  btnMain: { backgroundColor: '#34c759', padding: 16, borderRadius: 12, alignItems: 'center' },
  txtMain: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  skip: { textAlign: 'center', color: '#007aff', marginTop: 15, fontSize: 14, fontWeight: '600' }
});