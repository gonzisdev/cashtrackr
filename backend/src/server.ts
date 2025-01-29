import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'

async function connectDB() {
  try {
    await db.authenticate()
    db.sync()
    console.log(colors.blue.bold('Conectado a la base de datos'))
  } catch (error) {
    console.error(
      colors.red.bold('Error al conectar a la base de datos:'),
      error
    )
  }
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/budgets', budgetRouter)

export default app
