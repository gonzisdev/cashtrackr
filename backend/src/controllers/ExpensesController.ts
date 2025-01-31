import type { Request, Response } from 'express'
import Expense from '../models/Expense'

export class ExpensesController {
  static create = async (req: Request, res: Response) => {
    try {
      const expense = await Expense.create(req.body)
      expense.budgetId = req.budget.id
      await expense.save()
      res.status(201).json('Gasto añadido correctamente')
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static getById = async (req: Request, res: Response) => {
    res.status(200).json(req.expense)
  }

  static updateById = async (req: Request, res: Response) => {
    await req.expense.update(req.body)
    res.status(200).json('Gasto actualizado correctamente')
  }

  static deleteById = async (req: Request, res: Response) => {
    await req.expense.destroy()
    res.status(200).json('Gasto eliminado correctamente')
  }
}
