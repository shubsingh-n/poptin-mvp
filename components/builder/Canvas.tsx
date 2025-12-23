'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { PopupComponent, PopupSettings } from '@/types/builder';
import SortableItem from './SortableItem';

interface CanvasProps {
    components: PopupComponent[];
    settings: PopupSettings;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdateComponent: (id: string, updates: Partial<PopupComponent>) => void;
}

export default function Canvas({ components, settings, selectedId, onSelect, onUpdateComponent }: CanvasProps) {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    return (
        <div className="flex-1 bg-gray-100 h-full overflow-y-auto relative">
            <div className="min-h-full flex flex-col items-center justify-center p-8">
                <div
                    ref={setNodeRef}
                    style={{
                        width: settings.width,
                        minHeight: settings.height === 'auto' ? '200px' : settings.height,
                        backgroundColor: settings.backgroundColor,
                        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: settings.borderRadius,
                        padding: settings.padding,
                    }}
                    className="relative shadow-2xl transition-all duration-300 ring-1 ring-gray-900/5 group"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            onSelect('settings'); // Select global settings if clicking background
                        }
                    }}
                >
                    {/* Close Button */}
                    {(settings.closeButton?.show !== false) && (
                        <button
                            style={{
                                position: 'absolute',
                                top: settings.closeButton?.position?.includes('bottom') ? 'auto' : '10px',
                                bottom: settings.closeButton?.position?.includes('bottom') ? '10px' : 'auto',
                                left: settings.closeButton?.position?.includes('left') ? '10px' : 'auto',
                                right: settings.closeButton?.position?.includes('left') ? 'auto' : '10px',
                                color: settings.closeButton?.color || '#000000',
                                zIndex: 50,
                            }}
                            className="bg-transparent border-none cursor-pointer p-1 leading-none hover:opacity-75 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}

                    <div className="flex flex-wrap items-start content-start min-h-[50px]" style={{ gap: '0px' }}>
                        <SortableContext
                            items={components.map(c => c.id)}
                            strategy={rectSortingStrategy}
                        >
                            {components.length === 0 && (
                                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                    Drag components here
                                </div>
                            )}
                            {components.map((component) => (
                                <SortableItem
                                    key={component.id}
                                    component={component}
                                    isSelected={selectedId === component.id}
                                    onSelect={() => onSelect(component.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>
            </div>
        </div>
    );
}
