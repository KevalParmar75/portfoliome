from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, action
from rest_framework.views import APIView
from .models import Project, ProjectExplanation, Skill, Experience, About, SocialLink, ChatCache, SectionAnalytics
from .serializers import (
    ProjectSerializer,
    SkillSerializer,
    ExperienceSerializer,
    AboutSerializer,
    SocialLinkSerializer
)
from ai_services.hf_service import generate_explanation, generate_chat_response
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Sum

class ProjectListView(APIView):
    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)

@api_view(["POST"])
def explain_project(request, slug):
    explanation_type = request.data.get("type", "technical")
    complexity = request.data.get("complexity", "normal")

    try:
        project = Project.objects.get(slug=slug)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    # Check cache
    existing = ProjectExplanation.objects.filter(
        project=project,
        explanation_type=explanation_type,
        complexity_level=complexity
    ).first()

    if existing:
        return Response({
            "content": existing.content,
            "cached": True
        })

    # Build prompt
    if explanation_type == "hr":
        audience_instruction = """
    Focus on:
    - Business value
    - User benefits
    - Impact on operations
    - Accessibility
    Avoid deep technical details.
    Use professional executive tone.
    """

    elif explanation_type == "simple":
        audience_instruction = """
    Explain like you're speaking to a non-technical person.
    Use simple language.
    Avoid jargon.
    Use short clear paragraphs.
    """

    else:
        audience_instruction = """
    Provide a technical architecture overview.
    Discuss system design, scalability and data flow.
    """

    prompt = f"""
    You are writing a professional portfolio explanation.

    Rules:
    - No markdown symbols.
    - No reasoning steps.
    - No meta commentary.
    - Clean professional formatting.

    {audience_instruction}

    Complexity: {complexity}

    Project:
    Title: {project.title}
    Description: {project.detailed_description}
    Tech Stack: {project.tech_stack}

    Generate the explanation.
    """

    generated_text = generate_explanation(prompt)

    explanation = ProjectExplanation.objects.create(
        project=project,
        explanation_type=explanation_type,
        complexity_level=complexity,
        content=generated_text
    )

    return Response({
        "content": explanation.content,
        "cached": False
    })

class SkillListView(APIView):
    def get(self, request):
        skills = Skill.objects.all()
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)


class ExperienceListView(APIView):
    def get(self, request):
        experience = Experience.objects.all().order_by("-start_date")
        serializer = ExperienceSerializer(experience, many=True)
        return Response(serializer.data)


class AboutView(APIView):
    def get(self, request):
        about = About.objects.first()
        serializer = AboutSerializer(about)
        return Response(serializer.data)


class SocialLinksView(APIView):
    def get(self, request):
        links = SocialLink.objects.all()
        serializer = SocialLinkSerializer(links, many=True)
        return Response(serializer.data)


@api_view(["POST"])
def portfolio_chat(request, chat_history=None):
    user_message = request.data.get("message", "").strip()
    is_suggested = request.data.get("is_suggested", False)

    if not user_message:
        return Response({"error": "Message is required"}, status=400)

    # 1. Check Cache
    cache_key = user_message.lower()
    existing_cache = ChatCache.objects.filter(user_query=cache_key).first()

    if existing_cache:
        return Response({
            "content": existing_cache.ai_response,
            "cached": True
        })

    # 2. Gather MEGA-CONTEXT from DB
    about = About.objects.first()

    # Format Skills by Category
    skills_qs = Skill.objects.all()
    skills_dict = {}
    for s in skills_qs:
        skills_dict.setdefault(s.category, []).append(s.name)
    skills_formatted = "\n".join([f"- {cat}: {', '.join(items)}" for cat, items in skills_dict.items()])

    # Format Experience
    experience = "\n".join([
        f"- {e.role} at {e.company} ({e.start_date} to {'Present' if e.currently_working else e.end_date}): {e.description}"
        for e in Experience.objects.all()
    ])

    # Format Projects (Now includes Detailed Description, Tech Stack, Links, and Views!)
    projects = "\n".join([
        f"Project: {p.title}\n  Tech: {p.tech_stack}\n  Views: {p.views}\n  Summary: {p.short_description}\n  Details: {p.detailed_description}\n  GitHub: {p.github_url or 'N/A'}\n  Live: {p.live_url or 'N/A'}"
        for p in Project.objects.all()
    ])

    # Format Social Links
    socials = ", ".join([f"{link.name} ({link.url})" for link in SocialLink.objects.all()])

    # 3. The Ultimate System Persona Prompt
    system_prompt = f"""
    You are the personal AI representative for Keval Parmar, a highly skilled AI Systems Engineer.
    You are embedded directly into his portfolio website.
    Your job is to answer questions from recruiters and developers about his work, skills, and experience.

    TONE & STYLE:
    - Professional, highly technical, yet conversational and confident.
    - Keep responses concise and scannable. Use bullet points if listing multiple things.
    - NEVER invent or hallucinate information. ONLY use the database context provided below.
    - If someone asks something unrelated to Keval, politely refuse and guide the conversation back to his engineering skills.

    DATABASE CONTEXT:

    [ABOUT KEVAL]
    {about.headline if about else 'N/A'}
    {about.bio if about else 'N/A'}

    [CORE SKILLS]
    {skills_formatted}

    [PROFESSIONAL EXPERIENCE]
    {experience}

    [PROJECT PORTFOLIO]
    {projects}

    [CONTACT & LINKS]
    {socials}
    """

    # 4. Call your AI Model (Make sure your generate_chat_response is set up to handle system prompts!)
    try:
        # Pass the mega-context as the first argument, and the user's message as the second!
        generated_text = generate_chat_response(system_prompt, user_message, chat_history)  # ✅ FIXED

        # 5. Save to Cache
        if is_suggested:
            ChatCache.objects.create(
                user_query=cache_key,
                ai_response=generated_text
            )

        return Response({
            "content": generated_text,
            "cached": False
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def track_section(request):
    section = request.data.get("section")
    time_spent = float(request.data.get("time_spent", 0))

    today = now().date()

    obj, created = SectionAnalytics.objects.get_or_create(
        section=section,
        date=today
    )

    obj.total_time += time_spent
    obj.total_views += 1
    obj.save()

    return Response({"status": "updated"})

@api_view(['GET'])
def weekly_ranking(request):
    today = now().date()
    week_ago = today - timedelta(days=7)

    weekly_data = (
        SectionAnalytics.objects
        .filter(date__gte=week_ago)
        .values('section')
        .annotate(total_time=Sum('total_time'))
        .order_by('-total_time')
    )

    if weekly_data.exists():
        return Response({
            "type": "weekly",
            "data": weekly_data
        })

    # fallback to all-time totals
    historical = (
        SectionAnalytics.objects
        .values('section')
        .annotate(total_time=Sum('total_time'))
        .order_by('-total_time')
    )

    return Response({
        "type": "historical",
        "data": historical
    })

# 🔥 Replaces the unused ViewSet entirely
@api_view(['POST'])
def increment_project_view(request, slug):
    try:
        project = Project.objects.get(slug=slug)
        project.views += 1
        project.save()
        return Response({'status': 'view counted', 'new_total': project.views})
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)