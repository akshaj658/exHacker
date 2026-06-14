import os
from dotenv import find_dotenv, load_dotenv
from langchain_groq import ChatGroq

load_dotenv(find_dotenv(), override=True)

# Centralized Groq client configuration
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY1")
)
