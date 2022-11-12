// Import stylesheets
import './css/style.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  doc,
  getFirestore,
  collection,
  query,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const firebaseConfig = {
  apiKey: 'AIzaSyBvXEo76a-c5y0ren-dpM0Twav7XuYQA9o',
  authDomain: 'test-f1bbe.firebaseapp.com',
  projectId: 'test-f1bbe',
  storageBucket: 'test-f1bbe.appspot.com',
  messagingSenderId: '235472357021',
  appId: '1:235472357021:web:bfd38af7cc99286f057674',
};
// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
// Reference

// Body element
const body = document.getElementById('body');

// Button elements
const btnSend = document.getElementById('btnSend');
const btnClose = document.getElementById('btnClose');
const btnShare = document.getElementById('btnShare');
const btnLogIn = document.getElementById('btnLogIn');
const btnLogOut = document.getElementById('btnLogOut');
const btnScanCode = document.getElementById('btnScanCode');
const btnOpenWindow = document.getElementById('btnOpenWindow');
const sectionContainer = document.querySelector('.section-container');
const bookletButton = document.querySelector('.booklet-btn');

const editIcon = '&#128394';
const doneIcon = '&#9989';
const removeIcon = '&#10060';

// Variables
let account = {};
let bookletContainersElement = [];
let usernameValuesElement = [];
let emailValuesElement = [];
let genderValuesElement = [];
let birthdayValuesElement = [];

const genderOptionsData = [
  {
    value: '',
    text: 'กรุณาเลือกเพศของคุณ',
  },
  {
    value: 'male',
    text: 'เพศชาย',
  },
  {
    value: 'female',
    text: 'เพศหญิง',
  },
];

function validateInput({ username, email }) {
  const newUsername = username.replace(/\s/g, ''); // Remove white space
  const isUserNameValid = newUsername.length > 0;
  const isEmailValid = /\S+@\S+\.\S+/.test(email) || email.length === 0; // Regex for email
  return isUserNameValid && isEmailValid;
}

/** ---------------------------------------------------------------------------------- */
function setupEventListener() {
  const docID = uuidv4();
  bookletButton.addEventListener('click', () =>
    handleAddBooklet({ docID, username: '', email: '', gender: '' })
  );
  bookletButton.hidden = true;
}

async function fetchAllBookletsIfNeeded() {
  const q = query(
    collection(db, 'Accounts', account.email, 'Booklets'),
    orderBy('timestamp')
  );
  const bookletsQuerySnapshot = await getDocs(q);

  bookletsQuerySnapshot.forEach((doc) => {
    const { username, email, gender, docID, birthday } = doc.data();
    handleAddBooklet({ username, email, gender, docID, birthday });
  });

  bookletButton.style.setProperty('display', 'inline-block');
}

async function createNewAccountInFirebase(account) {
  const { email, username, userId, gender, docID, birthday } = account;

  await setDoc(doc(db, 'Accounts', email, 'Booklets', bookletId), {
    docID,
    userId,
    username,
    email,
    gender,
    birthday,
    timestamp: Date.now(),
  });
}

async function getUserProfile() {
  const { email: lineEmail } = liff.getDecodedIDToken();
  const { displayName, userId } = await liff.getProfile();

  const docSnap = await getDoc(doc(db, 'Accounts', lineEmail)); // Check whether email is exist
  // if email don't exist, create new collection in firebase by using account as an input
  if (!docSnap.exists()) {
    const docID = uuidv4();
    createNewAccountInFirebase({
      userId,
      docID,
      username: displayName,
      email: lineEmail,
      gender: '',
      birthday: Date.now(),
    });
    account = {
      username,
      docID,
      userId,
      email: lineEmail,
      gender: '',
      birthday: Date.now(),
    };
    handleAddBooklet(account);
  } else {
    const { userId, username, email, gender, docID, birthday } = docSnap.data();
    account = {
      userId,
      docID,
      gender,
      email: lineEmail,
      username,
      birthday,
    };
    handleAddBooklet({ docID, userId, email, gender, username, birthday });
  }

  fetchAllBookletsIfNeeded(); // Fetch all booklets if needed
}

