from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.books.serializers import BookSerializer
from .models import ExchangeOffer


class ExchangeOfferSerializer(serializers.ModelSerializer):
    proposer = UserSerializer(read_only=True)
    book_offered = BookSerializer(read_only=True)
    book_offered_id = serializers.PrimaryKeyRelatedField(
        source='book_offered',
        queryset=__import__('apps.books.models', fromlist=['Book']).Book.objects.all(),
        write_only=True,
    )

    class Meta:
        model = ExchangeOffer
        fields = (
            'id', 'proposer', 'book_offered', 'book_offered_id',
            'book_wanted_title', 'message', 'status',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'proposer', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['proposer'] = self.context['request'].user
        return super().create(validated_data)
