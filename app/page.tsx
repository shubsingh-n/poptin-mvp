'use client';

import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/components/PublicHeader';
import {
  Plus,
  Layers,
  Bell,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  MousePointer2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 italic-none">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="absolute top-40 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-8 animate-bounce">
            <Zap size={14} /> NEW: Push Notification Broadcasts are live!
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            Convert Visitors into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Customers, Instantly.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed">
            The all-in-one platform to capture leads, display high-converting popups,
            and send instant push notifications. No coding required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all"
            >
              View Features
            </Link>
          </div>

          {/* Hero Image Mockup */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <img
                src="/landing_page_hero_1767470487551.png"
                alt="Popup-Max Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-12 border-y border-gray-50 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 lg:gap-24">
          <StatItem label="Active Users" value="2,000+" />
          <StatItem label="Popups Created" value="50,000+" />
          <StatItem label="Leads Captured" value="1.2M+" />
          <StatItem label="Push Subscriptions" value="800K+" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Everything you need to grow</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powerful tools designed for marketing teams and developers alike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layers className="text-blue-600" />}
              title="Smart Popups"
              description="Create stunning exit-intent, time-delayed, or scroll-triggered popups in minutes with our visual builder."
            />
            <FeatureCard
              icon={<Bell className="text-purple-600" />}
              title="Push Notifications"
              description="Send instant broadcasts to your subscribers' browsers. Higher open rates than email marketing."
            />
            <FeatureCard
              icon={<BarChart3 className="text-green-600" />}
              title="A/B Testing"
              description="Optimize your conversions by testing different designs, headlines, and triggers automatically."
            />
            <FeatureCard
              icon={<Target className="text-amber-600" />}
              title="Advanced Targeting"
              description="Show the right message to the right person based on their behavior, location, and device."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-cyan-600" />}
              title="Secure & Reliable"
              description="Enterprise-grade security and 99.9% uptime. Your data and your users are always safe."
            />
            <FeatureCard
              icon={<MousePointer2 className="text-rose-600" />}
              title="One-Click Install"
              description="Just paste one line of code on your site and you're ready to go. Works with any platform."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-10 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to maximize your conversions?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of businesses already growing with Popup-Max.</p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full text-xl font-bold hover:bg-blue-50 transition-all shadow-xl"
            >
              Start Your Free Trial
            </Link>
            <p className="mt-6 text-sm text-blue-200">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4 font-bold text-white">Popup-Max</p>
          <p className="text-sm">© 2026 Popup-Max. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

