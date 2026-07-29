from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ExchangeOffer
from .serializers import ExchangeOfferSerializer


class ExchangeOfferListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/exchange/offers/   — list all pending offers (public)
    POST /api/v1/exchange/offers/   — propose an exchange (auth)
    """
    serializer_class = ExchangeOfferSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return ExchangeOffer.objects.select_related(
            'proposer', 'book_offered', 'book_offered__seller'
        ).filter(status='pending')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class ExchangeOfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/exchange/offers/<id>/   — detail
    PATCH  /api/v1/exchange/offers/<id>/   — update status (accept/reject)
    DELETE /api/v1/exchange/offers/<id>/   — withdraw offer
    """
    queryset = ExchangeOffer.objects.select_related(
        'proposer', 'book_offered', 'book_offered__seller'
    ).all()
    serializer_class = ExchangeOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MyExchangeOffersView(generics.ListAPIView):
    """
    GET /api/v1/exchange/my-offers/   — offers sent by the current user
    """
    serializer_class = ExchangeOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExchangeOffer.objects.filter(
            proposer=self.request.user
        ).select_related('book_offered', 'book_offered__seller')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx
