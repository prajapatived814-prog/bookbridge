from django.urls import path
from .views import AIRecommendationsView

urlpatterns = [
    path('recommendations/', AIRecommendationsView.as_view(), name='ai-recommendations'),
]
