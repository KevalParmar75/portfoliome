from rest_framework.decorators import api_view
from rest_framework.views import APIView
from .models import Project, ProjectExplanation, Skill, Experience, About, SocialLink
from .serializers import (
    ProjectSerializer,
    SkillSerializer,
    ExperienceSerializer,
    AboutSerializer,
    SocialLinkSerializer
)
from ai_services.hf_service import generate_explanation
from rest_framework.response import Response


class ProjectListView(APIView):
    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
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
