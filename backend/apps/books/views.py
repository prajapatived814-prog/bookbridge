from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Book, Wishlist
from .serializers import BookSerializer, BookCreateSerializer, WishlistSerializer
from apps.users.serializers import UserSerializer


class BookListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/books/         — list books (public, filterable)
    POST /api/v1/books/         — create book (auth required)
    """
    queryset = Book.objects.select_related('seller').filter(status='Available')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['branch', 'semester', 'mode', 'condition', 'resource_type']
    search_fields = ['title', 'author', 'gtu_code', 'isbn', 'subject', 'genre']
    ordering_fields = ['price', 'rating', 'created_at', 'semester']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookCreateSerializer
        return BookSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/books/<id>/   — book detail (public)
    PUT    /api/v1/books/<id>/   — update (owner or admin)
    DELETE /api/v1/books/<id>/   — delete (owner or admin)
    """
    queryset = Book.objects.select_related('seller').all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class WishlistToggleView(APIView):
    """
    POST /api/v1/books/wishlist/toggle/   — toggle wishlist for a book
    Body: { "book_id": <int> }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        if not book_id:
            return Response({'error': 'book_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, book=book)
        if not created:
            wishlist_item.delete()
            return Response({'added': False, 'message': 'Removed from wishlist'})
        return Response({'added': True, 'message': 'Added to wishlist'}, status=status.HTTP_201_CREATED)


class WishlistListView(generics.ListAPIView):
    """
    GET /api/v1/books/wishlist/   — get current user's wishlist
    """
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('book', 'book__seller')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class BookStatsView(APIView):
    """
    GET /api/v1/books/stats/   — platform-wide statistics (public)
    Returns counts for homepage live stats.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.users.models import User
        from apps.exchange.models import ExchangeOffer
        from apps.donations.models import DonationClaim

        total_users = User.objects.count()
        total_books = Book.objects.count()
        exchange_books = Book.objects.filter(mode='exchange').count()
        donated_books = Book.objects.filter(mode='donate').count()
        total_offers = ExchangeOffer.objects.count()
        total_claims = DonationClaim.objects.count()
        total_saved = sum(
            float(b.original_price or 0) for b in Book.objects.only('original_price')
        )

        return Response({
            'totalUsers': total_users,
            'totalListings': total_books,
            'activeSwaps': exchange_books,
            'freeDonations': donated_books,
            'successfulExchanges': exchange_books + total_offers + total_claims,
            'moneySaved': round(total_saved, 2),
        })
