import { useState } from 'react'

import DoctorList from './components/DoctorList'
import Navbar from './components/Navbar'

import './App.css'

function App() {
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

  const [status, setStatus] = useState('Pending')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  return (
    <>
      <Navbar
        name="MediFlow Healthcare"
        showLogin={true}
      />

      <main>
        <h1 className="text-4xl font-bold text-blue-600">
          My Appointment
        </h1>

        <p>Appointment Status: {status}</p>

        {status === 'Pending' && (
          <button
            onClick={() => setStatus('Confirmed')}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Accept Appointment
          </button>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (name.trim() === '') {
              setError('Please enter your name')
              return
            }

            setError('')
            alert(`Patient saved: ${name}`)
          }}
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <button type="submit">
            Save Patient
          </button>
        </form>

        {error && <p>{error}</p>}

        <p>Patient Name: {name}</p>

        <DoctorList doctors={doctors} />
      </main>
    </>
  )
}

export default App