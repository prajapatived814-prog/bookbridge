from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver_email = serializers.EmailField(write_only=True)
    book_title = serializers.CharField(write_only=True, required=False, allow_blank=True)
    book_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Message
        fields = (
            'id', 'sender', 'receiver_email', 'book_id', 'book_title',
            'text', 'is_read', 'created_at',
        )
        read_only_fields = ('id', 'sender', 'is_read', 'created_at')

    def create(self, validated_data):
        from apps.users.models import User
        from apps.books.models import Book

        receiver_email = validated_data.pop('receiver_email')
        book_id = validated_data.pop('book_id', None)
        validated_data.pop('book_title', None)

        try:
            receiver = User.objects.get(email=receiver_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'receiver_email': 'No user with this email found.'})

        validated_data['sender'] = self.context['request'].user
        validated_data['receiver'] = receiver

        if book_id:
            try:
                validated_data['book'] = Book.objects.get(pk=book_id)
            except Book.DoesNotExist:
                pass

        return super().create(validated_data)


class MessageReadSerializer(serializers.ModelSerializer):
    """Read serializer - shows full sender/receiver info."""
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'text', 'is_read', 'created_at')
