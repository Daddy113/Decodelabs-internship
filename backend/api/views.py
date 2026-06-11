from rest_framework import viewsets, filters
from .models import Intern
from .serializers import InternSerializer


class InternViewSet(viewsets.ModelViewSet):
    """
    API ViewSet providing full CRUD operations for Intern records.

    Endpoints:
        GET    /api/interns/            — List all interns (newest first)
        GET    /api/interns/?search=    — Search interns by name or email
        GET    /api/interns/?ordering=  — Order by name, created_at, or role
        GET    /api/interns/?role=      — Filter by development track
        POST   /api/interns/            — Register a new intern
        GET    /api/interns/{id}/       — Retrieve a specific intern
        PUT    /api/interns/{id}/       — Update an entire intern record
        PATCH  /api/interns/{id}/       — Partially update an intern record
        DELETE /api/interns/{id}/       — Remove an intern record
    """
    queryset = Intern.objects.all().order_by('-created_at')
    serializer_class = InternSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'created_at', 'role']
    ordering = ['-created_at']

    def get_queryset(self):
        """Override to support filtering by role via query parameter."""
        queryset = super().get_queryset()
        role = self.request.query_params.get('role', None)
        if role and role != 'all':
            queryset = queryset.filter(role__iexact=role)
        return queryset

