"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { TrackingForm } from "@/components/tracking-form";
import {
  fetchShipmentByTrackingId,
  fetchShipmentById,
  deleteShipmentStatusUpdate,
  type Shipment,
} from "@/lib/api";

const statusLabels: Record<NonNullable<Shipment["status"]>, string> = {
  yet_to_be_picked: "Yet to be picked",
  picked_up: "Picked up",
  intransit: "In Transit",
  on_the_way: "On the way",
  onhold: "On Hold",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export default function ShipmentDetailsClient({
  trackingId,
  shipmentId,
}: {
  trackingId: string;
  shipmentId?: string | number;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ["shipment", trackingId, shipmentId ?? null],
    async () => {
      try {
        // Try tracking-id first
        return await fetchShipmentByTrackingId(trackingId);
      } catch (err) {
        // If tracking lookup fails and we have a numeric id, try the id-based endpoint
        if (shipmentId && String(err) !== "Error: Tracking ID is required") {
          return await fetchShipmentById(shipmentId);
        }
        throw err;
      }
    }
  );

  async function handleDelete(updateId: string | number) {
    await deleteShipmentStatusUpdate(trackingId, updateId);
    await mutate();
  }

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error)
    return (
      <div className="p-6 text-red-500">
        Failed to load shipment: {error.message}
      </div>
    );
  if (!data) return null;

  return (
    <main className="p-6 space-y-8">
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-balance">
              Shipment {data.code || data.trackingId}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tracking ID: {data.trackingId}
            </p>
          </div>
          {data.status ? (
            <span className="inline-flex items-center rounded-full bg-neutral-700 text-white px-3 py-1 text-xs font-medium">
              {statusLabels[data.status]}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium mb-2">Order Information</h2>
            <div className="text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">
                  Estimated Delivery:
                </span>
                <span>
                  {data.estimatedDelivery
                    ? new Date(data.estimatedDelivery).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Customer Information</h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">Name: </span>
                {data.customer?.name || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Address: </span>
                {data.customer?.address || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                {data.customer?.phone || "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Update Status</h2>
        <p className="text-sm text-muted-foreground">
          Add a new status update for this shipment
        </p>
        <TrackingForm
          trackingId={data.trackingId}
          shipmentId={shipmentId ?? data.id}
          onCreated={() => mutate()}
        />
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Tracking History</h2>
        <p className="text-sm text-muted-foreground">
          Complete history of status updates for this shipment
        </p>

        {/* Updated timeline view */}
        <div className="relative mt-6 ml-4">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-300"></div>

          <ul className="space-y-6">
            {(data.history || []).map((update, index) => (
              <li
                key={String(
                  update.id ?? `${update.status}-${update.timestamp}`
                )}
                className="relative"
              >
                {/* Dot indicator */}
                <div
                  className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white ${
                    index === 0 ? "bg-green-500" : "bg-blue-500"
                  }`}
                ></div>

                <div className="ml-10">
                  <div className="font-medium text-lg">
                    {statusLabels[update.status] ?? update.status}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {update.timestamp
                      ? new Date(update.timestamp).toLocaleDateString("en-GB") +
                        ", " +
                        new Date(update.timestamp).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : ""}
                  </div>
                  {update.details ? (
                    <div className="mt-1 text-sm">{update.details}</div>
                  ) : null}
                  {/* Display location if available in the update data */}
                  {update.location ? (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {update.location}
                    </div>
                  ) : null}
                  {update.id != null ? (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(update.id!)}
                        className="text-red-500 hover:text-red-600 p-0 h-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
