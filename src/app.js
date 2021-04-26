// import secrets (these are exported as like "export const appId = 'xxx';")
import {appId, serverURL} from './secrets.js'; 

const btnRefs = {
  metamaskLogin: null
};

const onPageLoad = () => {
  // elem refs
  btnRefs.metamaskLogin = document.getElementById('metamask-login');
  btnRefs.metamaskUser = document.getElementById('metamask-user');

  // listeners
  btnRefs.metamaskLogin.addEventListener('click', login);

  initMoralis();
}

const initMoralis = async () => {
  Moralis.initialize(appId);
  Moralis.serverURL = serverURL;
  
  window.web3 = await Moralis.Web3.enable();
}

const login = async () => {
  try {
    const user = await Moralis.Web3.authenticate();
    console.log('🚀 ~ login= ~ user', user);

    btnRefs.metamaskUser.innerHTML = JSON.stringify(user);
  } catch (error) {
    const code = error.code;
    const message = error.message;

    console.log('🚀 ~ login err= ~ code', code);
    console.log('🚀 ~ login err= ~ message', message);
  }
}

window.addEventListener('load', onPageLoad);
