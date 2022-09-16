import React from 'react';

export const redirect = () => {
  if (window.opener) {
    // get the authorization code out of the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode !== null) {
      // post back to the app that opened this window
      window.opener.postMessage(
        {
          type: 'auth_model',
          authCode: authCode,
        },
        '*'
      );
    }
  }

  return <div>AWS IoT TwinMaker Plugin - Redirect Page.</div>;
};
