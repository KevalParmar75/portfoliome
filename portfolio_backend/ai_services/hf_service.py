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


def generate_chat_response(context: str, user_message: str):
    completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"""You are the AI Assistant for Keval Parmar, an AI Systems Engineer. 
                Your job is to answer questions about his professional background using ONLY the context provided below.
                Be concise, highly professional, and enthusiastic. Use short paragraphs.
                If asked something outside of this context, politely decline and offer his contact info.

                CONTEXT DATA:
                {context}"""
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        max_tokens=300,  # Keep it punchy for chat
        temperature=0.3,  # Lower temp for factual portfolio answers
    )

    return completion.choices[0].message.content