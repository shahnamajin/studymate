from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="StudyMate ML Service")

# Load the model once when server starts (this takes a few seconds)
print("Loading sentence transformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded!")

# Sample question bank - in a real app you'd fetch this from MongoDB
# These cover multiple subjects for demo purposes
SAMPLE_QUESTIONS = [
    # Biology
    "Why does photosynthesis need sunlight?",
    "Explain the process of photosynthesis in plants.",
    "What is chlorophyll and what does it do?",
    "How do plants make their own food?",
    "What is the role of mitochondria in a cell?",
    "Explain the process of cell division.",
    "What is the difference between DNA and RNA?",
    "How does the human digestive system work?",
    "What is osmosis in biology?",
    "Explain natural selection in evolution.",

    # Computer Science
    "What is normalization in database management?",
    "Explain the difference between SQL and NoSQL databases.",
    "What is an index in a database and why is it useful?",
    "How does a JOIN work in SQL?",
    "What is the difference between primary key and foreign key?",
    "Explain the concept of object-oriented programming.",
    "What is recursion in programming?",
    "How does binary search work?",
    "What is time complexity in algorithms?",
    "Explain the difference between stack and queue.",

    # Physics
    "What is Newton's second law of motion?",
    "Explain the concept of gravitational force.",
    "What is the difference between speed and velocity?",
    "How does energy conservation work?",
    "What is Ohm's law in electricity?",
    "Explain what electromagnetic waves are.",
    "What is kinetic energy and potential energy?",
    "How does a convex lens form an image?",
    "What is the principle of superposition in waves?",
    "Explain the concept of centripetal force.",

    # Mathematics
    "How do you solve a quadratic equation?",
    "What is the derivative of a function?",
    "Explain the concept of integration in calculus.",
    "What is a matrix and how is it used?",
    "How do you find the probability of an event?",
    "What is the Pythagoras theorem?",
    "Explain permutations and combinations.",
    "What is a logarithm and how does it work?",
    "How do you solve simultaneous equations?",
    "What is the difference between mean, median, and mode?",

    # Chemistry
    "What is an exothermic reaction?",
    "Explain ionic and covalent bonds.",
    "What is the pH scale and how is it measured?",
    "How does electrolysis work?",
    "What is the difference between an atom and a molecule?",
    "Explain Le Chatelier's principle in chemistry.",
    "What are functional groups in organic chemistry?",
    "How does a buffer solution work?",
    "What is oxidation and reduction?",
    "Explain the periodic table and its trends.",

    # Social Science / History
    "What were the main causes of World War II?",
    "Explain the French Revolution and its impact.",
    "What is the concept of democracy?",
    "How did the Industrial Revolution change society?",
    "What is GDP and how is it calculated?",
    "Explain the concept of supply and demand.",
    "What are human rights and where do they come from?",
    "How does the stock market work?",
    "What is inflation and what causes it?",
    "Explain the causes and effects of climate change.",
]

# Precompute embeddings for all sample questions at startup
print("Computing embeddings for question bank...")
SAMPLE_EMBEDDINGS = model.encode(SAMPLE_QUESTIONS)
print(f"Ready! {len(SAMPLE_QUESTIONS)} questions indexed.")

# Keyword-based topic tagging
TOPIC_KEYWORDS = {
    "Biology": [
        "photosynthesis", "chlorophyll", "cell", "organism", "dna", "rna",
        "protein", "mitosis", "meiosis", "biology", "plant", "animal",
        "enzyme", "osmosis", "evolution", "genetics", "bacteria", "virus",
        "ecosystem", "respiration", "digestion"
    ],
    "Computer Science": [
        "database", "sql", "normalization", "dbms", "query", "table",
        "index", "join", "algorithm", "programming", "code", "function",
        "array", "recursion", "binary", "stack", "queue", "tree", "graph",
        "object", "class", "loop", "variable", "compiler", "operating system",
        "network", "data structure", "complexity", "sorting", "searching"
    ],
    "Physics": [
        "force", "motion", "gravity", "velocity", "acceleration", "energy",
        "wave", "newton", "electricity", "magnetism", "optics", "light",
        "pressure", "temperature", "thermodynamics", "quantum", "relativity",
        "momentum", "inertia", "friction", "potential", "kinetic", "current"
    ],
    "Mathematics": [
        "integral", "derivative", "equation", "matrix", "probability",
        "calculus", "algebra", "geometry", "theorem", "logarithm",
        "trigonometry", "polynomial", "function", "limit", "vector",
        "statistics", "permutation", "combination", "mean", "median", "mode"
    ],
    "Chemistry": [
        "reaction", "element", "compound", "acid", "base", "molecule",
        "chemistry", "bond", "atom", "electron", "proton", "neutron",
        "periodic", "oxidation", "reduction", "electrolysis", "organic",
        "inorganic", "solution", "buffer", "ph", "catalyst", "polymer"
    ],
    "Social Science": [
        "history", "war", "civilization", "empire", "revolution", "democracy",
        "economy", "gdp", "inflation", "politics", "society", "culture",
        "geography", "population", "government", "rights", "trade", "industry",
        "colonialism", "independence", "climate", "environment"
    ],
}

def get_topic_tag(question_text: str) -> str:
    text = question_text.lower()
    scores = {}

    for topic, keywords in TOPIC_KEYWORDS.items():
        count = sum(1 for word in keywords if word in text)
        scores[topic] = count

    best_topic = max(scores, key=scores.get)

    # If no keyword matched, fall back to embedding similarity with topic descriptions
    if scores[best_topic] == 0:
        topic_descriptions = {
            "Biology": "living organisms cells plants animals genetics evolution",
            "Computer Science": "programming algorithms databases software code systems",
            "Physics": "forces motion energy waves electricity magnetism light",
            "Mathematics": "numbers equations calculus algebra geometry statistics",
            "Chemistry": "atoms molecules reactions elements compounds periodic table",
            "Social Science": "history society economy politics culture geography",
        }
        question_embedding = model.encode([question_text])
        desc_embeddings = model.encode(list(topic_descriptions.values()))
        sims = cosine_similarity(question_embedding, desc_embeddings)[0]
        best_idx = int(np.argmax(sims))
        best_topic = list(topic_descriptions.keys())[best_idx]

    return best_topic


class QuestionInput(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "StudyMate ML Service is running"}


@app.post("/analyze")
def analyze_question(data: QuestionInput):
    question = data.question.strip()

    # Get embedding for the input question
    question_embedding = model.encode([question])

    # Calculate cosine similarity with all sample questions
    similarities = cosine_similarity(question_embedding, SAMPLE_EMBEDDINGS)[0]

    # Get top 3 most similar (excluding near-identical ones)
    top_indices = np.argsort(similarities)[::-1]

    similar_questions = []
    for idx in top_indices:
        sim_score = float(similarities[idx])
        # Skip if it's basically the same question (over 98% similar)
        if sim_score > 0.98:
            continue
        similar_questions.append({
            "text": SAMPLE_QUESTIONS[idx],
            "similarity": round(sim_score * 100, 1),
        })
        if len(similar_questions) == 3:
            break

    # Get topic tag
    tag = get_topic_tag(question)

    return {
        "tag": tag,
        "similar_questions": similar_questions,
    }
