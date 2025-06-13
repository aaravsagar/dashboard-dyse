import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUZbhbYqeIUIje1ajSi-99NhLz4ElHSDc",
  authDomain: "dyse2-0.firebaseapp.com",
  projectId: "dyse2-0",
  storageBucket: "dyse2-0.firebasestorage.app",
  messagingSenderId: "157736910877",
  appId: "1:157736910877:web:c77287e43cb2fc6b6706f4",
  databaseURL: "https://dyse2-0-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);