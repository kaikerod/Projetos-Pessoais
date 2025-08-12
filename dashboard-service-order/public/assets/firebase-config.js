import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Export the database reference for use in other files
export { database, ref, set, get, child };