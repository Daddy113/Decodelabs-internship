from django.db import models


class Intern(models.Model):
    """
    Represents an intern registered in the DecodeLabs system.
    Stores personal info, development track, and registration timestamp.
    """
    ROLE_CHOICES = [
        ('Frontend', 'Frontend Developer'),
        ('Backend', 'Backend Developer'),
        ('Full Stack', 'Full Stack Developer'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    bio = models.TextField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.role})"

