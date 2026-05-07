import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando o banco e as telas
import { setupDatabase } from './src/services/database';
import Home from './src/screens/Home';
import Cadastro from './src/screens/Cadastro';

// 👇 A TELA ANTIGA CONTINUA INTACTA AQUI (Resumo do fim do dia)
import Estatisticas from './src/screens/Estatisticas'; 

// 🆕 NOVAS TELAS DE ESTATÍSTICAS GERAIS (HUB e Sub-telas)
import EstatisticasGeraisHub from './src/screens/EstatisticasGeraisHub'; 
import PerfilRacha from './src/screens/PerfilRacha';
import PerfilJogador from './src/screens/PerfilJogador';
import RankingsGerais from './src/screens/RankingsGerais';

// Telas Operacionais do Jogo
import PainelControle from './src/screens/PainelControle';
import Checkin from './src/screens/Checkin';
import FazerSorteio from './src/screens/FazerSorteio';
import ConfigurarEstrutura from './src/screens/ConfigurarEstrutura';
import VisualizarTimes from './src/screens/VisualizarTimes';
import ConfigurarPartida from './src/screens/ConfigurarPartida';
import PlacarCronometro from './src/screens/PlacarCronometro';
import RegistroEstatisticas from './src/screens/RegistroEstatisticas';
import PosJogo from './src/screens/PosJogo';
import DetalheJogador from './src/screens/DetalheJogador';

const Stack = createNativeStackNavigator();

export default function App() {
  
  useEffect(() => {
    // Inicializa o banco de dados SQLite
    setupDatabase(); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        {/* Telas de Navegação Livre (Com seta de voltar) */}
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Cadastro" 
          component={Cadastro} 
          options={{ title: 'Gerenciar Jogadores' }} 
        />

        {/* 👇 TELA ORIGINAL (Tabela do fim do Racha) */}
        <Stack.Screen 
          name="Estatisticas" 
          component={Estatisticas} 
          options={{ title: 'Resumo do Racha' }} 
        />

        {/* 🏟️ NOSSO NOVO HUB DE ESTATÍSTICAS GERAIS FUTEBOLEIROS */}
        <Stack.Screen 
          name="EstatisticasGeraisHub" 
          component={EstatisticasGeraisHub} 
          options={{ title: 'Estatísticas Gerais' }} 
        />

        {/* 📄 TELAS DESTINO DO HUB */}
        <Stack.Screen name="PerfilRacha" component={PerfilRacha} options={{ title: 'Perfil do Racha' }} />
        <Stack.Screen name="PerfilJogador" component={PerfilJogador} options={{ title: 'Perfil do Jogador' }} />
        <Stack.Screen name="RankingsGerais" component={RankingsGerais} options={{ title: 'Rankings' }} />

        <Stack.Screen 
          name="PainelControle"
          component={PainelControle}
          options={{ title: 'Painel do Racha' }} // ESTA MANTÉM A SETA (Sempre permite voltar)
        />

        <Stack.Screen
          name="Checkin"
          component={Checkin}
          options={{ title: 'Check-in' }}
        />

        <Stack.Screen
          name="FazerSorteio"
          component={FazerSorteio}
          options={{ title: 'Sorteio' }}
        />

        <Stack.Screen 
          name="ConfigurarEstrutura" 
          component={ConfigurarEstrutura} 
          options={{ title: 'Estrutura' }} 
        />

        <Stack.Screen 
          name="VisualizarTimes" 
          component={VisualizarTimes}
          options={{ title: 'Times' }}
        />

        <Stack.Screen
          name="ConfigurarPartida"
          component={ConfigurarPartida}
          options={{ title: 'Regras' }}
        />

        {/* 🛡️ TELAS DO FLUXO CRÍTICO (Seta de voltar DESATIVADA) */}
        <Stack.Screen
          name="PlacarCronometro"
          component={PlacarCronometro}
          options={{ 
            title: 'Partida ao Vivo',
            headerBackVisible: false, 
            gestureEnabled: false 
          }}
        />

        <Stack.Screen
          name="RegistroEstatisticas"
          component={RegistroEstatisticas}
          options={{ 
            title: 'Resumo do Jogo',
            headerBackVisible: false, 
            gestureEnabled: false 
          }}
        />

        <Stack.Screen
          name="PosJogo"
          component={PosJogo}
          options={{ 
            title: 'Próximos Passos',
            headerBackVisible: false, 
            gestureEnabled: false 
          }}
        />

        <Stack.Screen
        name="DetalheJogador"
        component={DetalheJogador}
        options={{ title: 'Estatísticas do Atleta' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}