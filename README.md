# TdH Italy - PSS Evaluation Platform

A specialized web application for conducting, scoring, and managing psychological evaluations (PSS) for children.

## 🚀 Features
- **9 Psychological Scales**: Automated scoring and risk assessment.
- **Secure Dashboard**: Manage cases and historical evaluations.
- **PDF Export**: Professional multi-page Arabic reports with TdH branding.
- **Arabic/RTL Support**: Full localization for therapists and participants.

## 🛠 Tech Stack
- **React + Vite**
- **Supabase** (Auth & Database)
- **html2canvas & jsPDF** (Report generation)

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- Supabase Project

### 2. Installation
```bash
git clone https://github.com/osamaazizjaber-droid/tdh_pss_platform.git
cd tdh_pss_platform
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the `supabase_schema.sql` script in your Supabase SQL Editor.

### 5. Run Locally
```bash
npm run dev
```

## 📄 License
Internal use for Terre des hommes Italy.
