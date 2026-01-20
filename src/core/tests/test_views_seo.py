"""
Tests for core.views.seo that do not require the database.
"""
import pytest
from django.test import Client
from django.urls import reverse


@pytest.fixture
def client():
    return Client()


def test_robots_txt_returns_200_and_disallow(client):
    """robots_txt does not need DB; run without django_db for coverage when DB tests are skipped."""
    response = client.get(reverse("robots_txt"))
    assert response.status_code == 200
    content = response.content.decode()
    assert "User-agent" in content
    assert "Disallow: /admin" in content
    assert "Sitemap:" in content
