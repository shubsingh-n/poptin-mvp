# Popup-Max - Advanced Popup & Lead Capture Platform

A powerful, production-ready platform for creating, managing, and optimizing website popups with advanced drag-and-drop building and deep trigger logic.

## 🚀 Overview

Popup-Max is designed to help businesses capture leads and engage visitors through highly customizable popups. It features a modern drag-and-drop builder, granular targeting rules, and a lightweight embed script for seamless integration.

## ✨ Key Features

- **Drag-and-Drop Builder**: Build complex popups using a visual editor with components like Text, Images, Forms, Timers, and Marquees.
- **Advanced Triggers**: 
  - Time Delay & Exit Intent
  - Page Scroll (%) & Inactivity
  - URL & Page Title Targeting
  - Visitor History (New vs Returning)
  - JavaScript Variable Hooks
- **Over-state (Teaser)**: Customizable minimized buttons to re-open popups after they are closed.
- **Lead Management**: Real-time lead capture, storage, and export functionality.
- **Analytics Dashboard**: Track views, conversions, and conversion rates per popup.
- **Deep Customization**: Granular control over animations, positioning, overlays, and styling.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Builder Core**: @dnd-kit (Sortable & Core)
- **Database**: MongoDB (Mongoose)
- **Analytics**: Recharts
- **Scripts**: Vanilla JavaScript (Core Embed Script)

## 🏗 Development Phases

The project has been developed across several core phases:

### Phase 1: Core Infra & Management
- Site and Popup CRUD operations.
- Basic Lead capture and analytics tracking.
- Initial Embed script implementation.

### Phase 2: Advanced Targeting & Triggers
- Implementation of position and animation controls.
- Granular URL and Title matching rules.
- Visitor-based targeting (Unique sessions, Visit count).

### Phase 3: Drag-and-Drop Editor
- Migrated from basic forms to a robust DnD system using `dnd-kit`.
- Implementation of dynamic components (Images, Timers, Custom Fields).
- Global styling and live canvas preview.

### Phase 4: Form & Logic Enhancements
- Multi-step form support and pagination.
- Auto-close functionality and overlay click behaviors.
- Improved JS-based events and API hooks.

### Phase 5: Over-state (Teaser) Implementation
- Minimized "Teaser" buttons for better user re-engagement.
- Position-specific rules for Mobile vs Desktop.
- Conditional display logic (e.g., "Closed but not filled").

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shubsingh-n/popup-max.git
   cd popup-max
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
├── app/                    # Next.js App Router (Dashboard & API)
├── components/            # React Components (Builder, UI, Layout)
├── lib/                   # Database & Utility functions
├── models/                # Mongoose Database Models
├── public/                # Static assets & popup.js (Embed Script)
├── types/                 # TypeScript interfaces and types
└── README.md
```

## 📄 License
MIT License


