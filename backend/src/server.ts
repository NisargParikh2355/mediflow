import express from 'express'
import cors from 'cors'

const app = express()

const PORT = 5000

app.use(cors())

const doctors = [
  {
    name: 'Dr. Patel',
    specialization: 'General Physician',
  },
  {
    name: 'Dr. Shah',
    specialization: 'Cardiologist',
  },
  {
    name: 'Dr. Mehta',
    specialization: 'Dermatologist',
  },
]

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediFlow backend is running',
  })
})

app.get('/api/doctors', (req, res) => {
  res.json(doctors)
})

app.listen(PORT, () => {
  console.log(`MediFlow backend running on http://localhost:${PORT}`)
})