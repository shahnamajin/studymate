# StudyMate – Smart Question Finder

A full-stack web application that helps students find similar study questions and automatically tags them by subject. Built as part of an EdTech hiring assignment.

---

## What This Project Does

When a student types a study question like *"Why does photosynthesis need light?"*, the app:
1. Sends the question to a local Python ML service
2. The ML service converts it to a vector embedding using `sentence-transformers`
3. Compares it with a question bank using cosine similarity
4. Returns the top 3 most similar questions with similarity percentages
5. Also auto-detects the topic (Biology, Physics, etc.)
6. Saves everything to MongoDB linked to the logged-in user

---

## Features

- **Email + Password Auth** – Signup, login, JWT-protected routes
- **Similar Question Finder** – Semantic search using sentence embeddings
- **Auto Tagging** – Keyword-based + embedding-based topic classification
- **Question History** – See all past questions, filter by topic, search by text
- **Clean UI** – Simple React + Tailwind CSS interface

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js, Tailwind CSS              |
| Backend    | Node.js, Express                    |
| ML Service | Python, FastAPI, sentence-transformers |
| Database   | MongoDB Atlas                       |
| Auth       | bcryptjs, JWT                       |

---

## Project Structure

```
studymate/
├── frontend/           # React app
│   └── src/
│       ├── pages/      # Login, Signup, Dashboard, History
│       ├── components/ # Navbar, TagBadge
│       └── services/   # API calls (axios)
├── backend/            # Express API
│   ├── routes/         # Auth and question routes
│   ├── controllers/    # Business logic
│   ├── models/         # Mongoose schemas
│   └── middleware/     # JWT verification
└── ml_service/         # Python FastAPI + ML logic
    └── main.py
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB Atlas account (free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/studymate.git
cd studymate
```

---

### 2. Start the ML Service (Python)

```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The first run downloads the `all-MiniLM-L6-v2` model (~80MB). After that it's fast.

---

### 3. Start the Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret in .env
npm run dev
```

---

### 4. Start the Frontend (React)

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## Environment Variables

Create `backend/.env` with:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/studymate
JWT_SECRET=some_random_secret_key
ML_SERVICE_URL=http://localhost:8000
```

---

## How the AI/ML Part Works

I'm not using any paid APIs like OpenAI or Gemini. Everything runs locally.

**Model used:** `all-MiniLM-L6-v2` from the `sentence-transformers` library.  
This model converts any text sentence into a 384-dimensional vector (a list of numbers that captures the meaning of the sentence).

**Similarity calculation:**  
Once we have vectors for the input question and all stored questions, we use **cosine similarity** to find how "close" they are in meaning. A score of 1.0 means identical meaning, 0 means completely unrelated. We return the top 3.

**Auto Tagging:**  
First, we check if the question contains subject-specific keywords (like *photosynthesis → Biology*). If no keyword matches, we compare the question embedding against short topic description texts and pick the closest one. This handles questions that don't use obvious keywords.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/questions | Submit question (auth required) |
| GET | /api/questions/history | Get user's history (auth required) |

---

## Screenshots

*(Add screenshots after running the project locally)*

---

## Notes

- This is a student project built for a hiring assignment
- The question bank in the ML service is hardcoded with ~70 sample questions. In production, you'd fetch these from MongoDB
- ML service runs separately on port 8000; backend calls it internally

---

## Author

**Shahna**  
MCA Student, Big Data Specialization  
NASSCOM Certified – Flutter & React JS
