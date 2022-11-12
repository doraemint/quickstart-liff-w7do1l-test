import firebase from 'firebase';
var config = {
  /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: 'AIzaSyBvXEo76a-c5y0ren-dpM0Twav7XuYQA9o',
  authDomain: 'test-f1bbe.firebaseapp.com',
  databaseURL: 'https://mydatabase-c9b84.firebaseio.com',
  projectId: 'test-f1bbe',
  storageBucket: 'test-f1bbe.appspot.com',
  messagingSenderId: '235472357021',
};
firebase.initializeApp(config);
export default firebase;
