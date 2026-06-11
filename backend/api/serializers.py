from rest_framework import serializers
from .models import Intern

class InternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intern
        fields = ['id', 'name', 'email', 'role', 'bio', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        """
        Validate that the email is unique and matches basic validation rules.
        """
        normalized_email = value.strip().lower()
        if self.instance:
            # Updating an existing intern, check if other interns have this email
            if Intern.objects.filter(email__iexact=normalized_email).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("An intern with this email is already registered.")
        else:
            # Creating a new intern
            if Intern.objects.filter(email__iexact=normalized_email).exists():
                raise serializers.ValidationError("An intern with this email is already registered.")
        return normalized_email
