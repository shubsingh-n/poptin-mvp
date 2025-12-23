'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
    Type,
    Image as ImageIcon,
    Mail,
    Phone,
    Calendar,
    Clock,
    AlignLeft,
    Type as TitleIcon,
    FileText,
    MousePointerClick,
    MoveHorizontal
} from 'lucide-react';
import { ComponentType } from '@/types/builder';

const TOOLS: { type: ComponentType; label: string; icon: React.ReactNode }[] = [
    { type: 'email', label: 'Email Input', icon: <Mail size={16} /> },
    { type: 'phone', label: 'Phone', icon: <Phone size={16} /> },
    { type: 'button', label: 'Button', icon: <MousePointerClick size={16} /> },
    { type: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
    { type: 'marquee', label: 'Marquee', icon: <MoveHorizontal size={16} /> },
    { type: 'longText', label: 'Long Text', icon: <AlignLeft size={16} /> },
    { type: 'shortText', label: 'Short Text', icon: <Type size={16} /> },
    { type: 'timer', label: 'Countdown', icon: <Clock size={16} /> },
    { type: 'date', label: 'Date', icon: <Calendar size={16} /> },
    { type: 'title', label: 'Title', icon: <TitleIcon size={16} /> },
    { type: 'description', label: 'Description', icon: <FileText size={16} /> },
];

function DraggableTool({ type, label, icon }: { type: ComponentType; label: string; icon: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `tool-${type}`,
        data: {
            type,
            isTool: true,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
        >
            <div className="text-gray-400">{icon}</div>
            {label}
        </div>
    );
}

export default function Toolbox() {
    return (
        <div className="w-64 bg-gray-50 border-r h-full p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Components
            </h3>
            <div className="space-y-2">
                {TOOLS.map((tool) => (
                    <DraggableTool key={tool.type} {...tool} />
                ))}
            </div>
        </div>
    );
}
