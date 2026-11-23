const freelanceChatContext = `Freelance services:
- RAG & document Q&A: grounded chatbots for internal documents, with source citations, hybrid vector search, evaluation, and prompt-injection guards. Stack includes Python, LangChain, pgvector, FAISS, Qwen, and OpenAI.
- Multi-agent and tool-calling workflows: LangGraph assistants connected to databases and APIs for bookings, lookups, and business workflows, with structured output validation, multilingual/voice interfaces, caching, and provider failover.
- Cost-optimized LLM hosting: migrate to open-weight or self-hosted models, deploy with Ollama/Docker, configure provider fallback, and benchmark latency and cost.
- Full-stack AI apps and MVPs: backend, database, React/Next.js frontend, authentication, dashboards, pipelines, and containerized deployment.
- Business automation: data extraction, enrichment, outreach, multilingual websites, FAQ/booking assistants, and messaging automation.

Project workflow:
- Scoping call: align on goals, data, and success criteria; provide written scope, milestones, and deliverables.
- Working prototype: connect an early build to real documents or APIs and test edge cases.
- Production hardening: validate outputs, add fallbacks and caching, and optimize latency and cost.
- Clean handoff: deliver source ownership, Docker deployment, environment docs, and a maintenance walkthrough.

FAQs:
- Pricing: projects are usually priced per milestone with a defined scope; ongoing support is available through weekly or monthly retainers.
- Cost and model choice: open-weight models can be hosted through inference providers or on a VPS, with cloud fallback if needed.
- Timeline: focused prototypes typically take 5–10 days; full-stack apps and MVPs generally take 2–4 weeks, depending on integrations and UI complexity.
- Ownership: clients own the code, prompts, schemas, and deployment configuration after completion.
- Existing systems: AI services can be built as isolated FastAPI or Django services that integrate with an existing product.`;

export default freelanceChatContext;
