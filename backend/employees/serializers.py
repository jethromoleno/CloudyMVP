# employees/serializers.py

from rest_framework import serializers
from accounts.models import FMSUser 
from django.utils import timezone # 👈 Add this import at the top of serializers.py
from rest_framework.validators import UniqueValidator


class DriverSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    # 🚨 CRITICAL FIX: Explicitly define the email field to prevent DRF from passing 'unique'
    email = serializers.EmailField(
        required=True,
        # Re-apply uniqueness using the Validator, which is the DRF way to handle it
        validators=[UniqueValidator(queryset=FMSUser.objects.all())]
    )

    class Meta:
        model = FMSUser
        # Exclude password, and now include 'role' for reading back the result
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role') 
        # The role is set by the API endpoint, so it should not be writable directly on POST
        read_only_fields = ('role',) 
        extra_kwargs = {'email': {'required': True, 'unique': True}}