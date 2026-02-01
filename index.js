import { AppRegistry, LogBox } from 'react-native'; // <--- Добавь LogBox в импорт
import App from './App';
import { name as appName } from './app.json';

// Игнорируем специфичные варнинги Firebase
LogBox.ignoreLogs([
  'This method is deprecated',
  'Method called was',
  'Please use', 
]);

AppRegistry.registerComponent(appName, () => App);