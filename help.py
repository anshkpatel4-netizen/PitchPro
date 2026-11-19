import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=api_key)

response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "Reply with only the word: working"
        }
    ],
    max_completion_tokens=200
)

print(response.choices[0].message.content)