from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer, MessageReadSerializer


class MessageSendView(generics.CreateAPIView):
    """
    POST /api/v1/chat/messages/   — send a message to another user
    Body: { receiver_email, text, book_id (opt), book_title (opt) }
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MyInboxView(generics.ListAPIView):
    """
    GET /api/v1/chat/inbox/   — all messages sent to/from current user
    Optional ?with=<email> to filter conversation with a specific user.
    """
    serializer_class = MessageReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        me = self.request.user
        with_email = self.request.query_params.get('with')
        qs = Message.objects.select_related('sender', 'receiver').filter(
            Q(sender=me) | Q(receiver=me)
        )
        if with_email:
            qs = qs.filter(
                Q(sender__email=with_email) | Q(receiver__email=with_email)
            )
        return qs


class MarkReadView(APIView):
    """
    PATCH /api/v1/chat/messages/<id>/read/   — mark a message as read
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            msg = Message.objects.get(pk=pk, receiver=request.user)
            msg.is_read = True
            msg.save(update_fields=['is_read'])
            return Response({'status': 'marked as read'})
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=404)
