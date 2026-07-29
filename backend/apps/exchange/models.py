from django.db import models
from django.conf import settings


class ExchangeOffer(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )

    proposer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchange_offers_sent',
    )
    book_offered = models.ForeignKey(
        'books.Book',
        on_delete=models.CASCADE,
        related_name='exchange_offers',
        help_text='Book the proposer is offering',
    )
    book_wanted_title = models.CharField(
        'Book Wanted (title)',
        max_length=255,
        help_text='Title of the book the proposer wants in return',
    )
    message = models.TextField('Message to owner', blank=True)
    status = models.CharField(
        'Offer Status', max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.proposer.full_name} offers '{self.book_offered.title}' for '{self.book_wanted_title}'"
