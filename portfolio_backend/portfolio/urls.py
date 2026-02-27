from django.urls import path
from .views import (
    explain_project,
    ProjectListView,
    SkillListView,
    ExperienceListView,
    AboutView,
    SocialLinksView,
    portfolio_chat, track_section, weekly_ranking, increment_project_view, submit_inquiry  # <-- Import the new chat view
)

urlpatterns = [
    path("projects/<slug:slug>/explain/", explain_project),
    path("projects/", ProjectListView.as_view()),
    path("skills/", SkillListView.as_view()),
    path("experience/", ExperienceListView.as_view()),
    path("about/", AboutView.as_view()),
    path("socials/", SocialLinksView.as_view()),
    path("chat/", portfolio_chat),  # <-- Add the chat endpoint
    path("track/", track_section),
    path("ranking/", weekly_ranking),
    path("projects/<slug:slug>/increment-view/", increment_project_view),
    path("inquire/", submit_inquiry),
]