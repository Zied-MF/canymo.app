import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { vetEmail, dogName, reportHtml } = await request.json();

    if (!vetEmail || !dogName || !reportHtml) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Canymo <contact@canymo.com>',
      to: vetEmail,
      subject: `Rapport de santé de ${dogName} — Canymo`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"/></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1A1209;">
          <div style="background: #1C3D2A; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">🐾 Rapport de santé — ${dogName}</h1>
            <p style="color: #A7D3B7; margin: 6px 0 0; font-size: 13px;">Généré par Canymo</p>
          </div>

          <div style="background: #FFFAF4; border: 1px solid #E5D5C0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            ${reportHtml}
          </div>

          <hr style="border: none; border-top: 1px solid #E5D5C0; margin: 20px 0;"/>
          <p style="color: #9A8070; font-size: 12px; line-height: 1.6;">
            Ce rapport est fourni à titre informatif et ne remplace pas un examen vétérinaire.<br/>
            Généré par <a href="https://canymo.com" style="color: #2D6444;">Canymo</a> — Coaching bien-être pour chiens.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, id: data.id });
  } catch (err) {
    return Response.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
