import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
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
            JogadorService.encerrarRachaDeVez();
            navigation.popToTop();
        }}
      ]
    );
  };

  const renderDestaqueAtleta = (jogador, valor, sulfixo) => (
    <View key={jogador.jogador_id} style={styles.atletaDestaqueRow}>
      {jogador.foto_uri ? (
        <Image source={{ uri: jogador.foto_uri }} style={styles.fotoMini} />
      ) : (
        <View style={styles.fotoPlaceholderMini}>
          <Text style={styles.fotoTxtMini}>{jogador.nome.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.atletaInfo}>
        <Text style={styles.destaqueNome}>{jogador.nome}</Text>
        <Text style={styles.destaqueNumero}>{valor} {sulfixo}</Text>
      </View>
    </View>
  );

  if (!resumo) return <View style={styles.center}><Text style={styles.vazioTxt}>Nenhum jogo finalizado.</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.tituloSecao}>🏆 Classificação do Dia</Text>
        <View style={styles.tabelaContainer}>
          <View style={styles.tabelaHeader}>
            <Text style={[styles.celulaHeader, { flex: 2, textAlign: 'left' }]}>Time</Text>
            <Text style={styles.celulaHeader}>Pts</Text>
            <Text style={styles.celulaHeader}>V</Text>
            <Text style={styles.celulaHeader}>SG</Text>
            <Text style={styles.celulaHeader}>GP</Text>
          </View>

          {resumo.tabelaTimes.map((t, index) => (
            <View key={t.id} style={styles.tabelaRow}>
              <View style={[styles.celula, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.posicao}>{index + 1}º</Text>
                <View style={[styles.bolinhaTime, { backgroundColor: CORES[t.id - 1] || '#999' }]} />
                <Text style={styles.nomeTime}>Time {t.id}</Text>
              </View>
              <Text style={[styles.celula, styles.bold]}>{t.Pts}</Text>
              <Text style={styles.celula}>{t.V}</Text>
              <Text style={styles.celula}>{t.SG}</Text>
              <Text style={styles.celula}>{t.GP}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.tituloSecao, { marginTop: 30 }]}>🌟 Melhores do Dia</Text>
        
        <View style={styles.destaquesContainer}>
          {/* COLUNA ARTILHEIROS */}
          <View style={styles.cardDestaque}>
            <Text style={styles.cardTitulo}>⚽ Artilharia</Text>
            {resumo.artilheiros && resumo.artilheiros.length > 0 ? (
              resumo.artilheiros.map(j => renderDestaqueAtleta(j, j.gols, 'gols'))
            ) : (
              <Text style={styles.destaqueVazio}>Sem gols</Text>
            )}
          </View>

          {/* COLUNA GARÇONS */}
          <View style={styles.cardDestaque}>
            <Text style={styles.cardTitulo}>👟 Garçom</Text>
            {resumo.garcons && resumo.garcons.length > 0 ? (
              resumo.garcons.map(j => renderDestaqueAtleta(j, j.assistencias, 'assist.'))
            ) : (
              <Text style={styles.destaqueVazio}>Sem assist.</Text>
            )}
          </View>
        </View>

        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnFim} onPress={handleEncerrarDeVez}>
          <Text style={styles.txtBtnFim}>FINALIZAR RACHA DO DIA 🛑</Text>
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
  tituloSecao: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  tabelaContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 2 },
  tabelaHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 5 },
  celulaHeader: { flex: 1, fontSize: 11, fontWeight: 'bold', color: '#aaa', textAlign: 'center' },
  tabelaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  celula: { flex: 1, fontSize: 14, textAlign: 'center', color: '#444' },
  bold: { fontWeight: 'bold', color: '#000' },
  posicao: { fontSize: 12, color: '#999', marginRight: 5, width: 20 },
  bolinhaTime: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  nomeTime: { fontSize: 14, fontWeight: 'bold' },
  destaquesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  cardDestaque: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, marginHorizontal: 5 },
  cardTitulo: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 15, textAlign: 'center', textTransform: 'uppercase' },
  atletaDestaqueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  fotoMini: { width: 35, height: 35, borderRadius: 17.5, marginRight: 8 },
  fotoPlaceholderMini: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  fotoTxtMini: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  atletaInfo: { flex: 1 },
  destaqueNome: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  destaqueNumero: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold' },
  destaqueVazio: { fontSize: 12, color: '#ccc', fontStyle: 'italic', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: '#f5f5f5' },
  btnFim: { backgroundColor: '#F44336', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 4 },
  txtBtnFim: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});