import React from 'react';
import { Button } from '@grafana/ui';

export interface Props {
  disabled: boolean;
  mpClientId?: string;
  setAuthCodeCallback: (authCode: string) => void;
}

export default function MatterportLoginButton(props: Props) {
  const { disabled, mpClientId } = props;

  const onLoginClick = async () => {
    if (mpClientId === undefined) {
      return;
    }
    async function onAuthMessage(msg: MessageEvent) {
      if (!authWindow) {
        return;
      }
      // validate that we received a message from a known source
      if (msg.source === authWindow && msg.data.type === 'auth_model') {
        // cleanup a bit: remove the message listener, and close the auth window
        window.removeEventListener('message', onAuthMessage);
        authWindow.close();

        // get authorization code
        const { authCode } = msg.data;
        props.setAuthCodeCallback(authCode);
      }
    }
    window.addEventListener('message', onAuthMessage);

    // open a window to start the user down the OAuth flow
    const authWindow = window.open(
      `https://authn.matterport.com/oauth/authorize?client_id=${mpClientId}&response_type=code&scope=ViewDetails`,
      'OAuth',
      'width=800,height=800'
    );
  };

  return (
    <Button variant="primary" onClick={onLoginClick} disabled={disabled}>
      Login to Matterport
    </Button>
  );
}
