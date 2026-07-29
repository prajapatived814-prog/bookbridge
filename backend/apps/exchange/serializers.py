from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.books.serializers import BookSerializer
from apps.books.models import Book
from .models import ExchangeOffer


class ExchangeOfferSerializer(serializers.ModelSerializer):
    offerer = UserSerializer(read_only=True)
    book = BookSerializer(read_only=True)
    offered_book = BookSerializer(read_only=True)

    book_id = serializers.PrimaryKeyRelatedField(
        source='book',
        queryset=Book.objects.filter(mode='exchange'),
        write_only=True,
    )
    offered_book_id = serializers.PrimaryKeyRelatedField(
        source='offered_book',
        queryset=Book.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = ExchangeOffer
        fields = (
            'id',
            'offerer',
            'book', 'book_id',
            'offered_book', 'offered_book_id',
            'message',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'offerer', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['offerer'] = self.context['request'].user
        return super().create(validated_data)
