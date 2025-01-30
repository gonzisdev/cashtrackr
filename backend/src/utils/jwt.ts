import jwt from 'jsonwebtoken'
process.loadEnvFile('.env')

export const generateJWT = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}
