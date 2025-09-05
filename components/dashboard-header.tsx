"use client"

export function DashboardHeader() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">Shipment Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Admin Panel</span>
        </div>
      </div>
    </header>
  )
}
