<div align="center">

# 🌌 AI-Powered Full-Stack Portfolio

**Engineered by Keval Parmar**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97_Hugging_Face-FFD21E?style=for-the-badge&logoColor=black)](https://huggingface.co/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[**View Live Website**](https://kevalparmar75.vercel.app/) • [**Report Bug**](#) • [**Request Feature**](#)

---

</div>

## 🚀 Overview

Static resumes are a thing of the past. This project is a fully interactive, production-ready web platform designed to showcase my journey as an AI Systems Engineer. 

Instead of just listing my skills, I built an environment that *demonstrates* them. It features a custom "Liquid Glass" UI, a robust serverless backend, and an embedded LLM agent that allows visitors to directly chat with my portfolio.

### ✨ Key Features

* 🧠 **Interactive AI Assistant:** An embedded chat interface powered by the open-source **Qwen 2.5 (72B)** model via the Hugging Face API. It contextually answers questions about my experience, tech stack, and GitHub repositories.
* 🎨 **Liquid Glass UI:** A fluid, high-fidelity frontend built with Tailwind CSS and Framer Motion, featuring dark themes, deep blur effects, and tangy neon accents.
* ⚡ **Full-Stack Architecture:** A decoupled system utilizing a React (Vite) Single Page Application communicating with a Django REST Framework API.
* 📊 **Real-Time Analytics:** A custom tracking engine that dynamically recommends "Trending Projects" to users based on live scroll depth and session engagement.
* ☁️ **Cloud Native Deployment:** Hosted on Vercel (Frontend) and Render (Backend) with a serverless PostgreSQL database and Cloudinary image management.

---

## 🛠️ Architecture & Tech Stack

### Frontend (Client)
* **Framework:** React 18 + Vite + TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion, tsParticles
* **Routing:** React Router DOM

### Backend (API)
* **Framework:** Django + Django REST Framework (DRF)
* **Database:** PostgreSQL
* **Storage:** Cloudinary (for media and project assets)
* **AI Integration:** Hugging Face Inference API (`Qwen/Qwen2.5-72B-Instruct`)
---

## 💻 Local Installation & Setup

Want to run this system locally? Follow these steps to spin up both the backend and frontend environments.

### 1. Clone the Repository
```bash
git clone [https://github.com/KevalParmar75/portfoliome.git](https://github.com/KevalParmar75/portfoliome.git)
cd portfoliome

cd portfolio_backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Set up your .env file
# Create a .env file and add: 
# DATABASE_URL=your_postgres_url
# CLOUDINARY_URL=your_cloudinary_url
# HUGGINGFACE_API_KEY=your_hf_key

# Run migrations and start the server
python manage.py migrate
python manage.py runserver

cd portfolio-frontend

# Install dependencies
npm install

# Set up your .env file
# Create a .env file and add:
# VITE_API_URL=[http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

# Start the Vite development server
npm run dev
