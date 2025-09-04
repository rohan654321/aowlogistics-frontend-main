"use client"

import { useEffect, useState } from "react"

interface DashboardStats {
  totalShipments: number
  deliveredCount: number
  inTransitCount: number
  pendingCount: number
}
interface StatsCardsProps {
  stats: DashboardStats
  loading?: boolean
}

export function StatsCards({ stats,  }: StatsCardsProps) {
  // const [stats, setStats] = useState<DashboardStats>({
  //   totalShipments: 0,
  //   deliveredCount: 0,
  //   inTransitCount: 0,
  //   pendingCount: 0,
  // })
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual backend URL
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        // setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      // setLoading(false)
    }
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalShipments,
      description: "All orders in the system",
      icon: "📊",
    },
    {
      title: "Orders Delivered",
      value: stats.deliveredCount,
      description: "Successfully delivered orders",
      icon: "✅",
    },
    {
      title: "Orders In Transit",
      value: stats.inTransitCount,
      description: "Orders currently in transit",
      icon: "🚚",
    },
    {
      title: "Yet to be Picked",
      value: stats.pendingCount,
      description: "Orders waiting to be picked up",
      icon: "⏳",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
            <span className="text-gray-400">{card.icon}</span>
          </div>
          {/* <div className="text-3xl font-bold text-white mb-2">{loading ? "..." : card.value.toLocaleString()}</div> */}
          <p className="text-gray-500 text-sm">{card.description}</p>
        </div>
      ))}
    </div>
  )
}
