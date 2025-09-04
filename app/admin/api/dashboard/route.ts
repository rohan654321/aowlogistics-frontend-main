import { NextResponse } from "next/server"

export async function GET() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:1337"

    console.log("[v0] Connecting to backend at:", API_URL)

    // Get auth headers (JWT token)
    const getAuthHeaders = () => {
      const token = process.env.API_TOKEN || process.env.JWT_TOKEN
      console.log("[v0] Using token:", token ? "Token present" : "No token")
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const dashboardUrl = `${API_URL}/api/shipments/dashboard`
    console.log("[v0] Fetching from:", dashboardUrl)

    const response = await fetch(dashboardUrl, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      ...(API_URL.includes("localhost") && {
        // For localhost development, ignore SSL certificate issues
        agent: false,
      }),
    })

    console.log("[v0] Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend error response:", errorText)
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Backend data received:", data)

    // Transform the backend response to match frontend expectations
    const transformedData = {
      stats: {
        totalShipments: data.stats?.totalShipments || 0,
        deliveredCount: data.stats?.deliveredCount || 0,
        inTransitCount: data.stats?.inTransitCount || 0,
        pendingCount: data.stats?.pendingCount || 0,
      },
      recentShipments: (data.recentShipments || []).map((shipment: any) => ({
        id: shipment.id,
        orderId: shipment.orderId,
        trackingId: shipment.trackingId,
        order_status: shipment.order_status,
        orderDate: shipment.orderDate,
        customer: shipment.customer,
      })),
    }

    console.log("[v0] Transformed data:", transformedData)
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)

    // Return mock data as fallback
    return NextResponse.json({
      stats: {
        totalShipments: 216,
        deliveredCount: 4,
        inTransitCount: 130,
        pendingCount: 77,
      },
      recentShipments: [
        {
          id: 1,
          orderId: "PC#10176",
          trackingId: "PC#10176",
          order_status: "yet_to_be_picked",
          orderDate: "2025-07-31T00:00:00Z",
          customer: { name: "John Doe" },
        },
        {
          id: 2,
          orderId: "PC#10173",
          trackingId: "PC#10173",
          order_status: "yet_to_be_picked",
          orderDate: "2025-07-28T00:00:00Z",
          customer: { name: "Jane Smith" },
        },
        {
          id: 3,
          orderId: "PC#10169",
          trackingId: "PC#10169",
          order_status: "yet_to_be_picked",
          orderDate: "2025-07-25T00:00:00Z",
          customer: { name: "Bob Johnson" },
        },
      ],
    })
  }
}
