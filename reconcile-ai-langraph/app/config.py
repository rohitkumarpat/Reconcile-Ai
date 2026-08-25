import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
NODE_BACKEND_SECRET = os.environ["NODE_BACKEND_SECRET"]
PORT = int(os.environ.get("PORT", 8000))