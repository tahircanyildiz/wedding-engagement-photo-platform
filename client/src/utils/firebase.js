import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBJW6EuRXTDI29kTwBX-PHPyQbFSeyosC8",
  authDomain: "wedding-photos-b7df5.firebaseapp.com",
  projectId: "wedding-photos-b7df5",
  storageBucket: "wedding-photos-b7df5.firebasestorage.app",
  messagingSenderId: "712069703074",
  appId: "1:712069703074:web:aef1d99e89c86eab85befb",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
