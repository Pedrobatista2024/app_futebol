import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { JogadorService } from '../services/jogadorService';

export default function ElencoCard() {
    const [jogadores, setJogadores] = useState([]);
    const [capaUri, setCapaUri] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const viewShotRef = useRef(null);

    useEffect(() => {
        const carregarDados = () => {
            const elenco = JogadorService.getElencoCompleto();
            const perfil = JogadorService.getPerfilRacha();
            setJogadores(elenco);
            if (perfil) setCapaUri(perfil.foto_capa_uri);
            setCarregando(false);
        };
        carregarDados();
    }, []);

    const handleCompartilharElenco = async () => {
        try {
            const cachePath = FileSystem.cacheDirectory + 'temp_elenco_card.png';
            const info = await FileSystem.getInfoAsync(cachePath);
            if (info.exists) await FileSystem.deleteAsync(cachePath);

            const uri = await viewShotRef.current.capture();
            await FileSystem.moveAsync({ from: uri, to: cachePath });

            await Sharing.shareAsync(cachePath, {
                dialogTitle: 'Relatório Geral do Elenco',
                mimeType: 'image/png'
            });
        } catch (error) {
            Alert.alert("Erro", "Falha ao gerar pôster.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.playerCard}>
            <View style={styles.leftCard}>
                {item.foto_uri ? (
                    <Image source={{ uri: item.foto_uri }} style={styles.playerPhoto} />
                ) : (
                    <View style={[styles.photoPlaceholder, { backgroundColor: item.posicao === 'Goleiro' ? '#FF9800' : '#2196F3' }]}>
                        <Text style={styles.initialTxt}>{item.nome.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <Text style={styles.playerPosition}>{item.posicao.toUpperCase()}</Text>
            </View>

            <View style={styles.rightCard}>
                <Text style={styles.playerName} numberOfLines={1}>{item.nome}</Text>
                
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{item.totalGols || 0}</Text>
                        <Text style={styles.statLab}>GOLS</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{item.totalAssists || 0}</Text>
                        <Text style={styles.statLab}>ASSISTÊNCIAS</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statVal, {color: '#ff5252'}]}>{item.totalContra || 0}</Text>
                        <Text style={styles.statLab}>GOLS CONTRA</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{item.totalVits || 0}</Text>
                        <Text style={styles.statLab}>VITÓRIAS</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{item.totalEmps || 0}</Text>
                        <Text style={styles.statLab}>EMPATES</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{item.totalDers || 0}</Text>
                        <Text style={styles.statLab}>DERROTAS</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (carregando) return <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />;

    return (
        <View style={styles.mainContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
                    <ImageBackground 
                        source={capaUri ? { uri: capaUri } : null} 
                        style={styles.captureContainer}
                        blurRadius={3}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.headerCard}>
                                <Text style={styles.titleCard}>📊 RELATÓRIO DO ELENCO</Text>
                                <Text style={styles.subTitleCard}>ESTATÍSTICAS ACUMULADAS DA TEMPORADA</Text>
                                <View style={styles.lineTitle} />
                            </View>

                            <FlatList
                                data={jogadores}
                                keyExtractor={item => item.id.toString()}
                                renderItem={renderItem}
                                scrollEnabled={false}
                                contentContainerStyle={styles.listElenco}
                            />
                            <Text style={styles.footerTxt}>Gerado por Racha Pro App • {new Date().toLocaleDateString()}</Text>
                        </View>
                    </ImageBackground>
                </ViewShot>

                <View style={styles.btnArea}>
                    <TouchableOpacity style={styles.btnCompartilhar} onPress={handleCompartilharElenco}>
                        <Text style={styles.btnTxt}>Compartilhar Relatório no WhatsApp 📲</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#000' },
    captureContainer: { minHeight: 600 },
    overlay: { backgroundColor: 'rgba(0,0,0,0.85)', padding: 15, flex: 1 },
    headerCard: { alignItems: 'center', marginBottom: 20 },
    titleCard: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    subTitleCard: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
    lineTitle: { width: 100, height: 3, backgroundColor: '#4CAF50', marginTop: 8 },
    listElenco: { paddingBottom: 20 },
    playerCard: { 
        flexDirection: 'row',
        backgroundColor: 'rgba(42, 42, 42, 0.8)', 
        marginBottom: 12, 
        borderRadius: 12, 
        padding: 12, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    leftCard: { alignItems: 'center', marginRight: 15 },
    playerPhoto: { width: 65, height: 65, borderRadius: 32.5, borderWidth: 2, borderColor: '#4CAF50' },
    photoPlaceholder: { width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' },
    initialTxt: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
    playerPosition: { color: '#4CAF50', fontSize: 8, fontWeight: 'bold', marginTop: 5 },
    rightCard: { flex: 1 },
    playerName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
    statsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        padding: 8
    },
    statItem: { width: '31%', alignItems: 'center', marginVertical: 4 },
    statVal: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    statLab: { color: '#888', fontSize: 6.5, fontWeight: 'bold', textAlign: 'center' },
    footerTxt: { color: '#555', fontSize: 9, textAlign: 'center', marginTop: 20 },
    btnArea: { padding: 30, alignItems: 'center' },
    btnCompartilhar: { backgroundColor: '#4CAF50', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 30, elevation: 5 },
    btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});