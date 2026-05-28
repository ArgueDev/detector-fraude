import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# The Gemini endpoint will be constructed in code to use the desired model (gemini-2.5-flash).

if not DATABASE_URL:
    raise ValueError('DATABASE_URL no está configurado en el archivo .env')
if not GEMINI_API_KEY:
    raise ValueError('GEMINI_API_KEY no está configurado en el archivo .env')