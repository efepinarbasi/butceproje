import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase konsolundan alınan yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyB4zuFx5DJJra9uCVougqGq2rk_3F_uCJY",
  authDomain: "butcetakipapp-29f22.firebaseapp.com",
  projectId: "butcetakipapp-29f22",
  storageBucket: "butcetakipapp-29f22.firebasestorage.app",
  messagingSenderId: "252532350988",
  appId: "1:252532350988:web:fd935d8c0119ca08d5ce29",
  measurementId: "G-NTFYQWW5ZS"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
// Firestore veritabanı referansını dışa aktar
export const db = getFirestore(app);
export { doc, setDoc, getDoc };
