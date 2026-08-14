// /api/callback
// Step 2 of the Decap CMS <-> GitHub login handshake.
// GitHub redirects here with a one-time `code`. We exchange it server-side
// for an access token (this is the only step that needs the client secret)
// and hand the token back to the admin popup via postMessage. Nothing is
// persisted anywhere — no database, no session store.

module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get('code');

  if (!clientId || !clientSecret) {
    res.status(500).send('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variable.');
    return;
  }

  if (!code) {
    res.status(400).send('Missing authorization code from GitHub.');
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      res.status(400).send(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`);
      return;
    }

    const message = `authorization:github:success:${JSON.stringify({
      token: tokenData.access_token,
      provider: 'github',
    })}`;

    const html = `<!DOCTYPE html>
<html>
<body>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('OAuth token exchange failed: ' + err.message);
  }
};
