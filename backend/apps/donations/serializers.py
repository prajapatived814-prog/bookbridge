from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.books.serializers import BookSerializer
from .models import DonationClaim


class DonationClaimSerializer(serializers.ModelSerializer):
    claimer = UserSerializer(read_only=True)
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        source='book',
        queryset=__import__('apps.books.models', fromlist=['Book']).Book.objects.filter(mode='donate'),
        write_only=True,
    )

    class Meta:
        model = DonationClaim
        fields = (
            'id', 'claimer', 'book', 'book_id',
            'message', 'status', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'claimer', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['claimer'] = self.context['request'].user
        return super().create(validated_data)
