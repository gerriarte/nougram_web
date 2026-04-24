import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Usamos el Client ID proporcionado
  const clientID = process.env.GITHUB_CLIENT_ID || 'Ov23li5FmNnkYuU3Kyr4';
  
  // Redirigimos al usuario a GitHub para autorizar
  // Scope 'repo' es necesario para que el CMS pueda escribir archivos
  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=repo,user`;
  res.redirect(url);
}
