from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables from .env.local
load_dotenv(".env.local")

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class PromptRequest(BaseModel):
    prompt: str

# Gemini model instance
model = genai.GenerativeModel("gemini-pro")

# POST endpoint
@app.post("/gemini")
async def generate_content(request: PromptRequest):
    response = model.generate_content(request.prompt)
    return {"response": response.text}

# Optional if running via script
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
