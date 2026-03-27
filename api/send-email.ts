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

    const {
        name,
        email,
        profession,
        phone,
        company,
        country,
        website,
        termsConsent,
        whatsappConsent,
        feedbackConsent,
        _gotcha,
        leadSource,
        testSummary,
        testAnswers
    } = req.body;

    const source = leadSource || 'landing-form';
    const isFinancialTestLead = source === 'financial-health-test';

    // Honeypot check: If _gotcha is filled, it's a bot. Fail silently.
    if (_gotcha) {
        console.warn('Bot detected via honeypot.');
        return res.status(200).json({ message: 'Email sent successfully' });
    }

    if (!name || !email || (!isFinancialTestLead && !profession)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const summary = testSummary || {};
    const testScore = summary.score ?? '';
    const testDiagnosis = summary.diagnosis ?? '';
    const testWeakArea = summary.weakArea ?? '';
    const testMarginProtection = summary.marginProtection ?? '';
    const testQuoteTimeRecovered = summary.quoteTimeRecovered ?? '';
    const testAutomationPotential = summary.automationPotential ?? '';
    const serializedAnswers = Array.isArray(testAnswers)
        ? JSON.stringify(testAnswers)
        : '';
    const formatBooleanField = (value: any) => (value ? 'Sí' : 'No');

    try {
        // 1. Send Email via SMTP
        try {
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
                subject: isFinancialTestLead
                    ? `Nuevo Lead Test Financiero: ${name}`
                    : `Nuevo Lead Beta: ${name}`,
                text: `
        ${isFinancialTestLead ? 'Nuevo registro del Test de Salud Financiera:' : 'Nuevo registro para la Beta de Nougram:'}
        
        Nombre: ${name}
        Email: ${email}
        ${!isFinancialTestLead ? `
        Profesión: ${profession}
        Teléfono: ${phone || 'No especificado'}
        Empresa: ${company || 'No especificado'}
        País: ${country || 'No especificado'}
        Sitio Web: ${website || 'No especificado'}
        Acepta Términos: ${formatBooleanField(termsConsent)}
        WhatsApp Consent: ${formatBooleanField(whatsappConsent)}
        Dará Feedback: ${formatBooleanField(feedbackConsent)}
        ` : ''}
        Origen: ${source}
        ${isFinancialTestLead ? `
        ---- Resumen Test de Salud Financiera ----
        Puntaje: ${testScore}
        Diagnóstico: ${testDiagnosis}
        Área Crítica: ${testWeakArea}
        Margen Protegible: ${testMarginProtection}
        Tiempo Recuperable: ${testQuoteTimeRecovered}
        Potencial de Automatización: ${testAutomationPotential}
        Respuestas: ${serializedAnswers || 'No especificadas'}
        ` : ''}
      `,
                html: `
        <h2>${isFinancialTestLead ? 'Nuevo registro del Test de Salud Financiera' : 'Nuevo registro para la Beta de Nougram'}</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${!isFinancialTestLead ? `
        <p><strong>Profesión:</strong> ${profession}</p>
        <p><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
        <p><strong>Empresa:</strong> ${company || 'No especificado'}</p>
        <p><strong>País:</strong> ${country || 'No especificado'}</p>
        <p><strong>Sitio Web:</strong> ${website || 'No especificado'}</p>
        <p><strong>Acepta Términos:</strong> ${formatBooleanField(termsConsent)}</p>
        <p><strong>Acepta WhatsApp:</strong> ${formatBooleanField(whatsappConsent)}</p>
        <p><strong>Dará Feedback:</strong> ${formatBooleanField(feedbackConsent)}</p>
        ` : ''}
        <p><strong>Origen:</strong> ${source}</p>
        ${isFinancialTestLead ? `
        <hr />
        <h3>Resumen Test de Salud Financiera</h3>
        <p><strong>Puntaje:</strong> ${testScore}</p>
        <p><strong>Diagnóstico:</strong> ${testDiagnosis}</p>
        <p><strong>Área Crítica:</strong> ${testWeakArea}</p>
        <p><strong>Margen Protegible:</strong> ${testMarginProtection}</p>
        <p><strong>Tiempo Recuperable:</strong> ${testQuoteTimeRecovered}</p>
        <p><strong>Potencial de Automatización:</strong> ${testAutomationPotential}</p>
        <p><strong>Respuestas:</strong> ${serializedAnswers || 'No especificadas'}</p>
        ` : ''}
      `,
            };

            await transporter.sendMail(mailOptions);
        } catch (smtpError) {
            console.error('Error sending Email via SMTP:', smtpError);
            // We do not fail the function if SMTP is unconfigured.
        }

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

                const defaultSheetName = process.env.GOOGLE_SHEET_NAME || 'Hoja 1';
                const testSheetName = process.env.GOOGLE_SHEET_TEST_NAME || 'test';
                const targetSheetName = isFinancialTestLead ? testSheetName : defaultSheetName;

                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: `${targetSheetName}!A:R`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [
                            [
                                new Date().toISOString(), // Timestamp
                                name,
                                email,
                                isFinancialTestLead ? '' : (profession || ''),
                                isFinancialTestLead ? '' : (phone || ''),
                                isFinancialTestLead ? '' : (company || ''),
                                isFinancialTestLead ? '' : (country || ''),
                                isFinancialTestLead ? '' : (website || ''),
                                isFinancialTestLead ? '' : formatBooleanField(termsConsent),
                                isFinancialTestLead ? '' : formatBooleanField(whatsappConsent),
                                isFinancialTestLead ? '' : formatBooleanField(feedbackConsent),
                                source,
                                testScore,
                                testDiagnosis,
                                testWeakArea,
                                testMarginProtection,
                                testQuoteTimeRecovered,
                                testAutomationPotential,
                                serializedAnswers
                            ]
                        ],
                    },
                });
            } catch (sheetError) {
                console.error('Error saving to Google Sheets:', sheetError);
                // We don't fail the request if sheets fails, but we log the error.
            }
        }

        // 3. Add to MailerLite
        if (process.env.MAILERLITE_API_KEY) {
            try {
                const mailerLitePayload: any = {
                    email: email,
                    status: 'active', // Ensure the subscriber is active (bypasses double opt-in if allowed/configured)
                    fields: {
                        name: name,
                        phone: phone || '', // Standard field
                        company: company || '', // Standard field
                        country: country || '' // Standard field
                    }
                };

                if (process.env.MAILERLITE_GROUP_ID) {
                    // Make sure this is the Numeric Group ID, NOT the name!
                    mailerLitePayload.groups = [process.env.MAILERLITE_GROUP_ID];
                }

                const mailerLiteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
                    },
                    body: JSON.stringify(mailerLitePayload)
                });

                let mailerLiteStatusStr = 'Success';
                if (!mailerLiteResponse.ok) {
                    const errorText = await mailerLiteResponse.text();
                    console.error('Mailerlite Error:', errorText);
                    mailerLiteStatusStr = `Error: ${mailerLiteResponse.status} - ${errorText}`;
                }

                return res.status(200).json({ 
                    message: 'Lead captured successfully', 
                    mailerlite: mailerLiteStatusStr 
                });
            } catch (mailerliteError: any) {
                console.error('Error adding to Mailerlite:', mailerliteError);
                return res.status(200).json({ 
                    message: 'Lead captured but Mailerlite failed', 
                    mailerlite: `Catch: ${mailerliteError.message}` 
                });
            }
        } else {
            return res.status(200).json({ 
                message: 'Lead captured successfully', 
                mailerlite: 'Skipped - MAILERLITE_API_KEY missing' 
            });
        }
    } catch (error) {
        console.error('Error processing lead:', error);
        return res.status(500).json({ error: 'Failed to process lead' });
    }
}
