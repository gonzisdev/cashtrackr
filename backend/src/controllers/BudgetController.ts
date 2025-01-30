import type { Request, Response } from 'express'
import Budget from '../models/Budget'
import Expense from '../models/Expense'

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const budgets = await Budget.findAll({
        order: [['createdAt', 'DESC']]
        //TODO: Filtrar por usuario autenticado
      })
      res.status(200).json(budgets)
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static create = async (req: Request, res: Response) => {
    try {
      const budget = new Budget(req.body)
      await budget.save()
      res.status(201).json('Presupuesto creado correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static getById = async (req: Request, res: Response) => {
    const budget = await Budget.findByPk(req.budget.id, {
      include: [Expense]
    })
    res.status(200).json(budget)
  }

  static updateById = async (req: Request, res: Response) => {
    try {
      await req.budget.update(req.body)
      res.status(200).json('Presupuesto actualizado correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static deleteById = async (req: Request, res: Response) => {
    try {
      await req.budget.destroy()
      res.status(200).json('Presupuesto eliminado correctamente')
    } catch (error) {
      //console.error(error)
      res.status(500).json({ error: 'Hubo un error' })
    }
  }
}
