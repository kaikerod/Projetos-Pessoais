// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPBFY5AC5eO1qko50U79Pd25N9jVb4UM8",
  authDomain: "dashboard-service-order.firebaseapp.com",
  databaseURL: "https://dashboard-service-order-default-rtdb.firebaseio.com",
  projectId: "dashboard-service-order",
  storageBucket: "dashboard-service-order.firebasestorage.app",
  messagingSenderId: "579635292278",
  appId: "1:579635292278:web:e0532ac90fbc1bee3e1757"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };