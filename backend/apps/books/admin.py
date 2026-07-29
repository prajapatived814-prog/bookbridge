from django.contrib import admin
from .models import Book, Wishlist


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author', 'branch', 'semester', 'mode',
        'condition', 'price', 'status', 'seller', 'created_at'
    )
    list_filter = ('branch', 'mode', 'condition', 'status', 'resource_type', 'semester')
    search_fields = ('title', 'author', 'isbn', 'gtu_code', 'description')
    readonly_fields = ('created_at', 'updated_at', 'views_count')
    ordering = ('-created_at',)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'created_at')
    search_fields = ('user__email', 'book__title')
