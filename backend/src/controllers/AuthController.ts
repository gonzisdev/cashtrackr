import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const userExists = await User.findOne({ where: { email } })
    if (userExists) {
      const error = new Error('Un usuario con ese email ya está registrado')
      res.status(409).json({ error: error.message })
      return
    }
    try {
      const user = new User(req.body)
      user.password = await hashPassword(password)
      user.token = generateToken()
      await user.save()
      AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token
      })
      res.status(201).json('Cuenta creada correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body
    try {
      const user = await User.findOne({ where: { token } })
      if (!user) {
        const error = new Error('Token no válido')
        res.status(401).json({ error: error.message })
        return
      }
      user.confirmed = true
      user.token = null
      await user.save()
      res.status(200).json('Cuenta confirmada correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }
}
