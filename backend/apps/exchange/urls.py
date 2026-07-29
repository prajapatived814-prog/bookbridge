from django.urls import path
from .views import ExchangeOfferListCreateView, ExchangeOfferDetailView, MyExchangeOffersView

urlpatterns = [
    path('offers/', ExchangeOfferListCreateView.as_view(), name='exchange-offer-list'),
    path('offers/<int:pk>/', ExchangeOfferDetailView.as_view(), name='exchange-offer-detail'),
    path('my-offers/', MyExchangeOffersView.as_view(), name='my-exchange-offers'),
]
