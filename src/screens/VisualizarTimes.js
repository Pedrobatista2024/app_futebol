import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Button, TextInput, Alert } from 'react-native';
import { JogadorService } from '../services/jogadorService';

const CORES = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#212121', '#FF9800', '#FFFFFF'];
const NOMES_CORES = ['Vermelho', 'Azul', 'Amarelo', 'Verde', 'Preto', 'Laranja', 'Branco'];

export default function VisualizarTimes() {
  const [times, setTimes] = useState([]);
  const [config, setConfig] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [timeSelecionado, setTimeSelecionado] = useState(null);
  const [posicaoDesejada, setPosicaoDesejada] = useState(''); 
  const [jogadoresDisponiveis, setJogadoresDisponiveis] = useState([]);

  const [modoCadastro, setModoCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState('');

  // Estado para rastrear quantos times vazios foram adicionados manualmente
  const [timesExtras, setTimesExtras] = useState(0);

  const carregarDados = () => {
    const configuracao = JogadorService.getConfig();
    setConfig(configuracao);

    const todos = JogadorService.findAll();
    
    // Descobre qual o maior ID de time que já tem alguém jogando
    const maxTimeIdNoBanco = todos.reduce((max, j) => j.time_id > max ? j.time_id : max, 0);
    
    // Cálculo de quantos times existem por causa do sorteio original
    const linhaComTime = todos.filter(j => j.posicao === 'Jogador' && j.time_id > 0).length;
    const numTimesCalculado = linhaComTime > 0 ? Math.ceil(linhaComTime / configuracao.jogadores_por_time) : 0;

    // 🔴 AJUSTE: O limite base é o que já existe fisicamente ou por cálculo
    const limiteBase = Math.max(numTimesCalculado, maxTimeIdNoBanco);
    const totalTimesAExibir = limiteBase + timesExtras;

    let estruturaTimes = [];
    for (let i = 1; i <= totalTimesAExibir; i++) {
        let elencoBruto = JogadorService.getJogadoresPorTime(i);
        
        elencoBruto.sort((a, b) => {
            if (a.posicao === 'Goleiro' && b.posicao !== 'Goleiro') return -1;
            if (a.posicao !== 'Goleiro' && b.posicao === 'Goleiro') return 1;
            return 0;
        });

        estruturaTimes.push({
            id: i,
            nome: `Time ${i} - ${NOMES_CORES[i-1] || 'Extra'}`,
            cor: CORES[i-1] || '#999',
            elenco: elencoBruto
        });
    }
    setTimes(estruturaTimes);
  };

  useEffect(() => { carregarDados(); }, [timesExtras]);

  // Função para adicionar +1 vaga em todos os times
  const handleAdicionarVagaGlobal = () => {
    Alert.alert("Confirmação", "Deseja adicionar +1 vaga de linha em todos os times?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => { JogadorService.adicionarVagaReservaGlobal(); carregarDados(); } }
    ]);
  };

  // Função para adicionar um time inteiro novo com confirmação
  const handleAdicionarNovoTime = () => {
    Alert.alert("Novo Time", "Deseja criar a estrutura para um novo time?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Criar", onPress: () => setTimesExtras(prev => prev + 1) }
    ]);
  };

  const abrirSubstituicao = (timeId, posicao) => {
    setTimeSelecionado(timeId);
    setPosicaoDesejada(posicao);
    setModoCadastro(false);
    
    const disponiveis = JogadorService.findAll().filter(j => j.time_id === 0 && j.posicao === posicao);
    setJogadoresDisponiveis(disponiveis);
    setModalVisible(true);
  };

  const confirmarSubstituicao = (jogadorId) => {
    // 🔴 AJUSTE: Se preencher o time que era extra, reduz o contador para evitar o bug do "Time 4"
    if (timeSelecionado > (times.length - timesExtras)) {
        setTimesExtras(prev => Math.max(0, prev - 1));
    }

    JogadorService.vincularJogadorAoTime(jogadorId, timeSelecionado);
    setModalVisible(false);
    carregarDados();
  };

  const handleCadastrarEVincular = () => {
    if (novoNome.trim() === '') return;

    // 🔴 AJUSTE: Mesma lógica de reset para cadastro novo
    if (timeSelecionado > (times.length - timesExtras)) {
        setTimesExtras(prev => Math.max(0, prev - 1));
    }

    JogadorService.create(novoNome, posicaoDesejada);
    const lista = JogadorService.findAll();
    const jogadorCriado = lista.reverse().find(j => j.nome === novoNome && j.posicao === posicaoDesejada);
    if (jogadorCriado) {
        JogadorService.vincularJogadorAoTime(jogadorCriado.id, timeSelecionado);
        setNovoNome('');
        setModalVisible(false);
        carregarDados();
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER DE BOTÕES DE AJUSTE RÁPIDO */}
      <View style={styles.areaBotoesAjuste}>
          <TouchableOpacity style={styles.btnAjuste} onPress={handleAdicionarVagaGlobal}>
            <Text style={styles.txtBtnAjuste}>➕ Vaga Extra</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAjuste, {backgroundColor: '#2E7D32'}]} onPress={handleAdicionarNovoTime}>
            <Text style={styles.txtBtnAjuste}>🆕 Novo Time</Text>
          </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {times.map(time => {
          const temGoleiro = time.elenco.some(j => j.posicao === 'Goleiro');
          const qtdLinha = time.elenco.filter(j => j.posicao === 'Jogador').length;
          const vagasFantasmaLinha = Math.max(0, config.jogadores_por_time - qtdLinha);

          return (
            <View key={time.id} style={[styles.timeCard, { borderTopColor: time.cor }]}>
              <Text style={styles.timeTitulo}>{time.nome}</Text>
              
              {time.elenco.map(j => (
                <View key={j.id} style={[styles.jogadorLinha, j.posicao === 'Goleiro' && styles.destaqueGoleiro]}>
                  <Text style={[styles.jogadorNome, j.posicao === 'Goleiro' && styles.textoGoleiro]}>
                    {j.posicao === 'Goleiro' ? '🧤 ' : ''}{j.nome}
                  </Text>
                  <Text style={[styles.badge, j.posicao === 'Goleiro' ? styles.badgeGoleiro : styles.badgeJogador]}>
                    {j.posicao}
                  </Text>
                </View>
              ))}
              
              {config.conta_goleiro === 1 && !temGoleiro && (
                  <TouchableOpacity style={styles.btnFantasmaGoleiro} onPress={() => abrirSubstituicao(time.id, 'Goleiro')}>
                      <Text style={styles.txtFantasmaGoleiro}>+ Adicionar Goleiro 🧤</Text>
                  </TouchableOpacity>
              )}

              {Array.from({ length: vagasFantasmaLinha }).map((_, i) => (
                  <TouchableOpacity key={`linha-${i}`} style={styles.btnFantasmaLinha} onPress={() => abrirSubstituicao(time.id, 'Jogador')}>
                      <Text style={styles.txtFantasmaLinha}>+ Adicionar Jogador 👕</Text>
                  </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL (Escolha ou Cadastro) */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFundo}>
          <View style={styles.modalConteudo}>
            {modoCadastro ? (
                <View>
                    <Text style={styles.modalTitulo}>Cadastrar Novato</Text>
                    <TextInput style={styles.inputCadastro} placeholder="Nome..." value={novoNome} onChangeText={setNovoNome} autoFocus={true} />
                    <TouchableOpacity style={styles.btnSalvarModal} onPress={handleCadastrarEVincular}><Text style={styles.txtSalvarModal}>Salvar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModoCadastro(false)}><Text style={styles.txtVoltarModal}>Voltar</Text></TouchableOpacity>
                </View>
            ) : (
                <View style={{ flexShrink: 1 }}>
                    <Text style={styles.modalTitulo}>Preencher Vaga</Text>
                    <TouchableOpacity style={styles.btnAbrirCadastro} onPress={() => setModoCadastro(true)}>
                        <Text style={styles.txtAbrirCadastro}>➕ Cadastrar novo agora</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={jogadoresDisponiveis}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.itemSelecao} onPress={() => confirmarSubstituicao(item.id)}>
                                <Text style={styles.textoItemSelecao}>{item.nome}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={{ marginTop: 10 }}>
                        <Button title="Fechar" onPress={() => setModalVisible(false)} color="red" />
                    </View>
                </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f0f0' },
  areaBotoesAjuste: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnAjuste: { flex: 1, backgroundColor: '#1A237E', padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center', elevation: 3 },
  txtBtnAjuste: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  timeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 20, borderTopWidth: 8, elevation: 3 },
  timeTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  jogadorLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  jogadorNome: { fontSize: 15 },
  destaqueGoleiro: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, borderRadius: 5, borderBottomWidth: 0, marginBottom: 5 },
  textoGoleiro: { fontWeight: 'bold', color: '#E65100' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: 'bold' },
  badgeJogador: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  badgeGoleiro: { backgroundColor: '#FFE0B2', color: '#E65100' },
  btnFantasmaGoleiro: { marginTop: 10, padding: 10, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#FF9800', borderRadius: 5, alignItems: 'center' },
  txtFantasmaGoleiro: { color: '#E65100', fontSize: 13, fontWeight: 'bold' },
  btnFantasmaLinha: { marginTop: 10, padding: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, alignItems: 'center' },
  txtFantasmaLinha: { color: '#888', fontSize: 13 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalConteudo: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  btnAbrirCadastro: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  txtAbrirCadastro: { color: '#2196F3', fontWeight: 'bold' },
  itemSelecao: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  textoItemSelecao: { fontSize: 16, textAlign: 'center' },
  inputCadastro: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  btnSalvarModal: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  txtSalvarModal: { color: '#fff', fontWeight: 'bold' },
  txtVoltarModal: { color: 'red', textAlign: 'center', marginTop: 10 }
});