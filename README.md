<div align="center">

# 🌌 AI-Powered Full-Stack Portfolio

**Engineered by Keval Parmar**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)

[**View Live Website**](https://kevalparmar75.vercel.app/)

---

</div>

## 🚀 Overview

Static resumes are a thing of the past. This project is a fully interactive, production-grade platform designed to showcase my journey and capabilities as an **AI Systems Engineer**.

Rather than simply listing credentials, the platform actively demonstrates engineering competence in real-time. It features a custom "Liquid Glass" design system, an asynchronous serverless architecture, high-speed LLM inference via **Groq**, and intelligent portfolio scoping agents.

---

## ✨ Key Features

* ⚡ **Ultra-Fast AI Assistant (Groq LPUs):** Real-time conversational assistant powered by the **Groq API** (`qwen/qwen3.8-27b`). Built with contextual memory sliding windows, token guardrails, and dynamic database injection.
* 🎯 **Dual AI Modes:**
  * **General Mode:** Answers recruiter and engineering questions about skills, career milestones, and projects.
  * **Sales / Technical Scoping Mode:** Embedded on the Collaboration page to help clients define their system architecture requirements and scope projects.
* 🧩 **Dynamic Project Explanations:** Real-time AI explanations with tailored complexity (Technical Architecture, Simple/Non-technical, and HR/Business Impact) with persistent database caching.
* 🎨 **Liquid Glass UI:** Modern, fluid frontend built with Tailwind CSS and Framer Motion, featuring dark glassmorphism, responsive micro-animations, and dynamic visual flair.
* 📊 **Scroll & Engagement Analytics:** Tracking pipeline that dynamically ranks trending projects based on session view duration and user interactions.
* 📬 **Instant Collaboration Inquiries:** Direct inquiry notifications powered by the **Resend API**.

---

## 🛠️ Architecture & Tech Stack

### Frontend (Client)
* **Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS (Glassmorphism & Neon Design System)
* **Animations:** Framer Motion, tsParticles
* **State & Networking:** Axios with custom rate-limiting and error handling
* **Icons:** React Icons

### Backend (API)
* **Framework:** Django 6 + Django REST Framework (DRF)
* **LLM Engine:** Groq Cloud API (`qwen/qwen3.8-27b` via Groq Python SDK)
* **Database:** PostgreSQL (Production) / SQLite (Development)
* **Media Storage:** Cloudinary (Secure HTTPS media hosting)
* **Email Service:** Resend HTTP API
* **Security & Throttling:** Custom DRF Scope Throttling, Security Headers, WhiteNoise static compression

---

## 💻 Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KevalParmar75/portfoliome.git
cd portfoliome
```

### 2. Backend Setup
```bash
cd portfolio_backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `portfolio_backend/`:
```env
SECRET_KEY=your_django_secret_key
DEBUG=True

# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b

# Database (optional for local SQLite, required for production PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Cloudinary (Optional for local development)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Email (For Collaboration Form)
RESEND_API_KEY=re_your_resend_api_key
RECEIVER_EMAIL=your_email@example.com
```

Apply migrations and run the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd portfolio-frontend

# Install dependencies
npm install

# Create .env file
# VITE_API_URL=http://127.0.0.1:8000/api/

# Start Vite dev server
npm run dev
```

---

## 🚢 Deployment

* **Frontend:** Hosted on **Vercel** with continuous deployment from `master`.
* **Backend:** Hosted on **Render** (Python / Gunicorn WSGI).
* **Assets:** Hosted on **Cloudinary CDN**.
