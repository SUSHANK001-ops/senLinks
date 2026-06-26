"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Link } from "@prisma/client";
import LinkCard from "@/components/LinkCard";
import AdminLinkForm from "@/components/AdminLinkForm";
import SocialIconRow from "@/components/SocialIconRow";
import type { SocialIcon } from "@prisma/client";

export default function AdminPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [socialIcons, setSocialIcons] = useState<SocialIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    if (data.links) setLinks(data.links);
  }, []);

  const fetchSocial = useCallback(async () => {
    const res = await fetch("/api/social");
    const data = await res.json();
    if (data.icons) setSocialIcons(data.icons);
  }, []);

  useEffect(() => {
    Promise.all([fetchLinks(), fetchSocial()]).finally(() => setLoading(false));
  }, [fetchLinks, fetchSocial]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order: i,
    }));

    setLinks(reordered);

    await fetch("/api/links/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((l) => ({ id: l.id, order: l.order })),
      }),
    });
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive } : l))
    );
  }

  async function handleDelete(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleAddSocial(platform: string, url: string) {
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setSocialIcons((prev) => [...prev, data.icon]);
  }

  async function handleDeleteSocial(id: string) {
    await fetch(`/api/social/${id}`, { method: "DELETE" });
    setSocialIcons((prev) => prev.filter((i) => i.id !== id));
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingLink(null);
    fetchLinks();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">My Links</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {links.length} link{links.length !== 1 ? "s" : ""} · drag to reorder
          </p>
        </div>
        <button
          type="button"
          id="add-link-btn"
          onClick={() => { setEditingLink(null); setShowForm(true); }}
          className="px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors"
        >
          + Add Link
        </button>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E5E7EB] rounded bg-white">
          <p className="text-2xl mb-3">🔗</p>
          <p className="text-sm font-medium text-[#111827]">No links yet</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">
            Add your first link to get started.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors"
          >
            Add Your First Link
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={(l) => { setEditingLink(l); setShowForm(true); }}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Social Icons section */}
      <div className="bg-white border border-[#E5E7EB] rounded p-5">
        <h2 className="text-sm font-semibold text-[#111827] mb-4">Social Links</h2>
        <SocialIconRow
          icons={socialIcons}
          onDelete={handleDeleteSocial}
          onAdd={handleAddSocial}
          isAdmin
        />
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <AdminLinkForm
          link={editingLink ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingLink(null); }}
        />
      )}
    </div>
  );
}
