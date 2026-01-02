import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Strict CORS configuration
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://nougram.co';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, profession, phone, whatsappConsent, _gotcha } = req.body;

    // Honeypot check: If _gotcha is filled, it's a bot. Fail silently.
    if (_gotcha) {
        console.warn('Bot detected via honeypot.');
        return res.status(200).json({ message: 'Email sent successfully' });
    }

    if (!name || !email || !profession) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Send Email via SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Nougram Lead" <${process.env.SMTP_USER}>`,
            to: 'business@nougram.co',
            subject: `Nuevo Lead Beta: ${name}`,
            text: `
        Nuevo registro para la Beta de Nougram:
        
        Nombre: ${name}
        Email: ${email}
        Profesión: ${profession}
        Teléfono: ${phone || 'No especificado'}
        WhatsApp Consent: ${whatsappConsent ? 'Sí' : 'No'}
      `,
            html: `
        <h2>Nuevo registro para la Beta de Nougram</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Profesión:</strong> ${profession}</p>
        <p><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
        <p><strong>Acepta WhatsApp:</strong> ${whatsappConsent ? 'Sí' : 'No'}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        // 2. Save to Google Sheets
        if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            try {
                const auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: process.env.GOOGLE_CLIENT_EMAIL,
                        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                const sheets = google.sheets({ version: 'v4', auth });

                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: `${process.env.GOOGLE_SHEET_NAME || 'Hoja 1'}!A:F`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [
                            [
                                new Date().toISOString(), // Timestamp
                                name,
                                email,
                                profession,
                                phone || '',
                                whatsappConsent ? 'Sí' : 'No'
                            ]
                        ],
                    },
                });
            } catch (sheetError) {
                console.error('Error saving to Google Sheets:', sheetError);
                // We don't fail the request if sheets fails, but we log the error.
            }
        }

        return res.status(200).json({ message: 'Lead captured successfully' });
    } catch (error) {
        console.error('Error processing lead:', error);
        return res.status(500).json({ error: 'Failed to process lead' });
    }
}
