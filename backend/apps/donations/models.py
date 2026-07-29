from django.db import models
from django.conf import settings


class DonationClaim(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    book = models.ForeignKey(
        'books.Book',
        on_delete=models.CASCADE,
        related_name='donation_claims',
        limit_choices_to={'mode': 'donate'},
    )
    claimer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donation_claims',
    )
    message = models.TextField(
        'Message to donor',
        blank=True,
        help_text='Why do you need this book?',
    )
    status = models.CharField(
        'Claim Status', max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('book', 'claimer')

    def __str__(self):
        return f"{self.claimer.full_name} claims '{self.book.title}' [{self.status}]"
