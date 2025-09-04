import ShipmentDetailsClient from "./shipment-details-client";

function parseTrackingId(trackingId: string): {
  trackingId: string;
  id?: string;
} {
  console.log("Original trackingId:", trackingId);

  const decodedTrackingId = decodeURIComponent(trackingId).trim();
  console.log("Decoded trackingId:", decodedTrackingId);

  if (!decodedTrackingId) {
    console.log("trackingId is empty");
    return { trackingId: "" };
  }

  // For your URL: "7522752234-240001"
  // This should split into trackingId: "7522752234", id: "240001"
  const parts = decodedTrackingId.split("-");
  console.log("Split parts:", parts);

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      const baseTrackingId = parts.slice(0, -1).join("-");
      console.log("Parsed trackingId:", baseTrackingId, "id:", lastPart);
      return {
        trackingId: baseTrackingId,
        id: lastPart,
      };
    }
  }

  console.log("No ID found, using entire trackingId:", decodedTrackingId);
  return { trackingId: decodedTrackingId };
}

export default function ShipmentDetailsPage({
  params,
}: {
  params: { trackingId: string }; // Changed from 'slug' to 'trackingId'
}) {
  console.log("Params received:", params);
  const { trackingId, id } = parseTrackingId(params.trackingId); // Changed from params.slug
  console.log("Parsed result - trackingId:", trackingId, "id:", id);

  if (!trackingId) {
    return (
      <div className="p-6 text-red-500">
        Error: Tracking ID is missing from the URL
      </div>
    );
  }

  return <ShipmentDetailsClient trackingId={trackingId} shipmentId={id} />;
}
