"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationWithScheme } from "@/types";
import Modal from "@/components/ui/Modal";

export default function UpdateStatusModal({
  application,
  isOpen,
  onClose,
}: {
  application: ApplicationWithScheme;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [externalId, setExternalId] = useState(
    application.externalApplicationId ?? ""
  );
  const [portal, setPortal] = useState(application.externalPortal ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        externalApplicationId: externalId,
        externalPortal: portal,
      }),
    });

    if (res.ok) {
      onClose();
      router.refresh(); // Refresh the page to show the new data
    } else {
      const data = await res.json();
      setError(data.error || "An unexpected error occurred.");
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update: ${application.scheme.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="externalId" className="form-label">
            External Application ID
          </label>
          <input
            id="externalId"
            type="text"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            className="form-input"
            placeholder="e.g., NSP2024123456"
            required
          />
          <p className="form-hint">
            The application ID you received from the official government portal (NSP, PFMS, etc.).
          </p>
        </div>

        <div>
          <label htmlFor="portal" className="form-label">
            Government Portal
          </label>
          <input
            id="portal"
            type="text"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            className="form-input"
            placeholder="e.g., National Scholarship Portal"
            required
          />
           <p className="form-hint">
            The name of the portal where you submitted the application.
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
