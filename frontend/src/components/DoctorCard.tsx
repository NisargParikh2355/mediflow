type DoctorCardProps = {
  name: string
  specialization: string
}

function DoctorCard({ name, specialization }: DoctorCardProps) {
  return (
    <div className="mt-6 w-80 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800">
        {name}
      </h3>

      <p className="mt-2 text-gray-600">
        {specialization}
      </p>

      <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        View Profile
      </button>
    </div>
  )
}

export default DoctorCard
