// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export default (globalThis as any).firebaseApp ||
  (() => {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDgPjvhhWZJi5Eh4F6VcuDyvw1jwKZQzI8",
      authDomain: "gulidanna-calendar.firebaseapp.com",
      projectId: "gulidanna-calendar",
      storageBucket: "gulidanna-calendar.appspot.com",
      messagingSenderId: "693348003819",
      appId: "1:693348003819:web:63ddc2d20a47271da8f3ae",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    (globalThis as any).firebaseApp = app;

    return app;
  })();
