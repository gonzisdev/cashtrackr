import { Request, Response, NextFunction } from 'express'
import { param, body, validationResult } from 'express-validator'
import Budget from '../models/Budget'

declare global {
  namespace Express {
    interface Request {
      budget?: Budget
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param('budgetId')
    .isInt()
    .custom((value) => value > 0)
    .withMessage('ID no válido')
    .run(req)

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }
  next()
}

export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params
    const budget = await Budget.findByPk(budgetId)
    if (!budget) {
      const error = new Error('Presupuesto no encontrado')
      res.status(404).json({ error: error.message })
      return
    }
    req.budget = budget

    next()
  } catch (error) {
    //console.error(error)
    res.status(500).json({ error: 'Hubo un error' })
  }
}

export const validateBudgetInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body('name')
    .notEmpty()
    .withMessage('El nombre del presuesto no puede estar vacío')
    .run(req)
  await body('amount')
    .notEmpty()
    .withMessage('La cantidad del presupuesto no puede estar vacía')
    .isNumeric()
    .withMessage('Cantidad no válida')
    .custom((value) => value > 0)
    .withMessage('El presupuesto debe ser mayor a 0')
    .run(req)

  next()
}

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget.userId !== req.user.id) {
    const error = new Error('Acción no válida')
    res.status(401).json({ error: error.message })
    return
  }
  next()
}
