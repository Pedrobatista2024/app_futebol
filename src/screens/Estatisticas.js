import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService';

const CORES = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#212121', '#FF9800', '#FFFFFF'];

export default function Estatisticas({ navigation }) {
  
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    const carregarDados = () => {
      const dados = JogadorService.getResumoRachaAtual();
      setResumo(dados);
    };
    carregarDados();
  }, []);

  const handleEncerrarDeVez = () => {
    Alert.alert(
      "Finalizar o Dia? 🛑",
      "Isso vai desfazer os times atuais. Apenas confirme quando tiver certeza que o racha acabou de verdade.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Finalizar", onPress: () => {
            JogadorService.encerrarRachaDeVez(); // Desfaz os times
            navigation.popToTop(); // Joga o usuário direto para a tela "Home" inicial
        }}
      ]
    );
  };

  if (!resumo) {
    return (
      <View style={styles.center}>
        <Text style={styles.vazioTxt}>Nenhum jogo foi finalizado ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* TABELA DE CLASSIFICAÇÃO DOS TIMES */}
        <Text style={styles.tituloSecao}>🏆 Classificação do Dia</Text>
        
        <View style={styles.tabelaContainer}>
          {/* Cabeçalho da Tabela */}
          <View style={styles.tabelaHeader}>
            <Text style={[styles.celulaHeader, { flex: 2, textAlign: 'left' }]}>Time</Text>
            <Text style={styles.celulaHeader}>Pts</Text>
            <Text style={styles.celulaHeader}>J</Text>
            <Text style={styles.celulaHeader}>V</Text>
            <Text style={styles.celulaHeader}>E</Text>
            <Text style={styles.celulaHeader}>D</Text>
            <Text style={styles.celulaHeader}>SG</Text>
            <Text style={styles.celulaHeader}>GP</Text>
          </View>

          {/* Linhas dos Times */}
          {resumo.tabelaTimes.map((t, index) => (
            <View key={t.id} style={styles.tabelaRow}>
              <View style={[styles.celula, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.posicao}>{index + 1}º</Text>
                <View style={[styles.bolinhaTime, { backgroundColor: CORES[t.id - 1] || '#999' }]} />
                <Text style={styles.nomeTime}>T{t.id}</Text>
              </View>
              <Text style={[styles.celula, styles.bold]}>{t.Pts}</Text>
              <Text style={styles.celula}>{t.J}</Text>
              <Text style={styles.celula}>{t.V}</Text>
              <Text style={styles.celula}>{t.E}</Text>
              <Text style={styles.celula}>{t.D}</Text>
              <Text style={styles.celula}>{t.SG}</Text>
              <Text style={styles.celula}>{t.GP}</Text>
            </View>
          ))}
        </View>

        {/* DESTAQUES INDIVIDUAIS */}
        <Text style={[styles.tituloSecao, { marginTop: 30 }]}>🌟 Destaques Individuais</Text>
        
        <View style={styles.destaquesContainer}>
          <View style={styles.cardDestaque}>
            <Text style={styles.cardTitulo}>⚽ Artilheiro</Text>
            {resumo.artilheiro ? (
              <>
                <Text style={styles.destaqueNome}>{resumo.artilheiro.nome}</Text>
                <Text style={styles.destaqueNumero}>{resumo.artilheiro.gols} gols</Text>
              </>
            ) : (
              <Text style={styles.destaqueVazio}>Nenhum gol hoje</Text>
            )}
          </View>

          <View style={styles.cardDestaque}>
            <Text style={styles.cardTitulo}>👟 Garçom</Text>
            {resumo.garcom ? (
              <>
                <Text style={styles.destaqueNome}>{resumo.garcom.nome}</Text>
                <Text style={styles.destaqueNumero}>{resumo.garcom.assistencias} assist.</Text>
              </>
            ) : (
              <Text style={styles.destaqueVazio}>Nenhuma assist.</Text>
            )}
          </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* BOTÃO FIM FIXO NO RODAPÉ */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnFim} onPress={handleEncerrarDeVez}>
          <Text style={styles.txtBtnFim}>FIM DO RACHA 🛑</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioTxt: { fontSize: 16, color: '#888' },
  
  tituloSecao: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  // Tabela
  tabelaContainer: { backgroundColor: '#fff', borderRadius: 10, elevation: 3, padding: 10 },
  tabelaHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 5 },
  celulaHeader: { flex: 1, fontSize: 12, fontWeight: 'bold', color: '#888', textAlign: 'center' },
  tabelaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  celula: { flex: 1, fontSize: 14, textAlign: 'center', color: '#444' },
  bold: { fontWeight: 'bold', color: '#222' },
  
  posicao: { fontSize: 12, color: '#999', marginRight: 5, width: 18 },
  bolinhaTime: { width: 14, height: 14, borderRadius: 7, marginRight: 5 },
  nomeTime: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  // Destaques
  destaquesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  cardDestaque: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 3, marginHorizontal: 5, alignItems: 'center' },
  cardTitulo: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  destaqueNome: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  destaqueNumero: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold', marginTop: 5 },
  destaqueVazio: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },

  // Footer Fixo
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: '#f5f5f5' },
  btnFim: { backgroundColor: '#F44336', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 5 },
  txtBtnFim: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});