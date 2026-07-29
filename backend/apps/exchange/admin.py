from django.contrib import admin
from .models import ExchangeOffer


@admin.register(ExchangeOffer)
class ExchangeOfferAdmin(admin.ModelAdmin):
    list_display = ('offerer', 'book', 'offered_book', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('offerer__email', 'offerer__full_name', 'book__title', 'offered_book__title')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
