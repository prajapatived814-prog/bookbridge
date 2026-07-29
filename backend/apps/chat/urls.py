from django.urls import path
from .views import MessageSendView, MyInboxView, MarkReadView

urlpatterns = [
    path('messages/', MessageSendView.as_view(), name='message-send'),
    path('inbox/', MyInboxView.as_view(), name='chat-inbox'),
    path('messages/<int:pk>/read/', MarkReadView.as_view(), name='message-mark-read'),
]
