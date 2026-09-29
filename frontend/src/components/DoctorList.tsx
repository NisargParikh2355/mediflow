import DoctorCard from './DoctorCard'

type Doctor = {
  name: string
  specialization: string
}

type DoctorListProps = {
  doctors: Doctor[]
}

function DoctorList({ doctors }: DoctorListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.name}
          name={doctor.name}
          specialization={doctor.specialization}
          onViewProfile={() => {
            alert(`Viewing profile of ${doctor.name}`)
          }}
        />
      ))}
    </div>
  )
}

export default DoctorList