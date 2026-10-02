type AdminDashboardProps = {
  name: string
  onLogout: () => void
}

function AdminDashboard({
  name,
  onLogout,
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              MediFlow
            </h1>

            <p className="text-sm text-slate-500">
              Administration Portal
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 p-8 text-white shadow-lg">
          <p className="text-sm font-medium text-slate-300">
            Administration Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome, {name}
          </h2>

          <p className="mt-3 max-w-2xl text-slate-300">
            Manage users, doctor verification and
            platform-level operations.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Users
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage registered patients and doctors.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Doctor Verification
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Review pending doctor registrations.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Appointments
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Monitor platform appointments.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Analytics
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              View platform activity and statistics.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Doctor Verification
          </h2>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-medium text-slate-600">
              No pending doctor applications
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Pending doctor registrations will appear here.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard