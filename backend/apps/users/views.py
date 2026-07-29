from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/users/register/
    Registers a new user and returns the user object + JWT tokens.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Registration successful',
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/users/profile/   — get current user profile
    PUT  /api/v1/users/profile/   — update current user profile
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """
    GET /api/v1/users/admin/users/   — list all users (admin only)
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class AdminStatsView(APIView):
    """
    GET /api/v1/users/admin/stats/   — platform statistics for admin page
    """
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        from apps.books.models import Book
        from apps.exchange.models import ExchangeOffer
        from apps.donations.models import DonationClaim

        return Response({
            'totalUsers': User.objects.count(),
            'totalListings': Book.objects.count(),
            'activeSwaps': Book.objects.filter(mode='exchange').count(),
            'freeDonations': Book.objects.filter(mode='donate').count(),
            'totalOffers': ExchangeOffer.objects.count(),
            'totalClaims': DonationClaim.objects.count(),
        })
