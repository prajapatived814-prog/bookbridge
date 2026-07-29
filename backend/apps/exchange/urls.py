from django.urls import path
from .views import ExchangeOfferListCreateView, MyExchangeOffersView

urlpatterns = [
    path('offers/', ExchangeOfferListCreateView.as_view(), name='exchange-offer-list'),
    path('my-offers/', MyExchangeOffersView.as_view(), name='exchange-my-offers'),
]
