import nodemailer from 'nodemailer';

export class EmailError extends Error {
  constructor(message, ...errors) {
    super(message);
    this.errors = errors;
    this.name = 'EmailError';
  }
}

export class EmailService {
  #transporter;

  constructor(host, user, pass) {
    try {
      this.#transporter = nodemailer.createTransport({
        host,
        port: 587,
        auth: { user, pass },
      });
    } catch (error) {
      throw new EmailError('Failed to create transporter.', error.message);
    }
  }

  async sendAccountConfirmation(userId, userEmail, token, html, from) {
    try {
      const confirmationUrl = `http://${
        process.env.DOMAIN || 'localhost'
      }:3000/api/users/${userId}/confirm?token=${token}`;

      const htmlWithUrl = html.replace(/{{confirmationUrl}}/g, confirmationUrl);

      const mailOptions = {
        from: `"${from}"`,
        to: userEmail,
        subject: 'Confirm Your User Account',
        html: htmlWithUrl,
      };

      return await this.#transporter.sendMail(mailOptions);
    } catch (error) {
      throw new EmailError(
        'Failed to send account confirmation email.',
        error.message
      );
    }
  }
}
