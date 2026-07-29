from rest_framework import generics, permissions
from .models import DonationClaim
from .serializers import DonationClaimSerializer


class DonationClaimListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/donations/claims/   — list all pending donation claims (admin)
    POST /api/v1/donations/claims/   — claim a free book (auth)
    """
    serializer_class = DonationClaimSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return DonationClaim.objects.select_related(
            'claimer', 'book', 'book__seller'
        ).all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MyDonationClaimsView(generics.ListAPIView):
    """
    GET /api/v1/donations/my-claims/   — current user's donation claims
    """
    serializer_class = DonationClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DonationClaim.objects.filter(
            claimer=self.request.user
        ).select_related('book', 'book__seller')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx
