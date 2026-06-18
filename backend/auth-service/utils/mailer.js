/**
 * SMTP mailer (nodemailer).
 *
 * Configured via env vars (see config/custom-environment-variables.json):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * If SMTP_HOST is empty the mailer is treated as "not configured": callers get
 * `false` back and are expected to fall back (e.g. log the token server-side)
 * so the flow still works during local setup before SMTP credentials exist.
 */
const nodemailer = require('nodemailer');
const config     = require('config');
const winston    = require('winston');

function smtpConfig() {
  const host = config.has('smtp.host') ? config.get('smtp.host') : '';
  if (!host) return null;
  return {
    host,
    port: Number(config.has('smtp.port') ? config.get('smtp.port') : 587) || 587,
    user: config.has('smtp.user') ? config.get('smtp.user') : '',
    pass: config.has('smtp.pass') ? config.get('smtp.pass') : '',
    from: (config.has('smtp.from') && config.get('smtp.from')) || 'Unity Fitness <no-reply@unityfitness.ma>',
  };
}

let transporter = null;
function getTransporter(cfg) {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465, // 465 = implicit TLS; 587/25 = STARTTLS
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
  return transporter;
}

/**
 * Email a password-reset token. Returns true if an email was dispatched,
 * false if SMTP isn't configured (the caller should then log the token).
 */
async function sendPasswordResetEmail(to, token, ttlMinutes) {
  const cfg = smtpConfig();
  if (!cfg) {
    winston.warn(`SMTP not configured — reset token for ${to}: ${token}`);
    return false;
  }

  await getTransporter(cfg).sendMail({
    from: cfg.from,
    to,
    subject: 'Réinitialisation de votre mot de passe Unity Fitness',
    text:
      `Vous avez demandé la réinitialisation de votre mot de passe.\n\n` +
      `Votre code de réinitialisation (valable ${ttlMinutes} minutes) :\n\n${token}\n\n` +
      `Saisissez ce code sur la page « Réinitialiser le mot de passe », avec votre nouveau mot de passe.\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
    html:
      `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>` +
      `<p>Votre code de réinitialisation (valable <strong>${ttlMinutes} minutes</strong>) :</p>` +
      `<p style="font-family:monospace;font-size:14px;word-break:break-all;background:#f4f4f5;padding:12px 14px;border-radius:8px">${token}</p>` +
      `<p>Saisissez ce code sur la page « Réinitialiser le mot de passe », avec votre nouveau mot de passe.</p>` +
      `<p style="color:#888;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
  });
  return true;
}

module.exports = { sendPasswordResetEmail };
