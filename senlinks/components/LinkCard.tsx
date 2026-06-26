"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Link } from "@prisma/client";

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function LinkCard({
  link,
  onEdit,
  onDelete,
  onToggleActive,
}: LinkCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggling, setToggling] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleToggle() {
    setToggling(true);
    await onToggleActive(link.id, !link.isActive);
    setToggling(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border rounded ${
        isDragging ? "shadow-lg border-[#1E3A8A]" : "border-[#E5E7EB]"
      } ${!link.isActive ? "opacity-60" : ""}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-[#6B7280] hover:text-[#111827] cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM9 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM9 17a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
        </svg>
      </button>

      {/* Icon */}
      {link.icon && (
        <span className="flex-shrink-0 text-lg w-6 text-center">{link.icon}</span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827] truncate">{link.title}</p>
        <p className="text-xs text-[#6B7280] truncate">{link.url}</p>
      </div>

      {/* Click count */}
      <div className="flex-shrink-0 text-center hidden sm:block">
        <p className="text-sm font-semibold text-[#1E3A8A]">{link.clicks}</p>
        <p className="text-xs text-[#6B7280]">clicks</p>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className={`flex-shrink-0 w-10 h-6 rounded-full border-2 relative transition-colors ${
          link.isActive
            ? "bg-[#1E3A8A] border-[#1E3A8A]"
            : "bg-white border-[#E5E7EB]"
        } disabled:opacity-50`}
        aria-label={link.isActive ? "Deactivate link" : "Activate link"}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            link.isActive ? "translate-x-4" : "translate-x-0.5"
          }`}
          style={link.isActive ? {} : { backgroundColor: "#6B7280" }}
        />
      </button>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => onEdit(link)}
        className="flex-shrink-0 px-2 py-1.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A] rounded hover:bg-[#1E3A8A] hover:text-white transition-colors"
      >
        Edit
      </button>

      {/* Delete button */}
      {confirmDelete ? (
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete(link.id)}
            className="px-2 py-1.5 text-xs font-medium text-white bg-[#B91C1C] rounded hover:bg-[#991B1B] transition-colors"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-1.5 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex-shrink-0 px-2 py-1.5 text-xs font-medium text-[#B91C1C] border border-[#B91C1C] rounded hover:bg-[#B91C1C] hover:text-white transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  );
}
