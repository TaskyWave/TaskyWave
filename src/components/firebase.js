import firebase from 'firebase/compat/app'; // note the use of 'firebase/compat/app' instead of 'firebase/app'
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyBE5UO0oQ3vJhbfGKYPR8XlBuBQOLjzWu4",
    authDomain: "taskywave-c64a4.firebaseapp.com",
    databaseURL: "https://taskywave-c64a4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taskywave-c64a4",
    storageBucket: "taskywave-c64a4.appspot.com",
    messagingSenderId: "300679954444",
    appId: "1:300679954444:web:35db07142b81019f5f2e29",
    measurementId: "G-J03YYET9L2"
  };

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const database = firebase.database();