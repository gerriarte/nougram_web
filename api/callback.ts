import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  const clientID = process.env.GITHUB_CLIENT_ID || 'Ov23li5FmNnkYuU3Kyr4';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || '521b6af128b71b52d66cec356fc8213c083ba878';

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    // Intercambiamos el código por un access token de GitHub
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('GitHub OAuth Error:', data);
      return res.status(400).send(`Error: ${data.error_description || data.error}`);
    }

    // El CMS espera un mensaje via postMessage para completar el flujo
    const content = `
      <!DOCTYPE html>
      <html>
      <head><title>Autorizando...</title></head>
      <body>
        <script>
          (function() {
            function receiveMessage(e) {
              console.log("Recibido mensaje de origin:", e.origin);
              
              const token = "${data.access_token}";
              const provider = "github";
              
              const message = "authorization:" + provider + ":success:" + JSON.stringify({
                token: token,
                provider: provider
              });
              
              window.opener.postMessage(message, e.origin);
            }
            
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
