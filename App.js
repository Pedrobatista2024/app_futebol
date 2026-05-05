import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando o banco e as telas
import { setupDatabase } from './src/services/database';
import Home from './src/screens/Home';
import Cadastro from './src/screens/Cadastro';

// Cria o gerenciador de pilhas (Stack)
const Stack = createNativeStackNavigator();

export default function App() {
  
  useEffect(() => {
    // Garante que o banco seja criado assim que o app abrir
    setupDatabase(); 
  }, []);

  return (
    <NavigationContainer>
      {/* initialRouteName diz qual tela abre primeiro */}
      <Stack.Navigator initialRouteName="Home">
        
        {/* Tela Inicial */}
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} // Esconde o cabeçalho padrão para a Home ficar mais limpa
        />

        {/* Tela de Cadastro */}
        <Stack.Screen 
          name="Cadastro" 
          component={Cadastro} 
          options={{ title: 'Gerenciar Jogadores' }} // Coloca um título bonito no cabeçalho
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}