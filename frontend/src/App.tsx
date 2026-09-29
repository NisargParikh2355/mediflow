import { useEffect, useState } from 'react'

import DoctorList from './components/DoctorList'
import Navbar from './components/Navbar'

import './App.css'

type Doctor = {
  name: string
  specialization: string
}

function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('Pending')
  const [name, setName] = useState('')
  const [patientError, setPatientError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const doctorData: Doctor[] = [
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

        setDoctors(doctorData)
        setLoading(false)
      } catch {
        setError('Unable to load doctors')
        setLoading(false)
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

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
              setPatientError('Please enter your name')
              return
            }

            setPatientError('')
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

        {patientError && <p>{patientError}</p>}

        <p>Patient Name: {name}</p>

        {loading ? (
          <p className="mt-6 text-gray-600">
            Loading doctors...
          </p>
        ) : error ? (
          <p className="mt-6 text-red-600">
            {error}
          </p>
        ) : (
          <DoctorList doctors={doctors} />
        )}
      </main>
    </>
  )
}

export default App