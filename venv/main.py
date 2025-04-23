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
import json
import re

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
    allow_origins=["*"],  # Adjust to your frontend URL
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
    
# Create a model for the request payload
class MindMapRequest(BaseModel):
    concept: str
    file: UploadFile = None


async def extract_text_from_file(file: UploadFile):
    """Extract text from uploaded files (PDF, images, text)"""
    content = await file.read()
    file_extension = file.filename.split('.')[-1].lower()
    
    if file_extension == 'pdf':
        # Extract text from PDF
        pdf_reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    elif file_extension in ['png', 'jpg', 'jpeg']:
        # Extract text from image using OCR
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)
        return text
    
    elif file_extension == 'txt':
        # Extract text from text file
        return content.decode('utf-8')
    
    return None

def generate_mind_map(concept):
    """Generate mind map data using Gemini API"""
    prompt = f"""
    Create a detailed mind map for the concept: "{concept}".
    
    Structure the mind map with:
    1. A central node with the main concept
    2. Main branches (key categories/aspects)
    3. Sub-branches (details, examples, subtopics)
    
    Format the output as JSON with this structure:
    {{
      "central": "Main Concept",
      "branches": [
        {{
          "name": "Branch 1",
          "children": [
            {{"name": "Subtopic 1.1", "children": []}}
          ]
        }},
        // More branches
      ]
    }}
    
    Make sure to provide meaningful categorization and hierarchy.
    """
    
    response = model.generate_content(prompt)
    
    # Extract JSON from response text
    # Assuming response contains JSON in markdown code block or directly
    response_text = response.text
    
    # Try to parse the JSON directly
    
    
    # Look for JSON in code blocks or directly in the text
    json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    json_match = re.search(json_pattern, response_text)
    
    if json_match:
        json_text = json_match.group(1)
    else:
        json_text = response_text
    
    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        # If JSON parsing fails, return a structured error response
        return {
            "central": concept,
            "branches": [
                {
                    "name": "Error parsing mind map",
                    "children": [
                        {"name": "The AI generated an invalid response format", "children": []}
                    ]
                }
            ]
        }

# Add the method to the model object
model.generate_mind_map = generate_mind_map

@app.post("/generate-mindmap")
async def generate_mindmap_endpoint(concept: str = Form(...), file: UploadFile = None):
    try:
        if file:
            # If a file is uploaded, process it first
            extracted_text = await extract_text_from_file(file)
            concept = extracted_text or concept  # Use the extracted text if available

        # Call Gemini to generate the mind map data
        mind_map_data = model.generate_mind_map(concept)

        return mind_map_data 
    except Exception as e:
        return {"error": str(e)}
@app.get("/")
async def root():
    return {"message": "Welcome to the Virtual Professor Backend API!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)