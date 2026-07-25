from django.urls import path
from .views import RegisterView, ProfileView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('admin/users/', UserListView.as_view(), name='user-list-admin'),
]
