import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Share, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService';

export default function Rankings() {
  const [rankings, setRankings] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('artilharia');

  useEffect(() => {
    const dados = JogadorService.getRankingsGerais();
    setRankings(dados);
  }, []);

  // 🔴 NOVA FUNÇÃO: Gera e compartilha o Boletim de Texto
  const gerarECompartilharBoletim = async () => {
    if (!rankings) return;

    let mensagem = '🏆 *RANKING OFICIAL DO RACHA* 🏆\n\n';

    // Varre todas as abas para montar o texto
    abas.forEach(aba => {
      // Pega apenas os 3 primeiros colocados (Top 3)
      const top3 = aba.dados ? aba.dados.slice(0, 3) : [];
      
      if (top3.length > 0) {
        mensagem += `${aba.icone} *${aba.titulo}*\n`;
        
        top3.forEach((jogador, index) => {
          let medalha = '';
          if (index === 0) medalha = '🥇';
          else if (index === 1) medalha = '🥈';
          else if (index === 2) medalha = '🥉';
          
          mensagem += `${medalha} ${jogador.nome} - ${jogador.valor} ${aba.sulfixo}\n`;
        });
        mensagem += '\n'; // Espaçamento entre categorias
      }
    });

    try {
      await Share.share({
        message: mensagem,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar o ranking.");
    }
  };

  if (!rankings) return null;

  const abas = [
    { id: 'artilharia', titulo: 'Artilheiros', icone: '⚽', dados: rankings.artilharia, sulfixo: 'Gols' },
    { id: 'garcom', titulo: 'Garçons', icone: '👟', dados: rankings.garcom, sulfixo: 'Assist.' },
    { id: 'seqVitorias', titulo: 'Vitórias Seguidas', icone: '🔥', dados: rankings.seqVitorias, sulfixo: 'Jogos' },
    { id: 'seqGols', titulo: 'Gols Seguidos', icone: '🎯', dados: rankings.seqGols, sulfixo: 'Jogos' },
    { id: 'seqAssist', titulo: 'Assist. Seguidas', icone: '🤝', dados: rankings.seqAssist, sulfixo: 'Jogos' },
    { id: 'recordeGolsRacha', titulo: 'Recorde de Gols/Dia', icone: '🏆', dados: rankings.recordeGolsRacha, sulfixo: 'Gols' },
    { id: 'recordeAssistRacha', titulo: 'Recorde de Assist/Dia', icone: '🏅', dados: rankings.recordeAssistRacha, sulfixo: 'Assist.' },
    { id: 'fogoAmigo', titulo: 'Fogo Amigo', icone: '🚩', dados: rankings.fogoAmigo, sulfixo: 'Gols C.' }, 
    { id: 'muralha', titulo: 'Muralhas', icone: '🧤', dados: rankings.muralha, sulfixo: 'Gols/J' }
  ];

  const abaSelecionada = abas.find(a => a.id === abaAtiva);

  const renderItemRanking = ({ item, index }) => {
    let posicaoIcone = `${index + 1}º`;
    if (index === 0) posicaoIcone = '🥇';
    if (index === 1) posicaoIcone = '🥈';
    if (index === 2) posicaoIcone = '🥉';

    return (
      <View style={styles.cardRanking}>
        <View style={styles.posicaoContainer}>
          <Text style={[styles.posicaoTexto, index < 3 && styles.posicaoDestaque]}>{posicaoIcone}</Text>
        </View>

        {item.foto_uri ? (
          <Image source={{ uri: item.foto_uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarTxt}>{item.nome.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.nomeJogador}>{item.nome}</Text>
        </View>

        <View style={styles.valorContainer}>
          <Text style={styles.valorEstatistica}>{item.valor}</Text>
          <Text style={styles.labelEstatistica}>{abaSelecionada.sulfixo}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Menu Superior Deslizante com a setinha indicativa */}
      <View style={styles.headerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollTabs}>
          {abas.map(aba => (
            <TouchableOpacity 
              key={aba.id}
              style={[styles.tabBtn, abaAtiva === aba.id && styles.tabBtnAtivo]}
              onPress={() => setAbaAtiva(aba.id)}
            >
              <Text style={[styles.tabTxt, abaAtiva === aba.id && styles.tabTxtAtivo]}>
                {aba.icone} {aba.titulo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.setinhaContainer}>
          <Text style={styles.setinhaTxt}>››</Text>
        </View>
      </View>

      {/* Título da Categoria Selecionada */}
      <View style={styles.tituloCategoriaContainer}>
        <Text style={styles.tituloCategoria}>{abaSelecionada.icone} Top 10: {abaSelecionada.titulo}</Text>
      </View>

      {/* Lista do Top 10 */}
      <FlatList
        data={abaSelecionada.dados}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItemRanking}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.vazioContainer}>
            <Text style={styles.vazioIcone}>📭</Text>
            <Text style={styles.vazioTxt}>Nenhum recorde registrado ainda.</Text>
          </View>
        }
      />

      {/* 🔴 BOTÃO DE COMPARTILHAR */}
      <TouchableOpacity style={styles.fabCompartilhar} onPress={gerarECompartilharBoletim} activeOpacity={0.8}>
        <Text style={styles.fabTxt}>Compartilhar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  
  // Menu Superior (Abas) com a Setinha
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  scrollTabs: { paddingHorizontal: 10 },
  tabBtn: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#f0f2f5', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  tabBtnAtivo: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  tabTxt: { fontSize: 14, color: '#555', fontWeight: 'bold' },
  tabTxtAtivo: { color: '#fff' },

  // Estilo da Setinha Indicativa
  setinhaContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)', 
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  setinhaTxt: { fontSize: 24, color: '#999', fontWeight: 'bold' },

  // Título
  tituloCategoriaContainer: { padding: 15, alignItems: 'center' },
  tituloCategoria: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  // Lista
  listContainer: { paddingHorizontal: 15, paddingBottom: 80 }, // Aumentei o paddingBottom para a lista não ficar atrás do botão flutuante
  cardRanking: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    alignItems: 'center',
    elevation: 2,
  },
  posicaoContainer: { width: 40, alignItems: 'center', marginRight: 10 },
  posicaoTexto: { fontSize: 18, fontWeight: 'bold', color: '#888' },
  posicaoDestaque: { fontSize: 24 }, 

  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#eee' },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  infoContainer: { flex: 1, marginLeft: 15 },
  nomeJogador: { fontSize: 16, fontWeight: 'bold', color: '#222' },

  valorContainer: { alignItems: 'center' },
  valorEstatistica: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  labelEstatistica: { fontSize: 11, color: '#999', marginTop: -2 },
  
  // Vazio
  vazioContainer: { alignItems: 'center', marginTop: 50 },
  vazioIcone: { fontSize: 40, marginBottom: 10 },
  vazioTxt: { color: '#999', fontSize: 16 },

  // 🔴 NOVO BOTÃO FLUTUANTE (FAB)
  fabCompartilhar: {
    position: 'absolute',
    bottom: 30,
    right: 30, 
    backgroundColor: '#25D366', 
    paddingHorizontal: 20, 
    paddingVertical: 10,   
    borderRadius: 20,      
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabTxt: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  }
});