# 🍎 NutriTrack — Smart Nutrition Management Platform

A full-stack nutrition management web application that connects **nutritionists** and **patients** for personalized meal planning, progress tracking, and real-time communication.

**Live Preview**: [NutriTrack App](https://id-preview--ba1b9202-7401-4a93-84c9-5e2df5024976.lovable.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [Internationalization](#internationalization)
- [Theming](#theming)

---

## Overview

NutriTrack is a professional nutrition platform designed to streamline the relationship between nutritionists and their patients. Nutritionists can manage patients, create personalized meal plans, track progress, and communicate directly — all from a single dashboard. Patients can follow their meal plans, log daily progress, track water intake, and view weekly summaries.

---

## Features

### 🧑‍⚕️ Nutritionist Dashboard
- **Patient Management** — Add, search, and view detailed patient profiles
- **Meal Plan Creation** — Build custom meal plans with daily items (breakfast, lunch, dinner, snacks)
- **Meal Templates** — Save and reuse meal plan templates across patients
- **Recipe Library** — Maintain a collection of recipes to share with patients
- **Appointment Calendar** — Schedule and manage appointments
- **Dashboard Stats** — Overview of total patients, upcoming appointments, and unread messages

### 🧑 Patient Dashboard
- **Goal Progress** — Visual tracking of weight, BMI, and nutrition goals
- **Daily Meal Checklist** — Mark meals as completed from the active meal plan
- **Water Tracker** — Log daily water intake with a visual glass counter (goal: 8 glasses/day)
- **Weekly Summary** — Overview of meal completions and water intake for the week with daily breakdown
- **Progress Logging** — Record weight, energy levels, mood, and notes
- **Streak Tracking** — Track consecutive days of logging activity
- **Appointment View** — View upcoming appointments with nutritionist

### 💬 Messaging
- **Real-time Messaging** — Direct communication between nutritionists and patients
- **Conversation List** — View all conversations with unread indicators
- **Message Thread** — Full chat history with each contact

### 🔐 Authentication
- **Email/Password Sign Up & Sign In** — With role selection (nutritionist or patient)
- **Password Recovery** — Forgot password flow with email reset link
- **Password Validation** — Minimum 8 characters, uppercase, lowercase, and number required
- **Email Verification** — Users must verify email before signing in

### 🌐 Internationalization (i18n)
- **English & Spanish** — Full translation support across the entire app
- **Language Toggle** — Switch languages from any screen

### 🎨 Theming
- **Light & Dark Mode** — System-aware theme with manual toggle
- **Design System** — Consistent semantic color tokens via Tailwind CSS and CSS variables

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui components |
| **State Management** | React Query (TanStack Query) |
| **Routing** | React Router v6 |
| **Backend** | Lovable Cloud (Supabase) |
| **Database** | PostgreSQL (via Lovable Cloud) |
| **Auth** | Lovable Cloud Authentication |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Theming** | next-themes |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner + shadcn Toast |

---

## Project Structure

```
src/
├── assets/                  # Static assets (images)
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── AddPatientDialog.tsx
│   │   ├── AddProgressLogDialog.tsx
│   │   ├── ApplyTemplateDialog.tsx
│   │   ├── AppointmentCalendar.tsx
│   │   ├── CreateMealPlanDialog.tsx
│   │   ├── DailyMealChecklist.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardNav.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── GoalProgress.tsx
│   │   ├── MealPlanDetail.tsx
│   │   ├── MealPlans.tsx
│   │   ├── MealTemplates.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── NutritionistDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── PatientOverview.tsx
│   │   ├── ProgressCharts.tsx
│   │   ├── ProgressTracking.tsx
│   │   ├── RecipeLibrary.tsx
│   │   ├── SaveAsTemplateDialog.tsx
│   │   ├── TemplateEditor.tsx
│   │   ├── WaterTracker.tsx
│   │   └── WeeklySummary.tsx
│   ├── messaging/           # Messaging components
│   │   ├── ConversationList.tsx
│   │   └── MessageThread.tsx
│   ├── ui/                  # shadcn/ui component library
│   ├── Features.tsx         # Landing page features section
│   ├── Footer.tsx           # Landing page footer
│   ├── Hero.tsx             # Landing page hero section
│   ├── HowItWorks.tsx       # Landing page how-it-works section
│   ├── LanguageToggle.tsx   # EN/ES language switcher
│   ├── Navbar.tsx           # Landing page navigation
│   └── ThemeToggle.tsx      # Light/dark mode toggle
├── contexts/
│   └── LanguageContext.tsx   # i18n translations (EN/ES)
├── hooks/
│   ├── use-mobile.tsx       # Mobile breakpoint detection
│   └── use-toast.ts        # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts        # Supabase client (auto-generated)
│       └── types.ts         # Database types (auto-generated)
├── pages/
│   ├── Auth.tsx             # Login / Sign up / Password reset
│   ├── Dashboard.tsx        # Role-based dashboard router
│   ├── Index.tsx            # Entry redirect (auth check)
│   ├── Messages.tsx         # Messaging page
│   ├── NotFound.tsx         # 404 page
│   ├── PatientDetail.tsx    # Nutritionist's patient detail view
│   └── PatientProfile.tsx   # Patient's own profile page
├── App.tsx                  # App root with providers and routes
├── main.tsx                 # Entry point
└── index.css                # Global styles and design tokens
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (id, full_name, email, role) |
| `patients` | Patient-nutritionist relationships (patient_id, nutritionist_id, status, age, height, weight, etc.) |
| `meal_plans` | Nutrition plans assigned to patients (title, dates, active status) |
| `meal_plan_items` | Individual meals within a plan (meal_name, type, day_of_week, calories, macros) |
| `meal_templates` | Reusable meal plan templates created by nutritionists |
| `meal_template_items` | Items within meal templates |
| `meal_completions` | Patient's daily meal completion tracking |
| `water_logs` | Patient's daily water intake tracking (glasses consumed, goal) |
| `progress_logs` | Patient progress entries (weight, energy, mood, notes) |
| `appointments` | Scheduled appointments between nutritionist and patient |
| `messages` | Direct messages between users |
| `notifications` | In-app notifications |
| `recipes` | Recipe library entries |

All tables are protected with **Row Level Security (RLS)** policies ensuring users can only access their own data.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Authentication

The app uses email/password authentication with two roles:

1. **Sign Up** — Choose role (Nutritionist or Patient), provide name, email, and password
2. **Email Verification** — Check inbox to confirm account
3. **Sign In** — Use email and password
4. **Password Reset** — Request reset link via email

---

## User Roles

### Nutritionist
- Full patient management capabilities
- Create and assign meal plans
- View patient progress and charts
- Schedule appointments
- Send messages to patients
- Manage recipe library and meal templates

### Patient
- View assigned meal plans and mark meals as completed
- Track daily water intake
- Log progress (weight, energy, mood)
- View goal progress and weekly summaries
- View appointments
- Message nutritionist

---

## Internationalization

The app supports **English** and **Spanish** via the `LanguageContext`. All UI strings are translated and accessible through the `t()` function. Toggle language using the globe icon in the navigation.

---

## Theming

The app supports **light** and **dark** modes using `next-themes`. The theme toggle is available in the navigation bar. All colors use semantic CSS variables defined in `index.css` for consistent theming across components.

---

## License

This project is proprietary. All rights reserved.
