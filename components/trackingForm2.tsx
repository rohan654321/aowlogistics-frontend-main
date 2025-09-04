"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchShipmentByTrackingId } from "@/lib/api";

export function TrackingBox() {
  const [trackingId, setTrackingId] = React.useState("");
  const [shipment, setShipment] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShipment(null);
    setLoading(true);

    try {
      const result = await fetchShipmentByTrackingId(trackingId);
      setShipment(result); // ✅ save shipment to state
    } catch (err: any) {
      setError(err.message || "Failed to fetch shipment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/shipping-bg.jpg')" }}
    >
      <div className="bg-black/70 p-8 rounded-2xl shadow-xl max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Fast & Reliable{" "}
          <span className="text-orange-500">Global Shipping</span>
        </h1>
        <p className="text-gray-300">
          Track your shipment in real-time and get updates on your delivery
          status.
        </p>

        <form
          onSubmit={handleTrack}
          className="flex flex-col md:flex-row gap-3 mt-4"
        >
          <Input
            type="text"
            placeholder="Enter tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-1 rounded-md bg-white text-black px-4 py-2"
          />
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Tracking..." : "Track"}
          </Button>
        </form>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {/* ✅ Show shipment details */}
        {shipment && (
          <div className="mt-6 bg-white text-black p-4 rounded-lg text-left space-y-2">
            <p><strong>Tracking ID:</strong> {shipment.trackingId}</p>
            <p><strong>Status:</strong> {shipment.status}</p>
            <p><strong>Estimated Delivery:</strong> {shipment.estimatedDelivery}</p>
            {shipment.customer && (
              <>
                <p><strong>Customer:</strong> {shipment.customer.name}</p>
                <p><strong>Address:</strong> {shipment.customer.address}</p>
                <p><strong>Phone:</strong> {shipment.customer.phone}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
