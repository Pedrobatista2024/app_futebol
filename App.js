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
import PlacarCronometro from './src/screens/PlacarCronometro';
import RegistroEstatisticas from './src/screens/RegistroEstatisticas';
import PosJogo from './src/screens/PosJogo';

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

        <Stack.Screen 
          name="Estatisticas" 
          component={Estatisticas} 
          options={{ title: 'Ranking Geral' }} 
        />

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
            headerBackVisible: false, // Esconde a seta
            gestureEnabled: false     // Impede o gesto de voltar
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}