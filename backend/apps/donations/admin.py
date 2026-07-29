from django.contrib import admin
from .models import DonationClaim


@admin.register(DonationClaim)
class DonationClaimAdmin(admin.ModelAdmin):
    list_display = ('claimer', 'book', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('claimer__email', 'book__title')
    readonly_fields = ('created_at', 'updated_at')
