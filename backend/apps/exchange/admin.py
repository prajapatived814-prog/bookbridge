from django.contrib import admin
from .models import ExchangeOffer


@admin.register(ExchangeOffer)
class ExchangeOfferAdmin(admin.ModelAdmin):
    list_display = ('proposer', 'book_offered', 'book_wanted_title', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('proposer__email', 'book_offered__title', 'book_wanted_title')
    readonly_fields = ('created_at', 'updated_at')
