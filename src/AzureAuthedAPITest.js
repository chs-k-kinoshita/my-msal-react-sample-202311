import { useEffect, useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import "./App.css";

export const loginRequest = {
  scopes: [ process.env.REACT_APP_SCOPE ]
};

const API_DOMAIN = process.env.REACT_APP_API_DOMAIN;

const LogoutButton = () => {
  const { instance } = useMsal();
  const handleLogout = async () => {
    await instance.logoutRedirect();
  };
  return (
    <button onClick={() => handleLogout()}>ログアウト</button>
  );
};

const APIResBody = ({data}) => {
  if (!data) return;
  return (
    <pre className="resBody">{JSON.stringify(data, null, 2)}</pre>
  )
};

const TestAPICaller = () => {
  const { instance } = useMsal();
  const [ data, setData ] = useState();
  const [ fetchStatus, setFetchStatus ] = useState("");
  const [ fetchUri, setFetchUri ] = useState();

  const fetchWithAuth = async (path) => {
    const uri = `${API_DOMAIN}/${path}`
    const method = "GET";
    setFetchUri(`${uri} 【HTTP Method】${method}`);
    try {
      const tokenResponse = await instance.acquireTokenSilent(loginRequest);

      const headers = new Headers();
      const bearer = `Bearer ${tokenResponse.accessToken}`;
      headers.append("Authorization", bearer);
      const options = {
        method,
        mode: "cors",
        headers: headers
      };
      setFetchStatus("Loading...");
      const res = await fetch(uri, options);
      if (res.status !== 200) {
        setFetchStatus(`Error(status: ${res.status} message: ${res.statusText})`);
        setData(null);
        return;
      }
      setFetchStatus("Success");
      const resBody = await res.json();
      // console.log(resBody);
      setData(resBody);

    } catch (error) {
      console.log(error);
      // TODO 未テスト
      setFetchStatus(`Error(message: ${error.message})`);
      if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          return instance.acquireTokenPopup(loginRequest);
      }
    }
  };

  const clearFetchResult = () => {
    setFetchUri(null);
    setData(null);
    setFetchStatus("");
  };

  return (
    <>
      <div className="buttonArea">
        <button onClick={() => fetchWithAuth('index')}>Call Test API 1</button>
        <button onClick={() => fetchWithAuth('wait?sleep=1')}>Call Test API 2</button>
        <button onClick={() => fetchWithAuth('not_found')}>Call Test API 3(404ErrorRes)</button>
        <button onClick={() => clearFetchResult()}>Clear Result</button>
      </div>
      { fetchUri && <p>{fetchUri}</p> }
      { fetchStatus && fetchStatus.startsWith("Error") ? <p style={ {color: "red"} }>{fetchStatus}</p> : <p>{fetchStatus}</p> }
      <APIResBody data={data} />
    </>
  );
};

export default function UserInfomation() {
  const { instance } = useMsal();
  const [ username, setUsername ] = useState("UnKnown");

  useEffect(() => {
    const account = instance.getActiveAccount();
    setUsername(account.username);
  }, [instance]);

  return (
    <>
      <div className="loginMessage">ログインしました。[ {username} ] <LogoutButton /></div>
      <TestAPICaller />
    </>
  );
}