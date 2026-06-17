# 🤖 AI Learning Assistant — RAG-Powered Chatbot

> A full-stack AI-powered learning tool that lets users upload documents and ask questions using **Retrieval-Augmented Generation (RAG)**. Built with a Node.js backend, Qdrant vector database, Google Gemini API, and deployed on AWS with a fully automated CI/CD pipeline.

---

## 📸 Preview

<p align="center">
  <img src="/AI_Dashboard.png" alt="AI Dashboard" width="800" />
  <img src="/Sign_up.png" alt="Sign Up Page" width="800" />
  <img src="/Login.png" alt="Login Page" width="800" />
</p>

---

## ✨ Features

- 📄 **Document Upload** — Upload PDFs/text files as a knowledge base
- 🧠 **RAG Q&A** — Ask natural language questions; answers grounded in your documents
- 🔍 **Semantic Search** — Qdrant vector DB for similarity search over embeddings
- 🔐 **Authentication** — Supabase-based auth (migrated from Firebase)
- 🚀 **Automated CI/CD** — GitHub Actions → Docker → AWS ECR → EC2 (zero manual deployment)

---
## 📹 CI/CD Pipeline Demo

[![CI/CD Pipeline Live Demo](https://img.youtube.com/vi/IGNUVVjhbQ8/maxresdefault.jpg)](https://youtu.be/IGNUVVjhbQ8)

▶️ Watch: [GitHub Actions → Docker → ECR → EC2 Live Deployment](https://youtu.be/IGNUVVjhbQ8)
## 🏗️ Architecture

```
User
 │
 ▼
React Frontend (Vercel)
 │
 ▼  REST API
Node.js + Express Backend (AWS EC2)
 │               │                  │
 ▼               ▼                  ▼
Supabase      Qdrant            Gemini API
(PostgreSQL)  (Vector DB)       (Embeddings +
 Auth, Users   Semantic Search   LLM Response)
 Chat History
```

### RAG Pipeline Flow

```
User Query
    │
    ▼
Gemini Embedding (gemini-embedding-001, 3072 dims)
    │
    ▼
Qdrant Similarity Search (top-k chunks)
    │
    ▼
Context Injection into Prompt
    │
    ▼
Gemini LLM → Final Answer
```

---

## ⚙️ CI/CD Pipeline

**Every push to `main` triggers a fully automated deployment:**

```
GitHub Push to main
    │
    ▼
GitHub Actions Workflow
    ├── Checkout code
    ├── Build Docker image
    ├── Push image → AWS ECR
    └── SSH into EC2
            ├── Pull latest image from ECR
            └── Restart container (zero-downtime rolling update)
```

- IAM least-privilege roles configured for ECR push access
- AWS credentials and EC2 SSH keys stored as GitHub Actions secrets
- Deployment time: **under 3 minutes** from commit to live

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vercel |
| Backend | Node.js, Express |
| Authentication | Supabase (PostgreSQL) |
| Vector Database | Qdrant |
| AI / Embeddings | Google Gemini API (`gemini-embedding-001`) |
| Containerisation | Docker |
| Container Registry | AWS ECR |
| Hosting | AWS EC2 (ap-south-1) |
| CI/CD | GitHub Actions |

---

## 🚀 Local Setup

### Prerequisites

- Node.js v18+
- Docker
- Supabase account
- Qdrant running locally or cloud instance
- Google Gemini API key

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Charmi067/AI-Learning-Assistant.git
cd AI-Learning-Assistant

# 2. Set up environment variables
cp .env.example .env
# Fill in your keys (see Environment Variables section below)

# 3. Install dependencies
npm install

# 4. Start with Docker Compose (recommended)
docker-compose up --build

# OR run manually
npm run dev
```

### Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=your_collection_name

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3000
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📁 Project Structure

```
AI-Learning-Assistant/
├── backend/
│   ├── routes/          # Express API routes
│   ├── services/        # RAG logic, embedding, Qdrant search
│   ├── middleware/      # Auth middleware (Supabase)
│   └── index.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── public/
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions CI/CD pipeline
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## 🔧 Key Technical Challenges Solved

| Challenge | Solution |
|---|---|
| Gemini embedding model naming conflict | Switched to direct REST API calls using `gemini-embedding-001` |
| Qdrant vector dimension mismatch | Matched collection config to Gemini's 3072-dim output |
| CORS errors in production | Configured Express CORS middleware with explicit origin whitelist |
| Firebase → Supabase migration | Redesigned schema, migrated all auth and data routes |

---

## 📌 Roadmap

- [ ] Add support for multiple document collections per user
- [ ] Streaming responses (Server-Sent Events)
- [ ] Terraform-based infrastructure provisioning
- [ ] Kubernetes deployment on EKS

---

## 👩‍💻 Author

**Charmi [Last Name]**
B.Sc. (CA&IT) Honours — Ganpat University, Gujarat

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/Charmi067)
