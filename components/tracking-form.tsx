"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createShipmentStatusUpdate, type ShipmentStatusKey } from "@/lib/api";

const statusOptions: { value: ShipmentStatusKey; label: string }[] = [
  { value: "yet_to_be_picked", label: "Yet to be picked" },
  { value: "picked_up", label: "Picked up" },
  { value: "intransit", label: "In Transit" },
  { value: "on_the_way", label: "On the way" },
  { value: "onhold", label: "On Hold" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

export function TrackingForm({
  trackingId,
  shipmentId,
  onCreated,
}: {
  trackingId: string;
  shipmentId?: string | number;
  onCreated?: () => void;
}) {
  const [status, setStatus] = React.useState<ShipmentStatusKey>("intransit");
  const [details, setDetails] = React.useState("");
  const [timestamp, setTimestamp] = React.useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createShipmentStatusUpdate(trackingId, {
      status,
      details: details || undefined,
      timestamp: timestamp ? new Date(timestamp).toISOString() : undefined,
      shipmentId: shipmentId !== undefined ? String(shipmentId) : undefined,
    });
    setDetails("");
    onCreated?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatusKey)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timestamp">Update Date & Time</Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Enter update details"
          rows={4}
        />
      </div>

      <Button type="submit">Update Status</Button>
    </form>
  );
}
