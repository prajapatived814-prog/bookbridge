from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    )

    DEPARTMENT_CHOICES = (
        ('CE', 'Computer Engineering'),
        ('IT', 'Information Technology'),
        ('ICT', 'ICT'),
        ('EE', 'Electrical Engineering'),
        ('ME', 'Mechanical Engineering'),
        ('Civil', 'Civil Engineering'),
        ('General', 'General'),
    )

    username = None
    email = models.EmailField('Email Address', unique=True)
    full_name = models.CharField('Full Name', max_length=150)
    enrollment = models.CharField('GTU Enrollment Number', max_length=20, blank=True, null=True)
    branch = models.CharField('Department', max_length=20, choices=DEPARTMENT_CHOICES, default='CE')
    semester = models.IntegerField('Current Semester', default=1)
    whatsapp = models.CharField('WhatsApp Phone', max_length=20, blank=True, null=True)
    role = models.CharField('User Role', max_length=20, choices=ROLE_CHOICES, default='student')
    rating = models.FloatField('User Rating', default=5.0)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} ({self.email})"
