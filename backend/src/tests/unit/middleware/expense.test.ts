import { createRequest, createResponse } from 'node-mocks-http'
import { validateExpenseExists } from '../../../middleware/expense'
import Expense from '../../../models/Expense'
import { expenses } from '../../mocks/expenses'
import { hasAccess } from '../../../middleware/budget'
import { budgets } from '../../mocks/budgets'

jest.mock('../../../models/Expense', () => ({
  findByPk: jest.fn()
}))

describe('Expenses Middleware - validateExpenseExists', () => {
  beforeEach(() => {
    ;(Expense.findByPk as jest.Mock).mockImplementation((id) => {
      const expense = expenses.find((e) => e.id === id)
      return Promise.resolve(expense)
    })
  })

  it('should handle a non-existent expense', async () => {
    const req = createRequest({
      params: { expenseId: 120 }
    })
    const res = createResponse()
    const next = jest.fn()
    await validateExpenseExists(req, res, next)

    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({ error: 'Gasto no encontrado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next() if expense exists', async () => {
    const req = createRequest({
      params: { expenseId: 1 }
    })
    const res = createResponse()
    const next = jest.fn()
    await validateExpenseExists(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.expense).toEqual(expenses[0])
  })

  it('should handle error when fetching expense', async () => {
    ;(Expense.findByPk as jest.Mock).mockRejectedValue(new Error())
    const req = createRequest({
      params: { expenseId: 1 }
    })
    const res = createResponse()
    const next = jest.fn()
    await validateExpenseExists(req, res, next)

    expect(res.statusCode).toBe(500)
    expect(next).not.toHaveBeenCalled()
    expect(res._getJSONData()).toEqual({ error: 'Hubo un error' })
  })

  it('should prevent unauthorized users from adding expenses', async () => {
    const req = createRequest({
      method: 'POST',
      url: '/api/budgets/:budgetId/expenses',
      budget: budgets[0],
      user: { id: 20 },
      body: {
        name: 'Gasto de prueba',
        amount: 500
      }
    })
    const res = createResponse()
    const next = jest.fn()
    hasAccess(req, res, next)

    const data = res._getJSONData()
    expect(res.statusCode).toBe(401)
    expect(data).toEqual({ error: 'Acción no válida' })
    expect(next).not.toHaveBeenCalled()
  })
})
