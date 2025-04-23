# utils.py

import json
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

# Generate mind map data using Gemini API
async def generate_mind_map_with_gemini(content: str, is_concept=True):
    try:
        prompt = ""
        if is_concept:
            prompt = f"""
            Create a detailed mind map for the concept: "{content}".
            
            Focus on breaking down this complex concept into understandable components.
            
            Return your response as a JSON object with the following structure:
            {{
                "name": "Main Concept Name",
                "children": [
                    {{
                        "name": "Sub-Concept 1",
                        "children": [
                            {{"name": "Detail 1"}},
                            {{"name": "Detail 2"}}
                        ]
                    }},
                    {{
                        "name": "Sub-Concept 2",
                        "children": [
                            {{"name": "Detail 3"}}
                        ]
                    }}
                ]
            }}
            
            Make sure to:
            1. Break down the concept into 3-6 major sub-concepts
            2. For each sub-concept, provide 2-5 key details
            3. Keep names concise (under 25 characters if possible)
            4. Focus on clarity and educational value
            """
        else:
            prompt = f"""
            Analyze the following content and create a detailed mind map that visualizes the main concepts:
            
            "{content[:4000]}" 
            
            Return your response as a JSON object with the following structure:
            {{
                "name": "Main Topic",
                "children": [
                    {{
                        "name": "Sub-Topic 1",
                        "children": [
                            {{"name": "Detail 1"}},
                            {{"name": "Detail 2"}}
                        ]
                    }},
                    {{
                        "name": "Sub-Topic 2",
                        "children": [
                            {{"name": "Detail 3"}}
                        ]
                    }}
                ]
            }}
            
            Make sure to:
            1. Extract 3-6 key topics from the content
            2. For each topic, provide 2-5 related details
            3. Keep names concise (under 25 characters if possible)
            4. Focus on clarity and educational value
            """
        
        # Generate response from Gemini
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt)
        
        # Extract and parse JSON from the response
        response_text = response.text
        
        # Sometimes Gemini adds markdown code fences, so we need to clean that up
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        mind_map_data = json.loads(response_text)
        return mind_map_data
    
    except Exception as e:
        logger.error(f"Error generating mind map: {e}")
        raise Exception(f"Failed to generate mind map: {str(e)}")
