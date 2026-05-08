import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { JogadorService } from '../services/jogadorService';

const { height, width } = Dimensions.get('window');

export default function PerfilRacha() {
  const [dados, setDados] = useState(null);
  const [preparandoPrint, setPreparandoPrint] = useState(false);
  const viewShotRef = useRef(null);

  useEffect(() => {
    const carregarDados = () => {
      const perfil = JogadorService.getPerfilRacha();
      setDados(perfil);
    };
    carregarDados();
  }, []);

  const handleCompartilhar = async () => {
    try {
      setPreparandoPrint(true);
      setTimeout(async () => {
        const uri = await viewShotRef.current.capture();
        setPreparandoPrint(false);
        await Sharing.shareAsync(uri);
      }, 100);
    } catch (error) {
      setPreparandoPrint(false);
      Alert.alert("Erro", "Falha ao compartilhar.");
    }
  };

  const handlePickCapa = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 7],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (JogadorService.updateFotoCapa(uri)) setDados({ ...dados, foto_capa_uri: uri });
    }
  };

  if (!dados) return null;

  const imagemCapa = dados.foto_capa_uri ? { uri: dados.foto_capa_uri } : { uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000' };

  const MiniStat = ({ numero, legenda, cor }) => (
    <View style={styles.miniStat}>
      <Text style={[styles.statNumero, { color: cor }]}>{numero}</Text>
      <Text style={styles.statLegenda}>{legenda}</Text>
    </View>
  );

  const DestaqueCard = ({ titulo, icone, jogador, label, corBarra, ruim }) => (
    <View style={[styles.cardDestaque, { borderTopColor: corBarra }]}>
      <Text style={styles.tituloDestaque}>{icone} {titulo}</Text>
      <View style={styles.corpoDestaque}>
        {jogador?.foto_uri ? (
          <Image source={{ uri: jogador.foto_uri }} style={styles.fotoAtleta} />
        ) : (
          <View style={[styles.placeholderAtleta, { backgroundColor: ruim ? '#F44336' : '#2196F3' }]}>
            <Text style={styles.txtPlaceholder}>{jogador?.nome?.charAt(0) || '?'}</Text>
          </View>
        )}
        <View style={styles.infoAtleta}>
          <Text style={styles.nomeAtleta} numberOfLines={1}>{jogador?.nome || '---'}</Text>
          <Text style={ruim ? styles.valorRuim : styles.valorBom}>{jogador?.valor || 0} {label}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.masterContainer}>
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }} style={styles.captureArea}>
        
        {/* 1. CAPA */}
        <ImageBackground source={imagemCapa} style={styles.capa}>
          <TouchableOpacity style={styles.overlay} onPress={handlePickCapa} activeOpacity={0.8} disabled={preparandoPrint}>
            <Text style={styles.nomeRacha}>Futeboleiros ofc</Text>
            {!preparandoPrint && <Text style={styles.txtTrocarFoto}>📷 Tocar para alterar capa</Text>}
          </TouchableOpacity>
        </ImageBackground>

        {/* 2. ESTATÍSTICAS GERAIS */}
        <View style={styles.statsGrid}>
          <MiniStat numero={dados.estatisticas.totalRachas} legenda="Rachas" cor="#9C27B0" />
          <MiniStat numero={dados.estatisticas.totalPartidas} legenda="Jogos" cor="#2196F3" />
          <MiniStat numero={dados.estatisticas.totalGols} legenda="Gols" cor="#E91E63" />
          <MiniStat numero={dados.estatisticas.totalVitorias} legenda="Vitórias" cor="#4CAF50" />
          <MiniStat numero={dados.estatisticas.totalEmpates} legenda="Empates" cor="#FF9800" />
          <MiniStat numero={dados.estatisticas.totalDerrotas} legenda="Derrotas" cor="#F44336" />
        </View>

        {/* 3. BLOCO DE DESTAQUES (3 LINHAS X 2 COLUNAS) */}
        <View style={styles.destaquesSection}>
          <View style={styles.linhaDestaque}>
            <DestaqueCard titulo="Artilheiro (Mais gols)" icone="⚽" jogador={dados.destaques.artilheiro} label="Gols" corBarra="#4CAF50" />
            <DestaqueCard titulo="Garçom (Mais assistencias)" icone="👟" jogador={dados.destaques.garcom} label="Assis." corBarra="#2196F3" />
          </View>
          <View style={styles.linhaDestaque}>
            <DestaqueCard titulo="Talismã (Mais vitórias)" icone="🍀" jogador={dados.destaques.talisma} label="Vitórias" corBarra="#FFD700" />
            <DestaqueCard titulo="Fogo Amigo (Mais gols contra)" icone="🤡" jogador={dados.destaques.fogoAmigo} label="Contra" corBarra="#F44336" ruim />
          </View>
          <View style={styles.linhaDestaque}>
            <DestaqueCard titulo="Melhor Fase (últimos 10 jogos)" icone="🔥" jogador={dados.destaques.melhorFase} label="Pts/10J" corBarra="#FF5722" />
            <DestaqueCard titulo="Pé Frio (últimos 10 jogos)" icone="🥶" jogador={dados.destaques.piorFase} label="Pts/10J" corBarra="#607D8B" ruim />
          </View>
        </View>

      </ViewShot>

      {/* 4. BOTÃO FLUTUANTE */}
      {!preparandoPrint && (
        <TouchableOpacity style={styles.btnShare} onPress={handleCompartilhar}>
          <Text style={styles.btnShareTxt}>Enviar para o Grupo do WhatsApp 📲</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  captureArea: { flex: 1, backgroundColor: '#f8f9fa', paddingBottom: 10 },
  
  capa: { height: height * 0.25, width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  nomeRacha: { color: '#fff', fontSize: 22, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  txtTrocarFoto: { color: '#ddd', fontSize: 10, marginTop: 5, fontStyle: 'italic' },

  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    backgroundColor: '#fff', 
    margin: 20, 
    borderRadius: 15, 
    padding: 10,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  miniStat: { width: '33.3%', alignItems: 'center', marginVertical: 6 },
  statNumero: { fontSize: 20, fontWeight: 'bold' },
  statLegenda: { fontSize: 10, color: '#999', fontWeight: 'bold' },

  destaquesSection: { flex: 1, paddingHorizontal: 10 },
  linhaDestaque: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  
  cardDestaque: { 
    width: '48.5%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 8, 
    elevation: 3, 
    borderTopWidth: 4 
  },
  tituloDestaque: { fontSize: 9, fontWeight: 'bold', color: '#888', marginBottom: 6 },
  corpoDestaque: { flexDirection: 'row', alignItems: 'center' },
  fotoAtleta: { width: 42, height: 42, borderRadius: 21, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  placeholderAtleta: { width: 42, height: 42, borderRadius: 21, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  txtPlaceholder: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  infoAtleta: { flex: 1 },
  nomeAtleta: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  valorBom: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold' },
  valorRuim: { fontSize: 11, color: '#F44336', fontWeight: 'bold' },

  footerApp: { textAlign: 'center', fontSize: 9, color: '#bbb', marginTop: 5 },

  btnShare: {
    backgroundColor: '#25D366',
    margin: 15,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5
  },
  btnShareTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});