function handleAddBooklet(info) {
  // Append username label
  const usernameLabelElement = document.createElement('p');
  usernameLabelElement.innerHTML = 'Name';
  usernameLabelElement.style.setProperty('color', '#4caf50');
  // Append username value
  const usernameValueElement = document.createElement('div');

  // Append email label
  const emailLabelElement = document.createElement('p');
  emailLabelElement.innerHTML = 'E-mail';
  emailLabelElement.style.setProperty('color', '#4caf50');
  emailLabelElement.hidden = !info.email;

  // Append email value
  const emailValueElement = document.createElement('div');

  // Append gender label
  const genderLabelElement = document.createElement('p');
  genderLabelElement.innerHTML = 'Gender';
  genderLabelElement.style.setProperty('color', '#4caf50');

  // Append gender value
  const genderValueElement = document.createElement('div');

  // Append birthday label
  const birthdayLabelElement = document.createElement('p');
  birthdayLabelElement.innerHTML = 'Birthday';
  birthdayLabelElement.style.setProperty('color', '#4caf50');

  const birthdayValueElement = document.createElement('div');

  usernameValueElement.id = `uname-value-${info.docID}`;
  usernameValueElement.innerHTML = info.username;
  emailValueElement.id = `email-value-${info.docID}`;
  emailValueElement.innerHTML = info.email;
  genderValueElement.id = `gender-value-${info.docID}`;
  genderValueElement.innerHTML =
    info.gender.length !== 0 ? info.gender : 'กรุณาระบุเพศ';
  birthdayValueElement.id = `birthday-value-${info.docID}`;
  birthdayValueElement.innerHTML = moment(info.birthday).format('DD/MM/YYYY');

  // Create new booklet element
  const bookletContainer = document.createElement('div');
  bookletContainer.className = 'booklet-container';
  bookletContainer.id = `booklet-container-${info.docID}`;
  const editIconElement = document.createElement('div');
  editIconElement.className = 'edit-icon';
  editIconElement.id = `booklet-${info.docID}-edit`;
  editIconElement.innerHTML = editIcon;
  editIconElement.addEventListener('click', () =>
    handleEditBooklet(info.docID, info.email)
  );

  const removeIconElement = document.createElement('div');
  removeIconElement.className = 'remove-icon';
  removeIconElement.id = `booklet-${info.docID}-remove`;
  removeIconElement.innerHTML = removeIcon;
  removeIconElement.addEventListener('click', () =>
    handleRemoveBooklet(info.docID)
  );

  bookletContainersElement.push({
    container: bookletContainer,
    isEditing: false,
  });

  bookletContainer.appendChild(editIconElement);

  usernameValuesElement.push(usernameValueElement);
  emailValuesElement.push(emailValueElement);
  genderValuesElement.push(genderValueElement);
  birthdayValuesElement.push(birthdayValueElement);

  bookletContainer.appendChild(usernameLabelElement);
  bookletContainer.appendChild(usernameValueElement);
  bookletContainer.appendChild(emailLabelElement);
  bookletContainer.appendChild(emailValueElement);
  bookletContainer.appendChild(genderLabelElement);
  bookletContainer.appendChild(genderValueElement);
  bookletContainer.appendChild(birthdayLabelElement);
  bookletContainer.appendChild(birthdayValueElement);

  if (info.docID !== account.docID)
    bookletContainer.appendChild(removeIconElement);
  sectionContainer.appendChild(bookletContainer);
}

async function handleUpdateBooklet(bookletId) {
  const booklet = bookletContainersElement.find(
    (element) => element.container.id === `booklet-container-${bookletId}`
  );

  const usernameInput = booklet.container.querySelectorAll('input')[0];
  const emailInput = booklet.container.querySelectorAll('input')[1];
  const genderInput = booklet.container.querySelectorAll('select')[0];
  const birthdayInput = booklet.container.querySelectorAll('input')[2];

  const username = usernameInput.value;
  const email = emailInput.value;
  const gender = genderInput.value;
  const birthday = birthdayInput.value;

  const isValid = validateInput({
    username,
    email,
  });

  const isUpdatePersonalAccount = bookletId === account.docID || false;

  // Update collection
  if (!isValid) {
    alert('กรุณากรอกชื่อหรืออีเมลให้ถูกต้อง');
    return;
  }

  if (isUpdatePersonalAccount) {
    const myBookletRef = doc(db, 'Accounts', account.email);
    await updateDoc(myBookletRef, {
      username,
      email,
      gender,
      birthday,
    });
    alert('อัพเดทข้อมูลสำเร็จ');
  } else {
    // check if docId is Exist
    const docRef = doc(db, 'Accounts', account.email, 'Booklets', bookletId);
    const bookletRef = await getDoc(docRef);
    if (bookletRef.exists()) {
      await updateDoc(docRef, {
        username,
        email,
        gender,
        timestamp: Date.now(),
        birthday,
      });
      alert('อัพเดทข้อมูลสำเร็จ');
    } else {
      // Create new booklet
      const bookletCol = doc(db, 'Accounts', account.email, 'Booklets', docID);
      await setDoc(bookletCol, {
        docID: bookletId,
        username,
        email,
        gender,
        timestamp: Date.now(),
        birthday,
      });
      alert('เพิ่มข้อมูลสำเร็จ');
    }
  }

  // Change icon back
  booklet.isEditing = false;

  const doneIconElement = booklet.container.querySelector('.done-icon');
  doneIconElement.hidden = true;
  const editIconElement = booklet.container.querySelector('.edit-icon');
  editIconElement.hidden = false;

  window.location.reload();
}

// const firebaseConfig = {
//   apiKey: 'AIzaSyDHkvn5se2FhqQiZ02ZD2AAqubuI_XrFdE',
//   authDomain: 'vaccinebookletth.firebaseapp.com',
//   projectId: 'vaccinebookletth',
//   storageBucket: 'vaccinebookletth.appspot.com',
//   messagingSenderId: '398820469301',
//   appId: '1:398820469301:web:059331155061e400621f7c',
// };

