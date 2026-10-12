import os
from groq import Groq
from django.conf import settings

# Default model on Groq accessible with your key
DEFAULT_MODEL = getattr(settings, "GROQ_MODEL", None) or os.getenv("GROQ_MODEL") or "qwen/qwen3.8-27b"


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
                "content": (
                    "You are an expert AI Systems Engineer explaining software projects clearly. "
                    "Always format your response with rich, structured Markdown: "
                    "use clear bold headings (###), bullet points (- ), bold text (**term**) for key technologies and metrics, "
                    "and clean paragraph breaks for maximum readability. "
                    "If URLs are provided, format them as clean markdown links: [Title](url)."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=1000,
        temperature=0.5,
    )
    return completion.choices[0].message.content


def generate_chat_response(context: str, user_message: str, chat_history: list = None) -> str:
    if chat_history is None:
        chat_history = []

    # 1. Start with System Prompt
    messages = [
        {
            "role": "system",
            "content": f"""You are the personal AI Assistant for Keval Parmar, an AI Systems Engineer.
Your job is to answer questions about his professional background using the context provided below.

FORMATTING REQUIREMENTS:
- Always format your answers using rich, clean Markdown.
- Use **bold text** to highlight important technologies, metrics, skills, and key concepts.
- Use bullet points (- ) with bold leading keywords for lists so information is fast and scannable.
- Use bold subheadings (### Section Name) when providing structured, multi-part answers.
- Format all URLs as clickable markdown links: [Link Title](url).
- Use generous paragraph breaks between thoughts so answers never look like a wall of text.
- Be concise, highly professional, and enthusiastic.
- If asked something outside of this context, politely decline and offer his contact info.

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
        max_tokens=600,
        temperature=0.3,
    )

    return completion.choices[0].message.content
