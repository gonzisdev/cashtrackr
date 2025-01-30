import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)

router.post(
  '/create-account',
  body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('email').isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.createAccount
)
router.post(
  '/confirm-account',
  body('token')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Token no válido'),
  handleInputErrors,
  AuthController.confirmAccount
)

router.post(
  '/login',
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  body('email').isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.login
)

router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.forgotPassword
)

router.post(
  '/validate-token',
  body('token')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Token no válido'),
  handleInputErrors,
  AuthController.validateToken
)

router.post(
  '/reset-password/:token',
  param('token')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Token no válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  handleInputErrors,
  AuthController.resetPasswordWithToken
)

router.get('/user', authenticate, AuthController.user)

router.post(
  '/update-password',
  authenticate,
  body('current_password')
    .notEmpty()
    .withMessage('La contraseña actual no puede estar vacía'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
  handleInputErrors,
  AuthController.udpateCurrentUserPassword
)

router.post(
  '/check-password',
  authenticate,
  body('password').notEmpty().withMessage('La contraseña no puede estar vacía'),
  handleInputErrors,
  AuthController.checkPassword
)

export default router
