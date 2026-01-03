'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function PublicHeader() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                            P
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Popup-Max
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How it Works</Link>
                        <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
                            >
                                Dashboard <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 px-4">
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-7 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4 shadow-xl">
                    <Link href="#features" className="block px-4 py-2 text-gray-600 font-medium">Features</Link>
                    <Link href="#how-it-works" className="block px-4 py-2 text-gray-600 font-medium">How it Works</Link>
                    <Link href="#pricing" className="block px-4 py-2 text-gray-600 font-medium">Pricing</Link>
                    <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                        {session ? (
                            <Link href="/dashboard" className="w-full bg-gray-900 text-white text-center py-3 rounded-xl font-bold">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className="w-full text-center py-3 font-bold text-gray-700">Login</Link>
                                <Link href="/register" className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold">Sign Up Free</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
