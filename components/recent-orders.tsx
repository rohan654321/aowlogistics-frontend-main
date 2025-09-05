"use client"

import { ArrowRight } from "lucide-react"
import type { Shipment } from "@/lib/api"

interface RecentOrder {
  id: number
  orderId: string
  trackingId: string
  order_status: string
  orderDate: string
  customer?: {
    name: string
  }
}

interface RecentOrdersProps {
  shipments: Shipment[]
  loading?: boolean
}

export function RecentOrders({ shipments, loading }: RecentOrdersProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      yet_to_be_picked: { label: "Yet to be picked", color: "bg-yellow-500" },
      picked_up: { label: "Picked up", color: "bg-blue-500" },
      in_transit: { label: "In transit", color: "bg-purple-500" },
      on_the_way: { label: "On the way", color: "bg-indigo-500" },
      out_for_delivery: { label: "Out for delivery", color: "bg-orange-500" },
      delivered: { label: "Delivered", color: "bg-green-500" },
      cancelled: { label: "Cancelled", color: "bg-red-500" },
      onhold: { label: "On hold", color: "bg-gray-500" },
      returned: { label: "Returned", color: "bg-pink-500" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  // Convert shipments to recent orders format
  const orders = shipments.map((shipment) => ({
    id: Number(shipment.id),
    orderId: shipment.code || shipment.trackingId,
    trackingId: shipment.trackingId,
    order_status: shipment.status || "unknown",
    orderDate: shipment.estimatedDelivery || new Date().toISOString(),
    customer: shipment.customer,
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
          <p className="text-gray-400 text-sm">Latest orders in the system</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No recent orders</div>
        ) : (
          orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-white">{order.orderId || order.trackingId}</span>
                  {getStatusBadge(order.order_status)}
                </div>
                <p className="text-gray-400 text-sm">{formatDate(order.orderDate)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          ))
        )}
      </div>

      {!loading && orders.length > 0 && (
        <button className="w-full mt-4 text-gray-400 hover:text-white text-sm font-medium py-2">View All Orders</button>
      )}
    </div>
  )
}
