import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando o banco e as telas
import { setupDatabase } from './src/services/database';
import Home from './src/screens/Home';
import Cadastro from './src/screens/Cadastro';
import Estatisticas from './src/screens/Estatisticas'; 
import PainelControle from './src/screens/PainelControle';
import Checkin from './src/screens/Checkin';
import FazerSorteio from './src/screens/FazerSorteio';
import ConfigurarEstrutura from './src/screens/ConfigurarEstrutura';
import VisualizarTimes from './src/screens/VisualizarTimes';
import ConfigurarPartida from './src/screens/ConfigurarPartida';

// NOVAS TELAS DO FLUXO DE JOGO
import PlacarCronometro from './src/screens/PlacarCronometro';
import RegistroEstatisticas from './src/screens/RegistroEstatisticas';
import PosJogo from './src/screens/PosJogo';

const Stack = createNativeStackNavigator();

export default function App() {
  
  useEffect(() => {
    setupDatabase(); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
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

        <Stack.Screen 
          name="Estatisticas" 
          component={Estatisticas} 
          options={{ title: 'Estatísticas Gerais' }} 
        />

        <Stack.Screen 
          name="PainelControle"
          component={PainelControle}
          options={{ title: 'Painel do Racha' }}
        />

        <Stack.Screen
          name="Checkin"
          component={Checkin}
          options={{ title: 'Check-in de Presença' }}
        />

        <Stack.Screen
          name="FazerSorteio"
          component={FazerSorteio}
          options={{ title: 'Central do Sorteio' }}
        />

        <Stack.Screen 
          name="ConfigurarEstrutura" 
          component={ConfigurarEstrutura} 
          options={{ title: 'Estrutura dos Times' }} 
        />

        <Stack.Screen 
          name="VisualizarTimes" 
          component={VisualizarTimes}
          options={{ title: 'Times Sorteados' }}
        />

        <Stack.Screen
          name="ConfigurarPartida"
          component={ConfigurarPartida}
          options={{ title: 'Regras da Partida' }}
        />

        {/* ROTAS DO FLUXO DE JOGO ATIVO */}
        <Stack.Screen
          name="PlacarCronometro"
          component={PlacarCronometro}
          options={{ title: 'Partida em Andamento', headerLeft: () => null }} // headerLeft null impede voltar e bugar o tempo
        />

        <Stack.Screen
          name="RegistroEstatisticas"
          component={RegistroEstatisticas}
          options={{ title: 'Resumo do Jogo', headerLeft: () => null }}
        />

        <Stack.Screen
          name="PosJogo"
          component={PosJogo}
          options={{ title: 'Próximos Passos', headerLeft: () => null }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}