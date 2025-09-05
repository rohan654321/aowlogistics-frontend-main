"use client"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { OrderStatusChart } from "@/components/order-status-chart"
import { RecentOrders } from "@/components/recent-orders"
import { fetchDashboard, fetchShipments, type Shipment } from "@/lib/api"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        // Fetch summary stats - use the correct endpoint
        const dashData = await fetchDashboard()
        setDashboardData(dashData)

        // Fetch recent orders/shipments
        const shipmentsRes = await fetchShipments({ page: 1, pageSize: 5, sort: "orderDate:desc" })
        setRecentShipments(shipmentsRes.data)
      } catch (err: any) {
        console.error("Error: Failed to fetch dashboard:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) return <div className="p-8 text-white">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

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
          <StatsCards stats={dashboardData?.stats} loading={loading} />

          <div className="grid lg:grid-cols-2 gap-6">
            <OrderStatusChart stats={dashboardData?.stats} loading={loading} />
            <RecentOrders shipments={recentShipments} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  )
}