import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'
process.loadEnvFile('.env')

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
      const userExists = await User.findOne({ where: { email } })
      if (userExists) {
        const error = new Error('Un usuario con ese email ya está registrado')
        res.status(409).json({ error: error.message })
        return
      }
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

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        const error = new Error('Usuario no encontrado')
        res.status(404).json({ error: error.message })
        return
      }
      if (!user.confirmed) {
        res.status(403).json({ error: 'La cuenta no ha sido confirmada' })
        return
      }
      const isPasswordCorrect = await checkPassword(password, user.password)
      if (!isPasswordCorrect) {
        res.status(401).json({ error: 'Contraseña incorrecta' })
        return
      }
      const token = generateJWT(user.id)
      res.status(200).json(token)
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        const error = new Error('Usuario no encontrado')
        res.status(404).json({ error: error.message })
        return
      }
      user.token = generateToken()
      await user.save()
      await AuthEmail.sendPasswordResetToken({
        name: user.name,
        email: user.email,
        token: user.token
      })
      res.status(200).json('Revisa tu email para reestablecer tu contraseña')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body
    try {
      const tokenExists = await User.findOne({ where: { token } })
      if (!tokenExists) {
        const error = new Error('Token no válido')
        res.status(404).json({ error: error.message })
        return
      }
      res.status(200).json('Token válido')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static resetPassordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params
    const { password } = req.body
    try {
      const user = await User.findOne({ where: { token } })
      if (!user) {
        const error = new Error('Token no válido')
        res.status(404).json({ error: error.message })
        return
      }
      user.password = await hashPassword(password)
      user.token = null
      await user.save()
      res.status(200).json('Contraseña reestablecida correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static user = async (req: Request, res: Response) => {
    res.status(200).json(req.user)
  }
}
