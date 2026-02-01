import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

import { store } from './src/app/store';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { TaskFormScreen } from './src/screens/TaskFormScreen';
import { OfflineNotice } from './src/components/OfflineNotice'; // Наш новый компонент
import { colors } from './src/theme'; // <--- ВОТ ЭТОГО НЕ ХВАТАЛО
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        {/* Уведомление об оффлайне будет поверх всех экранов */}
        <OfflineNotice />
        
        <Stack.Navigator 
          initialRouteName="TaskList"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary }, // Здесь мы используем colors
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="TaskList" 
            component={TaskListScreen} 
            options={{ title: 'My Tasks' }} 
          />
          <Stack.Screen 
            name="TaskForm" 
            component={TaskFormScreen} 
            options={{ title: 'Task Details' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;