"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";

type ListingRequestDetail = {
  id: string;
  mode: string;
  propertyType: string;
  title: string | null;
  locationText: string;
  city: string;
  price: number | string;
  bhk: number | null;
  areaSqFt: number | null;
  description: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  user: { name: string | null; phone: string; email: string | null };
  images: { id: string; url: string; sortOrder: number }[];
};

export default function AdminListingRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [r, setR] = useState<ListingRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/listing-requests/${id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setR)
      .catch(() => setR(null))
      .finally(() => setLoading(false));
  }, [id]);

  function handleApprove() {
    setApproving(true);
    fetch(`/api/admin/listing-requests/${id}/approve`, { method: "POST" })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: { propertyId?: string }) => {
        if (data.propertyId) router.push(`/admin/properties/${data.propertyId}/edit`);
        else router.push("/admin/listing-requests");
      })
      .catch(() => setApproving(false))
      .finally(() => setApproving(false));
  }

  function handleReject() {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    fetch(`/api/admin/listing-requests/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason.trim() }),
    })
      .then((res) => { if (!res.ok) throw new Error(); router.push("/admin/listing-requests"); })
      .catch(() => setRejecting(false))
      .finally(() => setRejecting(false));
  }

  if (loading || !r) {
    return <div className="p-8">Loading...</div>;
  }

  const canApprove = r.status !== "REJECTED" && r.status !== "PUBLISHED";

  return (
    <div>
      <Link href="/admin/listing-requests" className="text-primary hover:underline mb-4 inline-block">← Listing Requests</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Request: {r.title ?? `${r.propertyType} in ${r.city}`}</h1>

      <div className="grid gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Details</h2>
          <p><span className="text-gray-500">User:</span> {r.user.name ?? "—"} / {r.user.phone}</p>
          <p><span className="text-gray-500">Mode / Type:</span> {r.mode} / {r.propertyType}</p>
          <p><span className="text-gray-500">Location:</span> {r.locationText}, {r.city}</p>
          <p><span className="text-gray-500">Price:</span> {typeof r.price === "string" ? r.price : String(r.price)}</p>
          <p><span className="text-gray-500">BHK / Area:</span> {r.bhk ?? "—"} / {r.areaSqFt ?? "—"}</p>
          <p><span className="text-gray-500">Description:</span> {r.description}</p>
          <p><span className="text-gray-500">Status:</span> {r.status}</p>
          {r.rejectionReason && <p className="text-red-600"><span className="text-gray-500">Rejection reason:</span> {r.rejectionReason}</p>}
        </div>

        {r.images.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Images</h2>
            <div className="flex flex-wrap gap-4">
              {r.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.url} alt="" className="w-40 h-40 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {canApprove && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-wrap gap-4 items-end">
            <Button onClick={handleApprove} disabled={approving}>{approving ? "Creating property..." : "Approve → Create property"}</Button>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Rejection reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-64"
              />
              <Button onClick={handleReject} disabled={!rejectReason.trim() || rejecting} className="bg-red-600 hover:bg-red-700">Reject</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
