import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { OrderStatusChart } from "@/components/order-status-chart"
import { RecentOrders } from "@/components/recent-orders"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
            <span className="text-lg">⊕</span>
            Create Shipment
          </button>
        </div>

        <div className="grid gap-6">
          <StatsCards />

          <div className="grid lg:grid-cols-2 gap-6">
            <OrderStatusChart />
            <RecentOrders />
          </div>
        </div>
      </main>
    </div>
  )
}
