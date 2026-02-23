from huggingface_hub import InferenceClient
from django.conf import settings

MODEL_ID = "Qwen/Qwen2.5-72B-Instruct"

client = InferenceClient(
    model=MODEL_ID,
    token=settings.HUGGINGFACE_API_KEY,
)


def generate_explanation(prompt: str):

    completion = client.chat.completions.create(
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


def generate_chat_response(context: str, user_message: str, chat_history: list = None):
    if chat_history is None:
        chat_history = []

    # 1. Start with your powerful System Prompt
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
        # Translate React's 'ai' role to the API's 'assistant' role
        role = "assistant" if msg.get("role") == "ai" else "user"
        messages.append({
            "role": role,
            "content": msg.get("content", "")
        })

    # 3. Add the brand new user question at the end
    messages.append({
        "role": "user",
        "content": user_message
    })

    # 4. Generate the response with the full context
    completion = client.chat.completions.create(
        messages=messages,
        max_tokens=350,  # Keep it punchy for chat
        temperature=0.3,  # Lower temp for factual portfolio answers
    )

    return completion.choices[0].message.content