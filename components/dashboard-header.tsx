import { Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-black font-bold text-sm">📦</span>
              </div>
              <span className="text-white font-bold text-xl">AOW Logistics</span>
            </div>

            <nav className="flex items-center gap-6">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <span>🏠</span>
                Dashboard
              </button>
              <button className="text-gray-400 hover:text-white flex items-center gap-2">
                <span>⊕</span>
                Create Shipment
              </button>
              <button className="text-gray-400 hover:text-white flex items-center gap-2">
                <span>📦</span>
                Shipments
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button className="text-gray-400 hover:text-white">
              <span className="text-xl">↗</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
