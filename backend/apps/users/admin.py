from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'branch', 'semester', 'role', 'rating', 'created_at')
    search_fields = ('email', 'full_name', 'enrollment')
    list_filter = ('branch', 'role', 'semester')
