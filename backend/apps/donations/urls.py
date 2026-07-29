from django.urls import path
from .views import DonationClaimListCreateView, MyDonationClaimsView

urlpatterns = [
    path('claims/', DonationClaimListCreateView.as_view(), name='donation-claim-list'),
    path('my-claims/', MyDonationClaimsView.as_view(), name='my-donation-claims'),
]
