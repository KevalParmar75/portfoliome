import os
from groq import Groq
from django.conf import settings

# Default flagship model on Groq: fast, robust reasoning and large context window
DEFAULT_MODEL = getattr(settings, "GROQ_MODEL", None) or os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile"


def get_groq_client() -> Groq:
    api_key = getattr(settings, "GROQ_API_KEY", None) or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in settings or environment variables.")
    return Groq(api_key=api_key)


def generate_explanation(prompt: str) -> str:
    client = get_groq_client()
    completion = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert AI engineer explaining software projects clearly."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=800,
        temperature=0.7,
    )
    return completion.choices[0].message.content


def generate_chat_response(context: str, user_message: str, chat_history: list = None) -> str:
    if chat_history is None:
        chat_history = []

    # 1. Start with System Prompt
    messages = [
        {
            "role": "system",
            "content": f"""You are the AI Assistant for Keval Parmar, an AI Systems Engineer. 
            Your job is to answer questions about his professional background using ONLY the context provided below.
            Be concise, highly professional, and enthusiastic. Use short paragraphs.
            If asked something outside of this context, politely decline and offer his contact info.

            CONTEXT DATA:
            {context}"""
        }
    ]

    # 2. Inject the sliding window history (Memory)
    for msg in chat_history:
        role = "assistant" if msg.get("role") == "ai" else "user"
        messages.append({
            "role": role,
            "content": msg.get("content", "")
        })

    # 3. Add user question at the end
    messages.append({
        "role": "user",
        "content": user_message
    })

    # 4. Generate response with Groq
    client = get_groq_client()
    completion = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=messages,
        max_tokens=350,
        temperature=0.3,
    )

    return completion.choices[0].message.content
