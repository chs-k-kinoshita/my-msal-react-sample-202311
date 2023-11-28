import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import AzureAuthedAPITest, { loginRequest } from "./AzureAuthedAPITest.js";

import "./App.css";

const LoginButton = () => {
  const { instance } = useMsal();
  //ログインボタン実行時の関数
  const handleLogin = async () => {
    // instance.loginRedirect(loginRequest);
    var response = await instance.loginPopup(loginRequest);
    instance.setActiveAccount(response.account);
  };
  return (
    <div className="buttonArea">
      <button onClick={() => handleLogin()}>ログイン</button>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      {/*ログイン成功時に表示*/}
      <AuthenticatedTemplate>
        <AzureAuthedAPITest />
      </AuthenticatedTemplate>

      {/*未ログイン時に表示*/}
      <UnauthenticatedTemplate>
        <div>ログインしてください</div>
        <LoginButton />
      </UnauthenticatedTemplate>
    </div>
  );
}