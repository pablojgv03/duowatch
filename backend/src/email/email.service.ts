import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(to: string, token: string, displayName: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: 'DuoWatch <onboarding@resend.dev>',
        to,
        subject: 'Verifica tu cuenta en DuoWatch',
        html: this.buildVerificationEmailHtml(displayName, verifyUrl),
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, token: string, displayName: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: 'DuoWatch <onboarding@resend.dev>',
        to,
        subject: 'Restablece tu contraseña en DuoWatch',
        html: this.buildPasswordResetEmailHtml(displayName, resetUrl),
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendMatchNotificationEmail(
    to: string,
    friendName: string,
    movieTitle: string,
    posterPath: string | null,
  ) {
    const posterUrl = posterPath
      ? `https://image.tmdb.org/t/p/w185${posterPath}`
      : null;
    const matchesUrl = `${process.env.FRONTEND_URL}/matches`;

    try {
      await this.resend.emails.send({
        from: 'DuoWatch <onboarding@resend.dev>',
        to,
        subject: `¡Nuevo Match con ${friendName}! 🎬`,
        html: this.buildMatchNotificationEmailHtml(friendName, movieTitle, posterUrl, matchesUrl),
      });
      this.logger.log(`Match notification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send match notification email to ${to}`, error);
    }
  }

  private buildVerificationEmailHtml(displayName: string, verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta — DuoWatch</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#12121a;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#c026d3);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🎬 DuoWatch</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Encuentra el cine que ambos amarán</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:600;">¡Hola, ${displayName}!</h2>
              <p style="margin:0 0 24px;color:#a1a1aa;font-size:16px;line-height:1.6;">
                Gracias por unirte a DuoWatch. Para completar tu registro y empezar a descubrir películas con tus amigos, necesitas verificar tu dirección de email.
              </p>
              <p style="margin:0 0 32px;color:#a1a1aa;font-size:16px;line-height:1.6;">
                El enlace de verificación expirará en <strong style="color:#c084fc;">24 horas</strong>.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${verifyUrl}" style="color:#a78bfa;word-break:break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0d0d15;padding:24px 40px;border-top:1px solid rgba(139,92,246,0.1);">
              <p style="margin:0;color:#52525b;font-size:12px;text-align:center;line-height:1.6;">
                Si no creaste una cuenta en DuoWatch, ignora este email.<br>
                © 2026 DuoWatch. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private buildPasswordResetEmailHtml(displayName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña — DuoWatch</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#12121a;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#c026d3);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🎬 DuoWatch</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Encuentra el cine que ambos amarán</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:600;">¡Hola, ${displayName}!</h2>
              <p style="margin:0 0 24px;color:#a1a1aa;font-size:16px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en DuoWatch. Si fuiste tú, haz clic en el botón de abajo.
              </p>
              <p style="margin:0 0 32px;color:#a1a1aa;font-size:16px;line-height:1.6;">
                Este enlace expirará en <strong style="color:#c084fc;">1 hora</strong>.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color:#a78bfa;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0d0d15;padding:24px 40px;border-top:1px solid rgba(139,92,246,0.1);">
              <p style="margin:0;color:#52525b;font-size:12px;text-align:center;line-height:1.6;">
                Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta sigue siendo segura.<br>
                © 2026 DuoWatch. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private buildMatchNotificationEmailHtml(
    friendName: string,
    movieTitle: string,
    posterUrl: string | null,
    matchesUrl: string,
  ): string {
    const posterSection = posterUrl
      ? `<img src="${posterUrl}" alt="${movieTitle}" style="width:100px;height:150px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 24px;" />`
      : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Nuevo Match! — DuoWatch</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#12121a;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#c026d3);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🎬 DuoWatch</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">¡Tenéis gustos en común!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🎉</div>
              <h2 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:700;">¡Nuevo Match!</h2>
              <p style="margin:0 0 32px;color:#a1a1aa;font-size:16px;line-height:1.6;">
                Tú y <strong style="color:#c084fc;">${friendName}</strong> coincidís en:
              </p>
              ${posterSection}
              <div style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(192,38,211,0.15));border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:20px;margin-bottom:32px;">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${movieTitle}</p>
              </div>
              <!-- CTA Button -->
              <a href="${matchesUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                Ver mis matches
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0d0d15;padding:24px 40px;border-top:1px solid rgba(139,92,246,0.1);">
              <p style="margin:0;color:#52525b;font-size:12px;text-align:center;line-height:1.6;">
                Puedes desactivar las notificaciones por email en la configuración de tu perfil.<br>
                © 2026 DuoWatch. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
