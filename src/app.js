// import secrets (these are exported as like "export const appId = 'xxx';")
import {appId, serverURL} from './secrets.js'; 

const templates = {
  dataOrder: {
    ready: true,
    sellerEthAddress: null,
    data: null
  }
}

const btnRefs = {
  metamaskLogin: null,
  fullmenu: null
};

window.state = {
  loggedIn: false,
  user: null
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
  btnRefs.buyPanel = document.getElementById('buy-panel');

  // listeners
  btnRefs.metamaskLogin.addEventListener('click', login);
  btnRefs.logout.addEventListener('click', logout);
  btnRefs.sellData.addEventListener('click', sellView);
  btnRefs.buyData.addEventListener('click', buyView);


  document.getElementById('sellerOrder').addEventListener('click', sellOrderSubmit);

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
  console.log('user = ', user);
  
  btnRefs.metamaskUser.innerHTML = user && user.get('ethAddress') || '';
  btnRefs.fullmenu.style.display = user && 'block' || 'none';
  btnRefs.logout.style.display = user && 'block' || 'none';
  btnRefs.metamaskLogin.style.display = user && 'none' || 'block';

  window.state.loggedIn = !!user;
  window.state.user = user;
}

const buyView = async() => {
  btnRefs.buyPanel.style.display = 'block';
  btnRefs.sellPanel.style.display = 'none';

  const DataOrder = Moralis.Object.extend("DataOrder");
  const query = new Moralis.Query(DataOrder);

  query.equalTo("ready", true);

  const results = await query.find();

  alert("Successfully retrieved " + results.length + " data orders available for sale");

  // Do something with the returned Moralis.Object values
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    alert(object.id + ' - ' + object.get('data'));
  }
}

const sellView = () => {
  btnRefs.buyPanel.style.display = 'none';
  btnRefs.sellPanel.style.display = 'block';

  document.getElementById('sellerEthAddress').value = window.state.user.get('ethAddress');
}

const sellOrderSubmit = async () => {
  // grab the data 
  const sellerData = document.getElementById('sellerData').value.trim();

  if (sellerData === '') {
    alert('You need to provide some data!')
  } else {
    // create the object
    const newDataOrder = {...templates.dataOrder, data: sellerData};

    console.log('🚀 ~ sellOrderSubmit ~ newDataOrder', newDataOrder);
    // encrypt

    // store in moralis object storage (in future - store in IPFS)
    const DataOrder = Moralis.Object.extend("DataOrder");
    const dataOrder = new DataOrder();

    let savedSataOrder = null;

    try {
      savedSataOrder = dataOrder.save(newDataOrder);

      alert('Data Saved!');      
    } catch(error) {
      const code = error.code;
      const message = error.message;
  
      console.log('🚀 ~ sellOrderSubmit err= ~ code', code);
      console.log('🚀 ~ sellOrderSubmit err= ~ message', message);
    }
  }
}

window.addEventListener('load', onPageLoad);
