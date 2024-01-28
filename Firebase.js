// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgng2kPB9is2IraBSCPDrE42gDpfJHoko",
  authDomain: "chatmate-62904.firebaseapp.com",
  projectId: "chatmate-62904",
  storageBucket: "chatmate-62904.appspot.com",
  messagingSenderId: "916269302636",
  appId: "1:916269302636:web:3e190aa648d43e43a72949",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
