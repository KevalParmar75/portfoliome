from django.urls import path
from .views import explain_project, ProjectListView, SkillListView, ExperienceListView, AboutView, SocialLinksView

urlpatterns = [
    path("projects/<slug:slug>/explain/", explain_project),
    path("projects/", ProjectListView.as_view()),
    path("skills/", SkillListView.as_view()),
    path("experience/", ExperienceListView.as_view()),
    path("about/", AboutView.as_view()),
    path("socials/", SocialLinksView.as_view()),
]
