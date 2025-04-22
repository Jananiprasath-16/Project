from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
import pdfplumber
from pathlib import Path
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env.local
load_dotenv(".env.local")

# Initialize FastAPI app
app = FastAPI()

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")  # Use a model that supports text and vision (e.g., gemini-1.5-flash)

# Directory for temporary file uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Request schema for JSON-based prompt (optional, for future use)
class PromptRequest(BaseModel):
    prompt: str

@app.post("/gemini")
async def generate_content(message: str = Form(None), file: UploadFile = File(None)):
    """
    Handle text queries and file uploads (PDF/image) from the frontend.
    Returns a response with 'explanation' and 'solution' fields.
    """
    try:
        if not message and not file:
            raise HTTPException(status_code=400, detail="No message or file provided")

        response_data = {"explanation": "", "solution": ""}

        if file:
            # Validate file type
            if not (file.content_type.startswith("image") or file.content_type == "application/pdf"):
                raise HTTPException(status_code=400, detail="Only PDF or image files are supported")

            # Save file temporarily
            file_path = UPLOAD_DIR / file.filename
            with file_path.open("wb") as f:
                f.write(await file.read())

            logger.info(f"Processing file: {file.filename}")

            if file.content_type.startswith("image"):
                # Process image with Gemini vision capabilities
                with open(file_path, "rb") as img_file:
                    response = model.generate_content(
                        [
                            "You are an AI Virtual Professor. Analyze this educational image and provide a detailed explanation and step-by-step solution.",
                            {"mime_type": file.content_type, "data": img_file.read()}
                        ]
                    )
            elif file.content_type == "application/pdf":
                # Extract text from PDF
                with pdfplumber.open(file_path) as pdf:
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text() or ""
                response = model.generate_content(
                    f"You are an AI Virtual Professor. Analyze the following educational content extracted from a PDF and provide a detailed explanation and step-by-step solution:\n{text}"
                )

            # Clean up uploaded file
            file_path.unlink()

        else:
            # Handle text query
            logger.info(f"Processing text query: {message}")
            response = model.generate_content(
                f"You are an AI Virtual Professor. Provide a clear explanation and step-by-step solution for the following educational query: {message}"
            )

        # Parse Gemini response
        if hasattr(response, "text") and response.text:
            response_text = response.text
            # Split response into explanation and solution (adjust based on Gemini output)
            explanation = response_text[:response_text.find("**Step")].strip() if "**Step" in response_text else response_text
            solution = response_text[response_text.find("**Step"):] if "**Step" in response_text else ""
            response_data = {
                "explanation": explanation or "No explanation provided.",
                "solution": solution or "No solution provided."
            }
        else:
            raise HTTPException(status_code=500, detail="Invalid or empty response from Gemini API")

        return response_data

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Virtual Professor Backend is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)