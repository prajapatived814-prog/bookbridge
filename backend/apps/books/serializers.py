from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Book, Wishlist


class BookSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    cover = serializers.SerializerMethodField()
    original = serializers.DecimalField(
        source='original_price', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Book
        fields = (
            'id', 'title', 'author', 'isbn', 'gtu_code',
            'resource_type', 'genre', 'subject', 'edition',
            'branch', 'semester', 'condition', 'language',
            'mode', 'price', 'original', 'rating',
            'exchange_for', 'description', 'location',
            'cover_url', 'cover', 'pdf_url',
            'status', 'views_count', 'seller',
            'created_at', 'updated_at',
        )

    def get_cover(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_url or None


class BookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = (
            'id', 'title', 'author', 'isbn', 'gtu_code',
            'resource_type', 'genre', 'subject', 'edition',
            'branch', 'semester', 'condition', 'language',
            'mode', 'price', 'original_price', 'rating',
            'exchange_for', 'description', 'location',
            'cover_url', 'cover_image', 'pdf_file', 'pdf_url',
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class WishlistSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'book', 'created_at')
