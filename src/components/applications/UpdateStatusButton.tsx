"use client";

import { useState } from "react";
import type { ApplicationWithScheme } from "@/types";
import UpdateStatusModal from "./UpdateStatusModal";

export default function UpdateStatusButton({
  application,
}: {
  application: ApplicationWithScheme;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-sm btn-outline"
      >
        {application.externalApplicationId ? "Edit" : "Add"} ID
      </button>

      {isModalOpen && (
        <UpdateStatusModal
          application={application}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
