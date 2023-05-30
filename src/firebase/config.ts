import firebase from "firebase";

const app = firebase.initializeApp({
  apiKey: "AIzaSyAXm_l1mnW4xpFE0ZwdX1kPeldFSALB8t4",
  authDomain: "ai-chat-d86fb.firebaseapp.com",
  projectId: "ai-chat-d86fb",
  storageBucket: "ai-chat-d86fb.appspot.com",
  messagingSenderId: "573808033985",
  appId: "1:573808033985:web:d1242b6016992189169440",
});

export const auth = firebase.auth(app);
export const firestore = firebase.firestore(app);

export const user = auth.currentUser;
