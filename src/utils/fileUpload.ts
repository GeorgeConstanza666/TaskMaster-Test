import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

export const uploadImageToStorage = async (uri: string): Promise<string> => {
  if (!uri) return '';

  const filename = `tasks/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  
  const reference = storage().ref(filename);

  const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

  await reference.putFile(uploadUri);

  const url = await reference.getDownloadURL();
  return url;
};