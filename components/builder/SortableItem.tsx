'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PopupComponent } from '@/types/builder';
import { GripVertical, MoreHorizontal } from 'lucide-react';

// We'll import renderers later or define them inline for now to keep it simple
import ComponentRenderer from './ComponentRenderer';
import { useState, useEffect } from 'react';

interface SortableItemProps {
    component: PopupComponent;
    isSelected: boolean;
    onSelect: () => void;
}

export default function SortableItem({ component, isSelected, onSelect }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        width: component.style?.width || '100%',
        flexGrow: 0,
        flexShrink: 0,
    };

    // Resize Logic removed

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        group relative border rounded p-1 transition-colors box-border
        ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 z-10' : 'border-transparent hover:border-gray-300'}
      `}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <div
                {...attributes}
                {...listeners}
                className={`
          absolute left-[-24px] top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 
          ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}
        `}
            >
                <GripVertical size={16} className="text-gray-400" />
            </div>

            {/* Resize Handle removed */}

            <div className="relative pointer-events-none w-full h-full">
                {/* We disable pointer events on content so clicks go to the wrapper for selection */}
                <ComponentRenderer component={component} />
            </div>
        </div>
    );
}
