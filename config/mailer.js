import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS en lugar de SSL directo
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Timeouts más generosos para entornos como Railway
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verifica la conexión al arrancar (no bloquea, solo avisa)
transporter.verify((error) => {
  if (error) {
    console.error("[mailer] Error de conexión SMTP:", error.message);
  } else {
    console.log("[mailer] SMTP de Gmail listo para enviar correos");
  }
});

export default transporter;