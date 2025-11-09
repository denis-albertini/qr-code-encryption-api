import nodemailer from 'nodemailer';

class EmailService {
  #transporter;

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendAccountConfirmation(userId, userEmail, token) {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Conta</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                background-color: #2c3e50;
                color: white;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 30px 20px;
                text-align: center;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #7f8c8d;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Assinatura Digital QR</h1>
            </div>
            
            <div class="content">
                <h2>Confirmação de Conta</h2>
                <p>Olá,</p>
                <p>Obrigado por criar uma conta em nosso aplicativo de QR Codes Digitalmente Assinados!</p>
                <p>Para ativar sua conta, clique no botão abaixo:</p>
                
                <a href="{{confirmationUrl}}" class="button">Confirmar Minha Conta</a>
                
                <p>Este link expirará em 24 horas por motivos de segurança.</p>
            </div>
            
            <div class="footer">
                <p>Se você não criou esta conta, por favor ignore este email.</p>
            </div>
        </div>
    </body>
    </html>`;

    const confirmationUrl = `http://${
      process.env.DOMAIN || 'localhost'
    }:3000/api/users/${userId}/confirm?token=${token}`;

    const htmlWithUrl = html.replace(/{{confirmationUrl}}/g, confirmationUrl);

    const mailOptions = {
      from: '"QRCode Encryption App"',
      to: userEmail,
      subject: 'Confirm Your User Account',
      html: htmlWithUrl,
    };

    return await this.#transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
