import { createRequest, createResponse } from 'node-mocks-http'
import { ExpensesController } from '../../../controllers/ExpensesController'
import Expense from '../../../models/Expense'

jest.mock('../../../models/Expense', () => ({
  create: jest.fn()
}))

describe('ExpensesController.create', () => {
  it('should create a new expense', async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true)
    }
    ;(Expense.create as jest.Mock).mockResolvedValue(expenseMock)
    const req = createRequest({
      method: 'POST',
      url: '/api/budgets/:budgetId/expenses',
      body: {
        name: 'Gasto de prueba',
        amount: 500
      },
      budget: { id: 1 }
    })
    const res = createResponse()
    await ExpensesController.create(req, res)

    expect(res.statusCode).toBe(201)
    expect(res._getJSONData()).toBe('Gasto añadido correctamente')
    expect(expenseMock.save).toHaveBeenCalled()
    expect(expenseMock.save).toHaveBeenCalledTimes(1)
    expect(Expense.create).toHaveBeenCalledWith(req.body)
  })

  it('should handle expense creation error', async () => {
    const expenseMock = {
      save: jest.fn()
    }
    ;(Expense.create as jest.Mock).mockRejectedValue(new Error())
    const req = createRequest({
      method: 'POST',
      url: '/api/budgets/:budgetId/expenses',
      body: {
        name: 'Gasto de prueba',
        amount: 500
      },
      budget: { id: 1 }
    })
    const res = createResponse()
    await ExpensesController.create(req, res)

    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Hubo un error' })
    expect(expenseMock.save).not.toHaveBeenCalled()
    expect(Expense.create).toHaveBeenCalledWith(req.body)
  })
})
