import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDsh7jXiFXIgCPRIXh0PNpFhhsshS4pLmE",
  authDomain: "pizzaonkel-clan.firebaseapp.com",
  projectId: "pizzaonkel-clan",
  storageBucket: "pizzaonkel-clan.firebasestorage.app",
  messagingSenderId: "77478212384",
  appId: "1:77478212384:web:d240b46780e96d65a51d45",
  measurementId: "G-XPBX8KGGRZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);