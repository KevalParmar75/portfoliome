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
