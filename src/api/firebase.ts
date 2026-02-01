import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const db = firestore();

db.settings({
  persistence: true, 
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED, 
});

export const tasksCollection = db.collection('tasks'); 
export const authInstance = auth();
export const storageInstance = storage();

export default db;