from django.contrib import admin
from .models import Intern


@admin.register(Intern)
class InternAdmin(admin.ModelAdmin):
    """Admin configuration for the Intern model."""
    list_display = ('name', 'email', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('name', 'email')
