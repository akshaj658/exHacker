import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

key_name = "GROQ_API_KEY1"
api_key = os.getenv(key_name)
print(f"Testing {key_name}: {api_key[:12] if api_key else 'None'}...")
try:
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key
    )
    res = llm.invoke("Hello, say 'OK'")
    print(f"  -> {key_name} is VALID: {res.content.strip()}")
except Exception as e:
    print(f"  -> {key_name} failed: {e}")
