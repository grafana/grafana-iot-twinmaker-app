export const getMPRefreshToken = async (
  mpClientId: string,
  mpClientSecret: string,
  mpAuthCode: string
): Promise<string | undefined> => {
  let refresh_token = '';
  try {
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: mpAuthCode,
      scope: 'ViewDetails',
      client_id: mpClientId,
      client_secret: mpClientSecret,
    });
    const response = await fetch('https://api.matterport.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }

    const responseJson = await response.json();
    if (!responseJson.error) {
      refresh_token = responseJson.refresh_token;
    }

    return refresh_token;
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
    } else {
      console.log('unexpected error: ', error);
    }
    return;
  }
};
