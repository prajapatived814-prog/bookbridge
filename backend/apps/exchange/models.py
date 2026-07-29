from django.db import models
from django.conf import settings


class ExchangeOffer(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )

    book = models.ForeignKey(
        'books.Book',
        on_delete=models.CASCADE,
        related_name='exchange_offers',
        limit_choices_to={'mode': 'exchange'},
        help_text='The book listing this offer is targeting.',
    )

    offerer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchange_offers',
        help_text='The student proposing the exchange.',
    )

    offered_book = models.ForeignKey(
        'books.Book',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='offered_in_exchanges',
        help_text='The book the offerer is proposing to give in trade.',
    )

    message = models.TextField(
        'Message to book owner',
        blank=True,
        help_text='Optional note from the offerer to the book owner.',
    )
    status = models.CharField(
        'Offer Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('book', 'offerer')

    def __str__(self):
        offered_title = self.offered_book.title if self.offered_book else 'unspecified book'
        return (
            f"{self.offerer.full_name} offers '{offered_title}' "
            f"for '{self.book.title}' [{self.status}]"
        )
