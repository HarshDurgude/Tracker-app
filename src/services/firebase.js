// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAykDPcyTPLaKxUtt5rC-HUnZCHgw4paiA",
    authDomain: "tracker-app-e3bf2.firebaseapp.com",
    projectId: "tracker-app-e3bf2",
    storageBucket: "tracker-app-e3bf2.firebasestorage.app",
    messagingSenderId: "237179720566",
    appId: "1:237179720566:web:5f1bde52bd7448c7d72057"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);