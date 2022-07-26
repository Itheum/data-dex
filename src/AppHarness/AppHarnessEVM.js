import AppEVM from "App/AppEVM";
import { useMoralis } from "react-moralis";
import { sleep } from 'libs/util';

function AppHarnessEVM({resetLaunchMode}) {
  const {
    isAuthenticated,
    logout: moralisLogout,
    user,
  } = useMoralis();

  const handleMoralisLogout = async() => {
    resetLaunchMode();
    await moralisLogout();
    await sleep(3);
    window.location.replace("/");
  }

  return (
    <>
      {(isAuthenticated && user) && <AppEVM appConfig={{
        onMoralisLogout: handleMoralisLogout
      }} />}
    </>
  );
}

export default AppHarnessEVM;
