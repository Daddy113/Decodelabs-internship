from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Intern


class InternAPITests(APITestCase):
    """Test suite for the Intern REST API endpoints."""

    def setUp(self):
        """Create shared test data: URL reference and a pre-existing intern."""
        self.list_url = reverse('intern-list')
        self.intern_data = {
            "name": "Test Intern",
            "email": "test@decodelabs.tech",
            "role": "Frontend",
            "bio": "A passionate frontend developer testing models."
        }
        self.existing_intern = Intern.objects.create(
            name="John Doe",
            email="john@decodelabs.tech",
            role="Backend",
            bio="Backend developer."
        )

    def test_create_intern_success(self):
        """POST /api/interns/ with valid data returns 201 and creates a record."""
        response = self.client.post(self.list_url, self.intern_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Intern.objects.count(), 2)
        self.assertEqual(response.data['name'], "Test Intern")

    def test_create_intern_duplicate_email(self):
        """POST /api/interns/ with an existing email returns 400."""
        duplicate_data = self.intern_data.copy()
        duplicate_data['email'] = "john@decodelabs.tech"
        response = self.client.post(self.list_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_list_interns(self):
        """GET /api/interns/ returns 200 and lists all interns."""
        response = self.client.get(self.list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_intern(self):
        """PUT /api/interns/{id}/ with valid data returns 200 and updates the record."""
        detail_url = reverse('intern-detail', args=[self.existing_intern.id])
        updated_data = {
            "name": "John Doe Updated",
            "email": "john@decodelabs.tech",
            "role": "Full Stack",
            "bio": "Promoted to Full Stack developer."
        }
        response = self.client.put(detail_url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.existing_intern.refresh_from_db()
        self.assertEqual(self.existing_intern.name, "John Doe Updated")
        self.assertEqual(self.existing_intern.role, "Full Stack")

    def test_delete_intern(self):
        """DELETE /api/interns/{id}/ returns 204 and removes the record."""
        detail_url = reverse('intern-detail', args=[self.existing_intern.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Intern.objects.count(), 0)

    # --- New Tests: Search, Filter, Ordering ---

    def test_search_by_name(self):
        """GET /api/interns/?search=John returns matching interns."""
        Intern.objects.create(name="Alice Vance", email="alice@decodelabs.tech", role="Frontend")
        response = self.client.get(self.list_url, {'search': 'John'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "John Doe")

    def test_search_by_email(self):
        """GET /api/interns/?search=alice@ returns matching interns."""
        Intern.objects.create(name="Alice Vance", email="alice@decodelabs.tech", role="Frontend")
        response = self.client.get(self.list_url, {'search': 'alice@'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], "alice@decodelabs.tech")

    def test_filter_by_role(self):
        """GET /api/interns/?role=Frontend returns only Frontend interns."""
        Intern.objects.create(name="Alice Vance", email="alice@decodelabs.tech", role="Frontend")
        response = self.client.get(self.list_url, {'role': 'Frontend'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['role'], "Frontend")

    def test_ordering_by_name(self):
        """GET /api/interns/?ordering=name returns interns sorted alphabetically."""
        Intern.objects.create(name="Alice Vance", email="alice@decodelabs.tech", role="Frontend")
        response = self.client.get(self.list_url, {'ordering': 'name'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [i['name'] for i in response.data]
        self.assertEqual(names, sorted(names))

    def test_patch_intern(self):
        """PATCH /api/interns/{id}/ with partial data returns 200."""
        detail_url = reverse('intern-detail', args=[self.existing_intern.id])
        response = self.client.patch(detail_url, {"bio": "Updated bio only."}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.existing_intern.refresh_from_db()
        self.assertEqual(self.existing_intern.bio, "Updated bio only.")
        self.assertEqual(self.existing_intern.name, "John Doe")  # unchanged

    # --- Edge Case Tests ---

    def test_create_intern_empty_name(self):
        """POST /api/interns/ with empty name returns 400."""
        bad_data = self.intern_data.copy()
        bad_data['name'] = ""
        response = self.client.post(self.list_url, bad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_intern_bio_max_length(self):
        """POST /api/interns/ with bio over 200 chars returns 400."""
        bad_data = self.intern_data.copy()
        bad_data['email'] = "longbio@decodelabs.tech"
        bad_data['bio'] = "x" * 201
        response = self.client.post(self.list_url, bad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


