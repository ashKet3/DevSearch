import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCzxs7xQCkssA5Gel0K3S0yxY_VzfPnsvs",
    authDomain: "devsearch-15693.firebaseapp.com",
    projectId: "devsearch-15693",
    storageBucket: "devsearch-15693.appspot.com",
    messagingSenderId: "732864254234",
    appId: "1:732864254234:web:9e40dae37b7028de341ca3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, firestore, database, storage }
