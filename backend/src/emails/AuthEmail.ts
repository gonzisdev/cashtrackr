import { transport } from '../config/nodemailer'

type EmailType = {
  name: string
  email: string
  token: string
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: 'Cashtrackr <admin@cashtrackr.com>',
      to: user.email,
      subject: 'Cashtrackr - Confirma tu cuenta',
      html: `
        <p>Hola ${user.name},</p>
        <p>Visita el siguiente enlace:</p>
        <a href="#">Confirmar cuenta</a>
        <p>Ingresa el código: <b>${user.token}</b></p>
      `
    })
  }
}
