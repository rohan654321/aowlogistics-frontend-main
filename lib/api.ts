  export const API_URL =
    (typeof window !== "undefined" ? (window as any).__NEXT_PUBLIC_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:1337"

  export const STRAPI_URL = API_URL

  export function getAuthHeaders(): HeadersInit {
    if (typeof window !== "undefined") {
      const jwt = localStorage.getItem("jwt")
      return jwt ? { Authorization: `Bearer ${jwt}` } : {}
    }
    return {}
  }

  /**
   * Admin login against Express backend.
   * Stores JWT in localStorage under 'jwt' to match existing AdminLayout.
   */
  export async function login(identifier: string, password: string) {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    })

    if (!res.ok) {
      throw new Error("Invalid credentials")
    }

    const data = await res.json()
    if (typeof window !== "undefined" && data?.token) {
      localStorage.setItem("jwt", data.token)
    }
    return data
  }

  /**
   * Fetch dashboard summary from Express backend
   */
export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/shipments/dashboard`, { // Changed from /api/dashboard to /api/shipments/dashboard
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

  /**
   * Optional: fetch a detailed dashboard section, e.g., summary
   */
export async function fetchDashboardSummary() {
  const res = await fetch(`${API_URL}/api/shipments/dashboard/summary`, { // Changed from /api/dashboard/summary to /api/shipments/dashboard/summary
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
  

  /**
   * Helper to extract a free-text search from the Strapi-style filters
   * your existing UI builds, so we can pass it to the Express API.
   */
  function extractSearchFromStrapiFilters(filters: any): string | undefined {
    if (!filters || typeof filters !== "object") return undefined
    const ors = filters.$or as any[] | undefined
    const tryKeys = ["trackingId", "orderId", "customer.name"]
    if (Array.isArray(ors)) {
      for (const cond of ors) {
        for (const key of tryKeys) {
          const val = cond?.[key]?.$containsi ?? cond?.[key]?.$eq ?? cond?.[key]?.$contains ?? undefined
          if (typeof val === "string" && val.trim()) return val.trim()
        }
      }
    }
    return undefined
  }

  function extractStatusFromStrapiFilters(filters: any): string | undefined {
    if (!filters || typeof filters !== "object") return undefined
    if (typeof filters.order_status === "string") return filters.order_status
    if (filters.order_status?.$eq) return String(filters.order_status.$eq)
    return undefined
  }

  /**
   * Convert a backend shipment object into the Strapi-like shape
   * expected by your existing Shipments page (attributes.*).
   */
  function adaptShipmentToStrapiLike(shipment: any) {
    // Check if this is already a formatted response from our backend
    if (shipment.statusUpdates) {
      // This is already in the correct format
      return {
        id: shipment.id,
        attributes: {
          orderId: shipment.orderId,
          trackingId: shipment.trackingId,
          orderDate: shipment.orderDate,
          estimatedDelivery: shipment.estimatedDelivery,
          order_status: shipment.order_status,
          status: shipment.status || shipment.order_status,
          customer: shipment.customer,
          statusUpdates: shipment.statusUpdates,
        },
      }
    }

    // Original adapter code for other cases
    const customerRaw =
      shipment.customer ??
      (shipment.customerId
        ? {
            id: shipment.customerId,
            name: shipment.customerName,
            address: shipment.customerAddress ?? shipment.customer_address,
            phone: shipment.customerPhone ?? shipment.customer_phone,
          }
        : null)

    const rawUpdates = shipment.statusUpdates ?? shipment.status_updates ?? shipment.history ?? shipment.updates ?? []

    return {
      id: shipment.id,
      documentId: shipment.documentId ?? String(shipment.id),
      attributes: {
        orderId: shipment.orderId ?? shipment.order_id,
        trackingId: shipment.trackingId ?? shipment.tracking_id,
        orderDate: shipment.orderDate ?? shipment.order_date,
        estimatedDelivery: shipment.estimatedDelivery ?? shipment.estimated_delivery,
        order_status: shipment.order_status ?? shipment.status,
        status: shipment.order_status ?? shipment.status,
        originName: shipment.originName ?? shipment.origin_name ?? null,
        originAddress: shipment.originAddress ?? shipment.origin_address,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
        publishedAt: shipment.publishedAt ?? shipment.createdAt,
        customer: customerRaw
          ? {
              id: customerRaw.id,
              name: customerRaw.name ?? customerRaw.fullName ?? customerRaw.username ?? "N/A",
              address: customerRaw.address ?? shipment.customerAddress ?? shipment.customer_address ?? null,
              phone: customerRaw.phone ?? shipment.customerPhone ?? shipment.customer_phone ?? null,
            }
          : null,
        statusUpdates: Array.isArray(rawUpdates) ? rawUpdates : [],
      },
    }
  }

  /**
   * Normalize pagination metadata into Strapi-like meta.pagination
   */
  function toStrapiMetaPagination(input: {
    page?: number
    limit?: number
    total?: number
  }) {
    const page = Number(input.page || 1)
    const pageSize = Number(input.limit || 10)
    const total = Number(input.total || 0)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    return {
      meta: {
        pagination: { page, pageSize, pageCount, total },
      },
    }
  }

  /**
   * Fetch shipments from Express backend and adapt the response to match
   * your existing UI's expectations (data[], meta.pagination).
   */
  export async function fetchShipments({
    page = 1,
    pageSize = 10,
    filters = {},
    sort,
  }: {
    page?: number
    pageSize?: number
    filters?: any
    sort?: string
  } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })

    const search = extractSearchFromStrapiFilters(filters)
    const status = extractStatusFromStrapiFilters(filters)
    if (search) params.set("search", search)
    if (status && status !== "all") params.set("status", status)
    if (sort) params.set("sort", sort)

    const res = await fetch(`${API_URL}/api/shipments?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch shipments: ${res.status} ${res.statusText}`)
    }

    const raw = await res.json()

    // Handle a few common shapes:
    // 1) { shipments: [...], pagination: { page, limit, total } }
    // 2) { data: [...], meta: {...} } (already Strapi-like)
    // 3) [...] (array only)
    if (Array.isArray(raw)) {
      const adapted = raw.map(adaptShipmentToStrapiLike)
      return {
        data: adapted,
        ...toStrapiMetaPagination({
          page,
          limit: pageSize,
          total: adapted.length,
        }),
      }
    }

    if (raw?.data && raw?.meta) {
      // Already Strapi-like
      return raw
    }

    const shipments = raw.shipments ?? raw.items ?? raw.results ?? []
    const pagination = raw.pagination ?? {
      page,
      limit: pageSize,
      total: raw.total ?? shipments.length,
    }

    return {
      data: shipments.map(adaptShipmentToStrapiLike),
      ...toStrapiMetaPagination(pagination),
    }
  }

  /**
   * Public shipment tracking by trackingId via Express
   */
  export async function fetchShipment(trackingId: string) {
    // Add validation for trackingId
    if (!trackingId || trackingId === "undefined") {
      throw new Error("Tracking ID is required")
    }

    const normalized = trackingId.trim()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    }

    try {
      // Use only the existing track endpoint
      const res = await fetch(`${API_URL}/api/shipments/track/${encodeURIComponent(normalized)}`, {
        headers,
      })

      if (!res.ok) {
        // If the track endpoint fails, try a direct query as fallback
        const fallbackRes = await fetch(`${API_URL}/api/shipments?search=${encodeURIComponent(normalized)}`, { headers })

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json()
          const shipments = fallbackData.shipments || fallbackData.data || []

          // Find the shipment with matching tracking ID
          const matchingShipment = shipments.find(
            (shipment: any) =>
              shipment.trackingId?.toLowerCase() === normalized.toLowerCase() ||
              shipment.attributes?.trackingId?.toLowerCase() === normalized.toLowerCase(),
          )

          if (matchingShipment) {
            const adapted = adaptShipmentToStrapiLike(matchingShipment)

            // Sort status updates descending by createdAt if present
            const updates = adapted.attributes?.statusUpdates
            if (Array.isArray(updates)) {
              updates.sort(
                (a: any, b: any) =>
                  new Date(b.createdAt ?? b.attributes?.createdAt ?? 0).getTime() -
                  new Date(a.createdAt ?? a.attributes?.createdAt ?? 0).getTime(),
              )
            }

            return adapted
          }
        }

        throw new Error(`Shipment not found for trackingId "${normalized}"`)
      }

      const raw = await res.json()

      // If backend returns { shipment: {...} }, unwrap it
      const item = raw?.shipment ?? raw
      const adapted = adaptShipmentToStrapiLike(item)

      // Sort status updates descending by createdAt if present
      const updates = adapted.attributes?.statusUpdates
      if (Array.isArray(updates)) {
        updates.sort(
          (a: any, b: any) =>
            new Date(b.createdAt ?? b.attributes?.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? a.attributes?.createdAt ?? 0).getTime(),
        )
      }

      return adapted
    } catch (error) {
      console.error("Error fetching shipment:", error)
      throw new Error(`Failed to fetch shipment: ${error.message}`)
    }
  }

  /**
   * Fetch a shipment by numeric id (fallback when tracking lookups 404)
   */
  export async function fetchShipmentById(id: string | number): Promise<Shipment> {
    const res = await fetch(`${API_URL}/api/shipments/${encodeURIComponent(String(id))}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    })
    if (!res.ok) {
      throw new Error(`Shipment not found for id "${id}"`)
    }
    const raw = await res.json().catch(() => undefined as any)
    const item = Array.isArray(raw) ? raw[0] : (raw?.shipment ?? raw)
    const adapted = adaptShipmentToStrapiLike(item)

    const history = Array.isArray(adapted.attributes?.statusUpdates)
      ? (adapted.attributes.statusUpdates.map((u: any) => ({
          id: u.id ?? u.documentId ?? undefined,
          status: (u.status ?? u.attributes?.status) as ShipmentStatusKey,
          details: u.details ?? u.attributes?.details ?? null,
          timestamp: u.timestamp ?? u.attributes?.timestamp ?? u.createdAt ?? null,
          createdAt: u.createdAt ?? u.attributes?.createdAt ?? u.timestamp ?? null,
          location: u.location ?? u.attributes?.location ?? null,
        })) as ShipmentStatusUpdate[])
      : []

    // Sort newest first
    history.sort(
      (a, b) => new Date(b.createdAt ?? b.timestamp ?? 0).getTime() - new Date(a.createdAt ?? a.timestamp ?? 0).getTime(),
    )

    return {
      id: adapted.id,
      trackingId: adapted.attributes?.trackingId ?? adapted.attributes?.trackingId ?? "",
      code: adapted.attributes?.orderId ?? adapted.attributes?.orderId ?? null,
      estimatedDelivery: adapted.attributes?.estimatedDelivery ?? adapted.attributes?.estimatedDelivery ?? null,
      status: (adapted.attributes?.order_status ?? adapted.attributes?.status) as ShipmentStatusKey,
      customer: adapted.attributes?.customer
        ? {
            id: adapted.attributes.customer.id,
            name: adapted.attributes.customer.name,
            address: adapted.attributes.customer.address,
            phone: adapted.attributes.customer.phone,
          }
        : null,
      history,
    }
  }

  /**
   * Delete a shipment by ID via Express
   */
  export async function deleteShipment(id: string | number) {
    const res = await fetch(`${API_URL}/api/shipments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || "Failed to delete shipment")
    }

    return res.json()
  }

  /**
   * Delete status update by ID (for compatibility)
   */
  export async function deleteStatusUpdate(statusUpdateId: string) {
    const res = await fetch(`${API_URL}/api/shipments/status-updates/${statusUpdateId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || "Failed to delete status update")
    }

    return res.json()
  }

  export type ShipmentStatusKey =
    | "yet_to_be_picked"
    | "picked_up"
    | "intransit"
    | "on_the_way"
    | "onhold"
    | "delivered"
    | "returned"
    | "cancelled"

  export interface ShipmentStatusUpdate {
    location: any
    id?: number | string
    status: ShipmentStatusKey
    details?: string | null
    timestamp?: string | null
    createdAt?: string
  }

  export interface Shipment {
    id: number | string
    trackingId: string
    code?: string | null
    estimatedDelivery?: string | null
    status?: ShipmentStatusKey
    customer?: {
      id?: number | string
      name?: string
      address?: string
      phone?: string
    } | null
    history?: ShipmentStatusUpdate[]
  }

  export async function fetchShipmentByTrackingId(trackingId: string): Promise<Shipment> {
    if (!trackingId || trackingId === "undefined") {
      throw new Error("Tracking ID is required")
    }

    const adapted = await fetchShipment(trackingId)
    const history = Array.isArray(adapted.attributes?.statusUpdates)
      ? adapted.attributes.statusUpdates.map((u: any) => ({
          id: u.id ?? u.documentId ?? undefined,
          status: (u.status ?? u.attributes?.status) as ShipmentStatusKey,
          details: u.details ?? u.attributes?.details ?? null,
          timestamp: u.timestamp ?? u.attributes?.timestamp ?? u.createdAt ?? null,
          createdAt: u.createdAt ?? u.attributes?.createdAt ?? u.timestamp ?? null,
          location: u.location ?? u.attributes?.location ?? null,
        }))
      : []

    // Sort newest first
    history.sort(
      (a, b) => new Date(b.createdAt ?? b.timestamp ?? 0).getTime() - new Date(a.createdAt ?? a.timestamp ?? 0).getTime(),
    )

    return {
      id: adapted.id,
      trackingId: adapted.attributes?.trackingId ?? adapted.attributes?.trackingId ?? "",
      code: adapted.attributes?.orderId ?? adapted.attributes?.orderId ?? null,
      estimatedDelivery: adapted.attributes?.estimatedDelivery ?? adapted.attributes?.estimatedDelivery ?? null,
      status: (adapted.attributes?.order_status ?? adapted.attributes?.status) as ShipmentStatusKey,
      customer: adapted.attributes?.customer
        ? {
            id: adapted.attributes.customer.id,
            name: adapted.attributes.customer.name,
            address: adapted.attributes.customer.address,
            phone: adapted.attributes.customer.phone,
          }
        : null,
      history,
    }
  }

  export async function createShipmentStatusUpdate(
    trackingId: string,
    payload: {
      status: ShipmentStatusKey
      details?: string
      timestamp?: string
      shipmentId?: string | number
    },
  ) {
    // Add validation for trackingId
    if (!trackingId || trackingId === "undefined") {
      throw new Error("Tracking ID is required")
    }

    const normalized = trackingId.trim()

    // Try primary: POST /api/shipments/:trackingId/status
    const primary = await fetch(`${API_URL}/api/shipments/${encodeURIComponent(normalized)}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        status: payload.status,
        details: payload.details,
        timestamp: payload.timestamp,
      }),
    })
    if (primary.ok) {
      return primary.json().catch(() => ({}))
    }

    // If we already have a shipmentId hint, use it directly
    const directId = payload.shipmentId
    if (directId != null) {
      const fb = await fetch(`${API_URL}/api/shipments/status-updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          shipmentId: directId,
          status: payload.status,
          details: payload.details,
          timestamp: payload.timestamp,
        }),
      })
      if (!fb.ok) {
        const err = await fb.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create status update")
      }
      return fb.json()
    }

    // Resolve shipmentId via tracking as a fallback
    const shipment = await fetchShipmentByTrackingId(normalized).catch(() => null)
    const shipmentId = shipment?.id
    if (!shipmentId) {
      const err = await primary.json().catch(() => ({}) as any)
      throw new Error(err?.error || `Cannot create status update: shipment not found for trackingId "${normalized}"`)
    }

    // Fallback to generic status-updates create
    const fb = await fetch(`${API_URL}/api/status-updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        shipmentId,
        status: payload.status,
        details: payload.details,
        timestamp: payload.timestamp,
      }),
    })
    if (!fb.ok) {
      const err = await fb.json().catch(() => ({}))
      throw new Error(err?.error || "Failed to create status update")
    }
    return fb.json()
  }

  export async function deleteShipmentStatusUpdate(trackingId: string, updateId: string | number) {
    // Add validation for trackingId
    if (!trackingId || trackingId === "undefined") {
      throw new Error("Tracking ID is required")
    }

    const normalized = trackingId.trim()
    // try primary: DELETE /api/shipments/:trackingId/status/:id
    const primary = await fetch(
      `${API_URL}/api/shipments/${encodeURIComponent(normalized)}/status/${encodeURIComponent(String(updateId))}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      },
    )
    if (primary.ok) return primary.json().catch(() => ({}))

    // fallback to generic delete by id
    return deleteStatusUpdate(String(updateId))
  }

  /**
   * Create shipment:
   * 1) Create/find customer via /api/customers (Express)
   * 2) Create shipment via /api/shipments with customerId
   */
  export async function createShipment(shipmentData: any) {
    try {
      // Step 1: create or find the customer
      const custRes = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: shipmentData.customer?.name,
          address: shipmentData.customer?.address,
          phone: shipmentData.customer?.phone,
          // backend defaults: isPublished true, publishedAt now
        }),
      })

      if (!custRes.ok) {
        const err = await custRes.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create/find customer")
      }

      const customer = await custRes.json()

      // Step 2: create the shipment
      const payload = {
        orderId: shipmentData.orderId,
        trackingId: shipmentData.trackingId,
        orderDate: shipmentData.orderDate,
        estimatedDelivery: shipmentData.estimatedDelivery,
        order_status: shipmentData.order_status ?? "yet_to_be_picked",
        originName: shipmentData.originName ?? null,
        originAddress: shipmentData.originAddress,
        customerId: customer.id ?? customer?.data?.id ?? customer?.customerId, // try common keys
      }

      const shipRes = await fetch(`${API_URL}/api/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!shipRes.ok) {
        const err = await shipRes.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to create shipment: ${shipRes.status} ${shipRes.statusText}`)
      }

      return await shipRes.json()
    } catch (error) {
      console.error("Error in createShipment:", error)
      throw error
    }
  }
