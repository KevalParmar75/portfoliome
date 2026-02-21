from django.contrib import admin
from .models import Project, ProjectExplanation, ContactMessage, Skill, Experience, About, SocialLink, ChatCache, SectionAnalytics

admin.site.register(Skill)
admin.site.register(Experience)
admin.site.register(About)
admin.site.register(SocialLink)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    prepopulated_fields = {"slug": ("title",)}


@admin.register(ProjectExplanation)
class ProjectExplanationAdmin(admin.ModelAdmin):
    list_display = ('project', 'explanation_type', 'complexity_level', 'created_at')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'category', 'created_at')

@admin.register(ChatCache)
class ChatCacheAdmin(admin.ModelAdmin):
    list_display = ('user_query', 'created_at')
    search_fields = ('user_query', 'ai_response')
    ordering = ('-created_at',)

@admin.register(SectionAnalytics)
class SectionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("section", "date", "total_views", "total_time")
    list_filter = ("date", "section")
    search_fields = ("section",)
    ordering = ("-date",)
    readonly_fields = ("section", "date", "total_views", "total_time")