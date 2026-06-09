// src/firebase.js

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// ここをご自身の Firebase プロジェクトの設定値（Config）に書き換えてください
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaWABhVZPKHRPwevjv8xzy7lvWjMoWCt8",
  authDomain: "dark-side-luck.firebaseapp.com",
  projectId: "dark-side-luck",
  storageBucket: "dark-side-luck.firebasestorage.app",
  messagingSenderId: "43203104616",
  appId: "1:43203104616:web:cf3f08e99b9c8964ead0dd",
  measurementId: "G-FMGKCPQE9T"
};

// Firebase を初期化
const app = initializeApp(firebaseConfig);

// Storage を初期化してエクスポート
export const storage = getStorage(app);
