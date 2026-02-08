import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBieo37vqwAMXySlukDV3gBrnNEgIOMMSg",
  authDomain: "elegance-shop-cbdce.firebaseapp.com",
  databaseURL: "https://elegance-shop-cbdce-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "elegance-shop-cbdce",
  storageBucket: "elegance-shop-cbdce.firebasestorage.app",
  messagingSenderId: "507985101322",
  appId: "1:507985101322:web:f5e2c2982f957c3f6495f3",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
