'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { GripVertical, Inbox } from 'lucide-react';
import { useState } from 'react';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';
import ApplicationCard from './ApplicationCard';

type Props = {
  applications: Application[];
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
};

const dotColor: Record<ApplicationStatus, string> = {
  WISHLIST: 'bg-slate-400',
  APPLIED: 'bg-sky-500',
  INTERVIEW: 'bg-amber-500',
  OFFER: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
};

function DraggableCard({
  application,
  onStatusChange,
  onDelete,
}: {
  application: Application;
  onStatusChange: Props['onStatusChange'];
  onDelete: Props['onDelete'];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
  });

  return (
    <div ref={setNodeRef} className={isDragging ? 'opacity-40' : ''}>
      <ApplicationCard
        application={application}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        handle={
          <button
            type="button"
            aria-label="Drag to move"
            className="mt-0.5 cursor-grab touch-none text-muted hover:text-fg active:cursor-grabbing"
            {...listeners}
            {...attributes}
          >
            <GripVertical size={16} />
          </button>
        }
      />
    </div>
  );
}

function Column({
  column,
  items,
  onStatusChange,
  onDelete,
}: {
  column: { value: ApplicationStatus; label: string };
  items: Application[];
  onStatusChange: Props['onStatusChange'];
  onDelete: Props['onDelete'];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.value });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl p-3 transition ${
        isOver ? 'bg-brand/10 ring-2 ring-brand/40' : 'bg-line/30'
      }`}
    >
      <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-fg">
        <span className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${dotColor[column.value]}`}
          />
          {column.label}
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
          {items.length}
        </span>
      </h3>

      <div className="min-h-16 space-y-3">
        {items.map((application) => (
          <DraggableCard
            key={application.id}
            application={application}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-1 py-6 text-muted">
            <Inbox size={22} />
            <p className="text-xs">Drop a card here</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function KanbanBoard({
  applications,
  onStatusChange,
  onDelete,
}: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const activeApplication =
    applications.find((a) => a.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const status = String(over.id) as ApplicationStatus;
    if (!STATUSES.some((s) => s.value === status)) return;

    const id = Number(active.id);
    const current = applications.find((a) => a.id === id);
    if (current && current.status !== status) {
      onStatusChange(id, status);
    }
  }

  return (
    <DndContext
      id="kanban"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STATUSES.map((column) => (
          <Column
            key={column.value}
            column={column}
            items={applications.filter((a) => a.status === column.value)}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <ApplicationCard
            application={activeApplication}
            onStatusChange={() => undefined}
            onDelete={() => undefined}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}