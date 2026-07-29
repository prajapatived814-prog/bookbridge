from rest_framework import generics, permissions
from .models import ExchangeOffer
from .serializers import ExchangeOfferSerializer


class ExchangeOfferListCreateView(generics.ListCreateAPIView):
    serializer_class = ExchangeOfferSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return ExchangeOffer.objects.select_related(
            'offerer',
            'book',
            'book__seller',
            'offered_book',
            'offered_book__seller',
        ).filter(status='pending')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MyExchangeOffersView(generics.ListAPIView):
    serializer_class = ExchangeOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExchangeOffer.objects.select_related(
            'book',
            'book__seller',
            'offered_book',
            'offered_book__seller',
        ).filter(offerer=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx
