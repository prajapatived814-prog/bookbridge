from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.books.models import Book
from apps.books.serializers import BookSerializer


class AIRecommendationsView(APIView):
    """
    GET /api/v1/ai/recommendations/?branch=CE&semester=5
    Returns book recommendations scored by branch + semester match.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        branch = request.query_params.get('branch', 'CE')
        semester = request.query_params.get('semester', 5)

        books = Book.objects.filter(status='Available').select_related('seller')

        def score(b):
            s = 0
            if (b.branch or '').upper() == branch.upper():
                s += 40
            try:
                if b.semester == int(semester):
                    s += 50
            except (TypeError, ValueError):
                pass
            if b.resource_type == 'lab_manual':
                s += 10
            return s

        scored = sorted(books, key=score, reverse=True)[:6]
        serializer = BookSerializer(scored, many=True, context={'request': request})
        return Response(serializer.data)
