import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTUBDk3CQ0AZcFJSCfNNG-aveMqgcCNeQ",
  authDomain: "near-market-22f9f.firebaseapp.com",
  projectId: "near-market-22f9f",
  storageBucket: "near-market-22f9f.appspot.com",
  messagingSenderId: "831214841687",
  appId: "1:831214841687:web:7684dc9fe7b4e118335812",
  measurementId: "G-X0J648M10K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const storageRef = ref(storage, "some-child");

// storage

export { storageRef, storage, firebase as default };
