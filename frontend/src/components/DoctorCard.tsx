import Button from './Button'

type DoctorCardProps = {
  name: string
  specialization: string
  onViewProfile: () => void
}

function DoctorCard({
  name,
  specialization,
  onViewProfile,
}: DoctorCardProps) {
  return (
    <div className="w-80 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800">
        {name}
      </h3>

      <p className="mt-2 text-gray-600">
        {specialization}
      </p>

      <div className="mt-4">
        <Button onClick={onViewProfile}>
          View Profile
        </Button>
      </div>
    </div>
  )
}

export default DoctorCard