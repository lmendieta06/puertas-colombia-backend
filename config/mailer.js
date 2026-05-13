import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
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