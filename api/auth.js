// /api/auth
// Step 1 of the Decap CMS <-> GitHub login handshake.
// The admin panel opens this in a popup; we redirect straight to GitHub's
// own OAuth consent screen. No user data is stored or touched here.

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send('Missing GITHUB_CLIENT_ID environment variable.');
    return;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${req.headers.host}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params.toString()}` });
  res.end();
};
