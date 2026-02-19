from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_description = models.TextField()
    detailed_description = models.TextField()
    tech_stack = models.TextField()
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
class ProjectExplanation(models.Model):
    EXPLANATION_TYPES = [
        ('simple', 'Simple'),
        ('technical', 'Technical'),
        ('hr', 'HR'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='explanations')
    explanation_type = models.CharField(max_length=50, choices=EXPLANATION_TYPES)
    complexity_level = models.CharField(max_length=50, default='normal')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'explanation_type', 'complexity_level')

    def __str__(self):
        return f"{self.project.title} - {self.explanation_type}"
class ContactMessage(models.Model):
    CATEGORY_CHOICES = [
        ('job', 'Job Opportunity'),
        ('freelance', 'Freelance Work'),
        ('research', 'Research Collaboration'),
        ('spam', 'Spam'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.category}"

class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("ai", "AI / ML"),
        ("backend", "Backend"),
        ("frontend", "Frontend"),
        ("devops", "DevOps"),
        ("tools", "Tools"),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    proficiency = models.IntegerField(default=80)
    icon = models.ImageField(upload_to="skills/", blank=True, null=True)

    def __str__(self):
        return self.name


class Experience(models.Model):
    role = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    currently_working = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.role} - {self.company}"

class About(models.Model):
    headline = models.CharField(max_length=255)
    bio = models.TextField()
    years_experience = models.IntegerField(default=1)

    def __str__(self):
        return "About Section"

class SocialLink(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    icon = models.ImageField(upload_to="socials/", blank=True, null=True)

    def __str__(self):
        return self.name