async function handleRemoveBooklet(bookletId) {
  if (typeof bookletId === 'number') window.location.reload();
  if (confirm('คุณต้องการที่จะลบข้อมูลนี้หรือไม่?') == true) {
    await deleteDoc(doc(db, 'Accounts', account.email, 'Booklets', bookletId));
    window.location.reload();
  }
}

function handleEditBooklet(bookletId, savedEmail) {
  if (usernameValuesElement.length === 0) return;

  const genderElement = genderValuesElement.find(
    (element) => element.id === `gender-value-${bookletId}`
  );
  const emailElement = emailValuesElement.find(
    (element) => element.id === `email-value-${bookletId}`
  );
  const usernameElement = usernameValuesElement.find(
    (element) => element.id === `uname-value-${bookletId}`
  );
  const birthdayElement = birthdayValuesElement.find(
    (element) => element.id === `birthday-value-${bookletId}`
  );

  const booklet = bookletContainersElement.find(
    (element) => element.container.id === `booklet-container-${bookletId}`
  );

  booklet.isEditing = true;
  emailElement.hidden = true;
  usernameElement.hidden = true;
  genderElement.hidden = true;
  birthdayElement.hidden = true;

  const usernameInputElement = document.createElement('input');
  usernameInputElement.id = `uname-input-${bookletId}`;
  usernameInputElement.value = usernameElement.innerHTML;
  const emailInputElement = document.createElement('input');
  emailInputElement.id = `email-input-${bookletId}`;
  emailInputElement.value = emailElement.innerHTML;
  const genderSelectElement = document.createElement('select');
  genderOptionsData.forEach((gender) => {
    const genderOptionsElement = document.createElement('option');
    genderOptionsElement.value = gender.value;
    genderOptionsElement.innerHTML = gender.text;
    genderSelectElement.appendChild(genderOptionsElement);
  });
  const birthdayInputElement = document.createElement('input');
  birthdayInputElement.type = 'date';
  birthdayInputElement.name = 'birthday';
  birthdayInputElement.value = birthdayElement.value;

  // Change Icon
  const iconElement = booklet.container.querySelector('.edit-icon');
  iconElement.hidden = true;
  const doneIconElement = document.createElement('div');
  doneIconElement.className = 'done-icon';
  doneIconElement.innerHTML = doneIcon;
  doneIconElement.addEventListener('click', () =>
    handleUpdateBooklet(bookletId)
  );

  const paragraphElements = booklet.container.querySelectorAll('p');
  const usernameLabelElement = paragraphElements[0];
  const emailLabelElement = paragraphElements[1];
  const genderLabelElement = paragraphElements[2];
  const birthdayLabelElement = paragraphElements[3];

  usernameLabelElement.hidden = false;
  emailLabelElement.hidden = false;
  genderLabelElement.hidden = false;
  birthdayLabelElement.hidden = false;

  usernameLabelElement.appendChild(usernameInputElement);
  emailLabelElement.appendChild(emailInputElement);
  genderLabelElement.appendChild(genderSelectElement);
  birthdayLabelElement.appendChild(birthdayInputElement);

  booklet.container.appendChild(doneIconElement);
  booklet.container.appendChild(usernameLabelElement);
  booklet.container.appendChild(emailLabelElement);
  booklet.container.appendChild(genderLabelElement);
  booklet.container.appendChild(birthdayLabelElement);

  if (bookletId !== account.docID) {
    const oldRemoveIcon = booklet.container.querySelector('.remove-icon');
    oldRemoveIcon.remove();
    const newRemoveIcon = document.createElement('div');
    newRemoveIcon.className = 'remove-icon';
    newRemoveIcon.innerHTML = removeIcon;
    newRemoveIcon.addEventListener('click', () =>
      handleRemoveBooklet(savedEmail)
    );
    booklet.container.appendChild(newRemoveIcon);
  }
}

async function main() {
  // Initialize LIFF app
  if (liff.isInClient()) {
    //mobile
    await liff.init({
      liffId: '1657232886-jobROLBJ',
      withLoginOnExternalBrowser: true,
    });
    if (liff.isLoggedIn()) {
      getUserProfile();
      setupEventListener();
    } else {
      liff.login();
    }
  } else {
    //pc
    await liff.init({
      liffId: '1657232886-jobROLBJ',
    });
    if (liff.isLoggedIn()) {
      getUserProfile();
      setupEventListener();
    } else {
      liff.login();
    }
  }
}

//sidebar
const $toggler = document.querySelector('.toggler');
const $sidebar = document.querySelector('.sidebar');
const $main = document.querySelector('.main');
const $closeSidebarButton = document.querySelector('.closeSidebarButton');

$closeSidebarButton.addEventListener('click', () => {
  $sidebar.classList.remove('is-opened');
});

$toggler.addEventListener('click', () => {
  $sidebar.classList.toggle('is-opened');
});

main();
