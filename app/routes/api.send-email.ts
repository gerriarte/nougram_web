import { type ActionFunctionArgs, data } from "react-router";
import { Resend } from 'resend';
import { google } from 'googleapis';

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return data({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
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
            testAnswers,
            language
        } = body;

        const userLanguage = language || 'es';
        const source = leadSource || 'landing-form';
        const isFinancialTestLead = source === 'financial-health-test';

        // Honeypot check
        if (_gotcha) {
            console.warn('Bot detected via honeypot field _gotcha.');
            return data({ message: 'Email processed successfully (bot filter)' });
        }

        if (!name || !email || (!isFinancialTestLead && !profession)) {
            return data({ error: 'Missing required fields' }, { status: 400 });
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

        const results = {
            resend: 'Skipped',
            confirmation: 'Skipped',
            sheets: 'Skipped',
            mailerlite: 'Skipped'
        };

        // 1. Send Email via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || 'business@nougram.co';
                const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'business@nougram.co';
                
                // Notificación al Admin
                const { data: resendData, error: resendError } = await resend.emails.send({
                    from: `Nougram Leads <business@nougram.co>`,
                    to: [recipientEmail],
                    replyTo: email,
                    subject: isFinancialTestLead
                        ? `Nuevo Lead Test Financiero: ${name}`
                        : `Nuevo Lead Beta: ${name}`,
                    headers: {
                        'X-Template-Id': 'nougram-beta-welcome' // Añadido según indicación
                    },
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #020617; padding: 20px; text-align: center;">
                                <h2 style="color: #ffffff; margin: 0;">Nuevo Lead Nougram</h2>
                            </div>
                            <div style="padding: 30px; color: #1e293b;">
                                <p style="font-size: 18px; font-weight: bold; margin-top: 0;">${isFinancialTestLead ? 'Test de Salud Financiera' : 'Registro Beta'}</p>
                                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                                <p><strong>Nombre:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                ${!isFinancialTestLead ? `
                                <p><strong>Profesión:</strong> ${profession}</p>
                                <p><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
                                <p><strong>Empresa:</strong> ${company || 'No especificado'}</p>
                                <p><strong>País:</strong> ${country || 'No especificado'}</p>
                                <p><strong>Sitio Web:</strong> ${website || 'No especificado'}</p>
                                <p><strong>Acepta WhatsApp:</strong> ${formatBooleanField(whatsappConsent)}</p>
                                ` : ''}
                                <p><strong>Origen:</strong> ${source}</p>
                                ${isFinancialTestLead ? `
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px;">
                                    <h3 style="color: #6366f1; margin-top: 0;">Resumen del Test</h3>
                                    <p><strong>Puntaje:</strong> ${testScore}</p>
                                    <p><strong>Diagnóstico:</strong> ${testDiagnosis}</p>
                                    <p><strong>Área Crítica:</strong> ${testWeakArea}</p>
                                    <p><strong>Tiempo Recuperable:</strong> ${testQuoteTimeRecovered}</p>
                                </div>
                                ` : ''}
                            </div>
                            <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
                                Correo generado por el sistema Nougram &middot; ID: nougram-beta-welcome
                            </div>
                        </div>
                    `,
                });

                if (resendError) {
                    console.error('RESEND_ERROR_NOTIFICATION:', resendError);
                    results.resend = `Error: ${resendError.message}`;
                } else {
                    console.log('RESEND_SUCCESS_NOTIFICATION:', resendData?.id);
                    results.resend = `Success (ID: ${resendData?.id})`;
                }

                // Confirmación al Cliente
                const confirmationSubject = isFinancialTestLead
                    ? (userLanguage === 'en' ? 'Welcome to Nougram, Let\'s shield your profits!' : 'Bienvenido a Nougram, ¡Empecemos a blindar tus ganancias!')
                    : (userLanguage === 'en' ? 'Welcome to Nougram, Let\'s shield your profits!' : 'Bienvenido a Nougram, ¡Empecemos a blindar tus ganancias!');

                const { data: confirmData, error: confirmError } = await resend.emails.send({
                    from: `Nougram <business@nougram.co>`,
                    to: [email],
                    subject: confirmationSubject,
                    headers: {
                        'X-Template-Id': 'nougram-beta-welcome'
                    },
                    html: generateConfirmationHtml(name, userLanguage, isFinancialTestLead),
                });

                if (confirmError) {
                    console.error('RESEND_ERROR_CONFIRMATION:', confirmError);
                    results.confirmation = `Error: ${confirmError.message}`;
                } else {
                    console.log('RESEND_SUCCESS_CONFIRMATION:', confirmData?.id);
                    results.confirmation = `Success (ID: ${confirmData?.id})`;
                }

            } catch (err: any) {
                results.resend = `Catch: ${err.message}`;
            }
        }

        // 2. Google Sheets
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
                
                const rowValues = isFinancialTestLead
                    ? [new Date().toISOString(), name, email, source, testScore, testDiagnosis, testWeakArea, testMarginProtection, testQuoteTimeRecovered, testAutomationPotential, serializedAnswers]
                    : [new Date().toISOString(), name, email, profession || '', phone || '', company || '', country || '', website || '', formatBooleanField(termsConsent), formatBooleanField(whatsappConsent), formatBooleanField(feedbackConsent), source];

                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: `${targetSheetName}!A1`,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values: [rowValues] },
                });
                results.sheets = 'Success';
            } catch (err: any) {
                results.sheets = `Error: ${err.message}`;
            }
        }

        // 3. MailerLite
        if (process.env.MAILERLITE_API_KEY) {
            try {
                const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
                    },
                    body: JSON.stringify({
                        email,
                        status: 'active',
                        fields: { name, phone: phone || '', company: company || '', country: country || '' },
                        groups: process.env.MAILERLITE_GROUP_ID ? [process.env.MAILERLITE_GROUP_ID] : []
                    })
                });
                results.mailerlite = mlResponse.ok ? 'Success' : `Error: ${mlResponse.status}`;
            } catch (err: any) {
                results.mailerlite = `Catch: ${err.message}`;
            }
        }

        return data({ message: 'Lead processing completed', details: results });

    } catch (err: any) {
        console.error('Action error:', err);
        return data({ error: 'Internal server error', message: err.message }, { status: 500 });
    }
}

function generateConfirmationHtml(name: string, lang: string, isTest: boolean) {
    const isEn = lang === 'en';
    const content = {
        title: isEn ? 'Welcome to Nougram' : 'Bienvenido a Nougram',
        greeting: isEn ? `Hi ${name}! 👋` : `¡Hola ${name}! 👋`,
        intro: isTest 
            ? (isEn ? 'Thank you for completing the Financial Health Test.' : 'Gracias por completar el Test de Salud Financiera.')
            : (isEn ? 'Thank you for joining the Nougram Beta.' : 'Gracias por registrarte para la Beta de Nougram.'),
        body: isTest
            ? (isEn 
                ? 'We have received your data and our team is analyzing the results to help you optimize your business margins and quoting process. We will contact you shortly with a personalized diagnosis.'
                : 'Hemos recibido tus datos y nuestro equipo está analizando los resultados para ayudarte a optimizar tus márgenes y procesos de cotización. Nos pondremos en contacto contigo pronto con un diagnóstico personalizado.')
            : (isEn
                ? 'We are excited to have you with us. Nougram is designed to transform the way you manage your quotes and creative services using the power of AI.'
                : 'Estamos muy emocionados de tenerte con nosotros. Nougram está diseñado para transformar la manera en que gestionas tus cotizaciones y servicios creativos con el poder de la Inteligencia Artificial.'),
        nextStepsTitle: isEn ? 'What follows?' : '¿Qué sigue?',
        step1: isTest
            ? (isEn ? 'Expert review of your specific situation.' : 'Revisión experta de tu situación específica.')
            : (isEn ? 'We will notify you as soon as your access is ready.' : 'Te avisaremos en cuanto tu acceso esté listo.'),
        step2: isEn ? 'Updates on our most important features.' : 'Noticias sobre nuestras actualizaciones más importantes.',
        step3: isEn ? 'Priority access to new AI tools.' : 'Acceso prioritario a nuevas herramientas de IA.',
        cta: isEn ? 'Visit Website' : 'Visitar Sitio Web',
        footer: isEn ? 'Strategic Digital Engineering Agency' : 'Agencia de Ingeniería Digital Estratégica'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header { background-color: #020617; padding: 40px 20px; text-align: center; }
        .logo { width: 160px; height: auto; }
        .content { padding: 40px 30px; color: #1e293b; line-height: 1.6; }
        .footer { background-color: #f8fafc; padding: 30px 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 25px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2); }
        h1 { color: #0f172a; font-size: 26px; margin-bottom: 20px; font-weight: 700; letter-spacing: -0.025em; }
        p { margin-bottom: 18px; font-size: 16px; }
        .steps { background-color: #f1f5f9; padding: 25px; border-radius: 12px; margin-top: 30px; }
        .steps h3 { margin-top: 0; color: #0f172a; font-size: 18px; margin-bottom: 15px; }
        .steps ul { margin: 0; padding-left: 20px; color: #334155; }
        .steps li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://nougram.co/logo-nougram.png" alt="Nougram" class="logo">
        </div>
        <div class="content">
            <h1>${content.greeting}</h1>
            <p>${content.intro}</p>
            <p>${content.body}</p>
            <div class="steps">
                <h3>${content.nextStepsTitle}</h3>
                <ul>
                    <li>${content.step1}</li>
                    <li>${content.step2}</li>
                    <li>${content.step3}</li>
                </ul>
            </div>
            <div style="text-align: center;">
                <a href="https://nougram.co" class="button">${content.cta}</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Nougram</strong></p>
            <p>${content.footer}</p>
            <p>&copy; 2026 Nougram. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;
}
