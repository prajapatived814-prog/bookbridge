from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'name', 'full_name', 'enrollment',
            'branch', 'semester', 'whatsapp', 'role', 'rating',
            'avatar', 'created_at',
        )
        read_only_fields = ('id', 'rating', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'full_name', 'enrollment',
            'branch', 'semester', 'whatsapp',
        )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
