"""
Tests for core.views.auth (google_oauth2_login).
PLG: Activation via Google OAuth; UX: 503 with clear message when unconfigured, delegate when configured.
"""
from unittest.mock import patch

import pytest
from django.http import HttpResponse
from django.test import Client
from django.urls import reverse


@pytest.fixture
def client():
    return Client()


class TestGoogleOauth2Login:
    def test_google_oauth2_returns_503_when_credentials_missing(self, client):
        """When GOOGLE_* not set, user sees 503 and clear instructions (no 500)."""
        with patch("core.views.auth.settings") as mock_settings:
            mock_settings.SOCIALACCOUNT_PROVIDERS = {}
            response = client.get(reverse("google_login"))
        assert response.status_code == 503
        assert b"Google sign-in is not configured" in response.content
        assert b"GOOGLE_AUTH_CLIENT_ID" in response.content or b"GOOGLE" in response.content

    def test_google_oauth2_returns_503_when_client_id_empty(self, client):
        with patch("core.views.auth.settings") as mock_settings:
            mock_settings.SOCIALACCOUNT_PROVIDERS = {"google": {"APP": {"client_id": "  ", "secret": "x"}}}
            response = client.get(reverse("google_login"))
        assert response.status_code == 503

    def test_google_oauth2_delegates_to_allauth_when_configured(self, client):
        with patch("core.views.auth.settings") as mock_settings:
            mock_settings.SOCIALACCOUNT_PROVIDERS = {"google": {"APP": {"client_id": "id", "secret": "sec"}}}
            with patch("core.views.auth.allauth_oauth2_login") as mock_allauth:
                mock_allauth.return_value = HttpResponse(status=302)
                response = client.get(reverse("google_login"))
        mock_allauth.assert_called_once()
        assert response.status_code == 302

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_google_oauth2_integration_adapter_instantiation(self, client):
        """GET /accounts/google/login/ with test Google APP: real allauth runs, CustomAccountAdapter(request) succeeds, redirect to Google."""
        response = client.get(reverse("google_login"))
        assert response.status_code == 302
        location = response.get("Location") or ""
        assert "google" in location.lower() or "accounts.google.com" in location
