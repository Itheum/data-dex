// import secrets (these are exported as like "export const appId = 'xxx';")
import {appId, serverURL} from './secrets.js'; 

const templates = {
  dataOrder: {
    sellerEthAddress: null,
    data: null
  }
}

const btnRefs = {
  metamaskLogin: null,
  fullmenu: null
};

const state = {
  loggedIn: false
};

const onPageLoad = () => {
  // elem refs
  btnRefs.metamaskLogin = document.getElementById('metamask-login');
  btnRefs.logout = document.getElementById('metamask-logout');
  btnRefs.metamaskUser = document.getElementById('metamask-user');
  btnRefs.fullmenu = document.getElementById('full-menu');
  btnRefs.sellData = document.getElementById('sell-data');
  btnRefs.buyData = document.getElementById('buy-data');
  btnRefs.sellPanel = document.getElementById('sell-panel');

  // listeners
  btnRefs.metamaskLogin.addEventListener('click', login);
  btnRefs.logout.addEventListener('click', logout);

  initMoralis();
}

const initMoralis = async () => {
  Moralis.initialize(appId);
  Moralis.serverURL = serverURL;
  
  window.web3 = await Moralis.Web3.enable();
  
  // is user already logged in?
  const user = await Moralis.User.current(); 

  if (user) {
    console.log('🚀 ~ user in session');

    showUser(user);
  }
}

const login = async () => {
  try {
    const user = await Moralis.Web3.authenticate();
    console.log('🚀 ~ login done');

    showUser(user);
  } catch (error) {
    const code = error.code;
    const message = error.message;

    console.log('🚀 ~ login err= ~ code', code);
    console.log('🚀 ~ login err= ~ message', message);
  }
}

const logout = async () => {
  await Moralis.User.logOut();
  console.log('🚀 ~ logout done');

  showUser();
}

const showUser = user => {
  btnRefs.metamaskUser.innerHTML = user && JSON.stringify(user) || '';
  btnRefs.fullmenu.style.display = user && 'block' || 'none';
  btnRefs.logout.style.display = user && 'block' || 'none';
  btnRefs.metamaskLogin.style.display = user && 'none' || 'block';

  state.loggedIn = !!user;
}

window.addEventListener('load', onPageLoad);
