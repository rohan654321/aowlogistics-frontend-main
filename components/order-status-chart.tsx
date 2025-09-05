"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

interface OrderStatusChartProps {
  stats: any
  loading?: boolean
}

export function OrderStatusChart({ stats, loading }: OrderStatusChartProps) {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Order Status</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  const total = stats?.totalShipments || 1 // Avoid division by zero

  const chartData = [
    {
      name: "In Transit",
      value: Math.round((stats?.inTransitCount / total) * 100),
      color: "#22c55e",
    },
    {
      name: "Picked Up",
      value: Math.round(
        ((stats?.totalShipments - stats?.inTransitCount - stats?.deliveredCount - stats?.pendingCount) / total) * 100,
      ),
      color: "#8b5cf6",
    },
    {
      name: "Delivered",
      value: Math.round((stats?.deliveredCount / total) * 100),
      color: "#f59e0b",
    },
    {
      name: "On The Way",
      value: Math.round(((stats?.inTransitCount * 0.3) / total) * 100),
      color: "#10b981",
    },
    {
      name: "Yet To Be Picked",
      value: Math.round((stats?.pendingCount / total) * 100),
      color: "#6366f1",
    },
  ].filter((item) => item.value > 0) // Only show non-zero values

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Order Status</h2>
      <p className="text-gray-400 text-sm mb-6">Distribution of orders by status</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
