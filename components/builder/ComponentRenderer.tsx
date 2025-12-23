'use client';

import React from 'react';
import { PopupComponent } from '@/types/builder';

export default function ComponentRenderer({ component }: { component: PopupComponent }) {
    const { type, content = {}, style = {} } = component;

    const commonStyle = {
        ...style,
        width: style.width || '100%',
        backgroundColor: style.backgroundColor || 'white', // Ensure inputs have bg
    };

    const inputStyle = {
        ...commonStyle,
        backgroundColor: style.backgroundColor || 'white',
    };

    const transparentStyle = {
        ...commonStyle,
        backgroundColor: style.backgroundColor || 'transparent',
    }

    switch (type) {
        case 'title':
            return (
                <h2 style={transparentStyle} className="text-2xl font-bold">
                    {content.text || 'Add a Title'}
                </h2>
            );
        case 'description':
            return (
                <p style={transparentStyle} className="text-gray-600">
                    {content.text || 'Add a description text here'}
                </p>
            );
        case 'button':
            return (
                <button
                    style={commonStyle}
                    className="bg-blue-600 text-white px-6 py-2 rounded font-medium"
                >
                    {content.text || 'Click Me'}
                </button>
            );
        case 'email':
            return (
                <input
                    type="email"
                    placeholder={content.placeholder || 'Enter your email'}
                    style={inputStyle}
                    className="border p-2 rounded w-full"
                    readOnly // Read only in builder
                />
            );
        case 'phone':
            return (
                <input
                    type="tel"
                    placeholder={content.placeholder || 'Phone number'}
                    style={inputStyle}
                    className="border p-2 rounded w-full"
                    readOnly
                />
            );
        case 'shortText':
            return (
                <input
                    type="text"
                    placeholder={content.placeholder || 'Short text'}
                    style={inputStyle}
                    className="border p-2 rounded w-full"
                    readOnly
                />
            );
        case 'longText':
            return (
                <textarea
                    placeholder={content.placeholder || 'Long text area'}
                    style={inputStyle}
                    className="border p-2 rounded w-full h-24"
                    readOnly
                />
            );
        case 'image':
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={content.src || 'https://via.placeholder.com/300x200?text=Image'}
                    alt="Popup element"
                    style={{ ...commonStyle, backgroundColor: 'transparent' }}
                    className="max-w-full h-auto rounded"
                />
            );
        case 'timer':
            return (
                <div style={commonStyle} className="flex justify-center gap-2 font-mono text-xl font-bold p-4 bg-gray-100 rounded">
                    <span>00</span>:<span>00</span>:<span>00</span>
                </div>
            );
        case 'date':
            return (
                <input
                    type="text"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    placeholder={content.placeholder || 'Select Date'}
                    style={inputStyle}
                    className="border p-2 rounded w-full"
                    readOnly
                />
            );
        case 'marquee':
            return (
                <div
                    style={{ ...commonStyle, overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                    className="relative bg-gray-100"
                >
                    <div className="animate-marquee px-2 w-full">
                        {content.text || 'Marquee Text Scrolling...'}
                    </div>
                </div>
            );

        default:
            return <div className="p-2 border border-red-300 text-red-500">Unknown component: {type}</div>;
    }
}
