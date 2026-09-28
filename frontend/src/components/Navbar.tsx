type NavbarProps = {
  name: string
  showLogin: boolean
}

function Navbar({ name, showLogin }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white">
      <h2 className="text-2xl font-bold">
        {name}
      </h2>

      <div className="flex gap-6">
        <a href="#" className="hover:text-blue-200">
          Home
        </a>

        <a href="#" className="hover:text-blue-200">
          Doctors
        </a>

        <a href="#" className="hover:text-blue-200">
          Appointments
        </a>

        {showLogin && (
          <a href="#" className="hover:text-blue-200">
            Login
          </a>
        )}
      </div>
    </nav>
  )
}

export default Navbar