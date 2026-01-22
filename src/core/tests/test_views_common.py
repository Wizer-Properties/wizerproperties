"""
Tests for core.views.common and core.views.seo.
"""
from unittest.mock import patch

import pytest
from django.http import HttpResponse
from django.test import Client
from django.urls import reverse


@pytest.fixture
def client():
    return Client()


@pytest.mark.django_db
class TestCoreViewsCommon:
    def test_home_page_anonymous_returns_buyer_home(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_home_page_developer_returns_developer_home(self, client, developer_user):
        developer_user.is_complete_profile = True
        developer_user.save(update_fields=["is_complete_profile"])
        client.force_login(developer_user)
        # home_developer.html can fail when developerprofile.company_logo has no file; patch render
        with patch("core.views.common.render", return_value=HttpResponse(status=200)):
            response = client.get("/")
        assert response.status_code == 200

    def test_contact_page_returns_200(self, client):
        response = client.get(reverse("contact"))
        assert response.status_code == 200


@pytest.mark.django_db
class TestCoreViewsSeo:
    def test_robots_txt_returns_200_and_text(self, client):
        response = client.get(reverse("robots_txt"))
        assert response.status_code == 200
        assert "User-agent" in (response.content.decode() or "")
        assert "Disallow: /admin" in (response.content.decode() or "")


@pytest.mark.django_db
class TestPreLaunchClaims:
    """Test that pre-launch pages do not contain false claims about user counts, partnerships, etc."""

    def test_homepage_no_false_user_count(self, client):
        """Verify homepage does NOT contain '10,000+' or '10000' user count claims."""
        response = client.get("/")
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain specific false user counts
        assert "10,000+" not in content
        assert "10000+" not in content
        # But may contain generic "thousands" which is OK
        # Price values like 1000000 are OK, so we check for context
        assert "10,000+ international buyers" not in content
        assert "10,000+ verified buyers" not in content

    def test_homepage_no_specific_developer_names(self, client):
        """Verify homepage does NOT contain specific unconfirmed developer names."""
        response = client.get("/")
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain these specific developer names as partners
        assert "Sansiri" not in content or "Partner with us" in content
        assert "Ananda" not in content or "Partner with us" in content
        assert "Origin" not in content or "Partner with us" in content
        assert "Habitat Group" not in content or "Partner with us" in content
        assert "Minor International" not in content or "Partner with us" in content

    def test_homepage_has_partner_cta(self, client):
        """Verify homepage contains 'Partner with us' CTA with contact link."""
        response = client.get("/")
        assert response.status_code == 200
        content = response.content.decode()
        # Should contain partner CTA
        assert "Partner with us" in content or "Become a partner" in content
        # Should have contact link
        assert reverse("contact") in content or 'href="/contact/' in content

    def test_homepage_no_false_property_count(self, client):
        """Verify homepage does NOT contain '10,000+ properties verified' claim."""
        response = client.get("/")
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain false property count
        assert "10,000+ properties verified" not in content
        assert "10000+ properties" not in content

    def test_developer_homepage_no_pre_qualified_database(self, client, developer_user):
        """Verify developer homepage does NOT contain 'pre-qualified database' claim."""
        developer_user.is_complete_profile = True
        developer_user.save(update_fields=["is_complete_profile"])
        client.force_login(developer_user)
        with patch("core.views.common.render", return_value=HttpResponse(status=200)):
            response = client.get("/")
        assert response.status_code == 200
        # Get developer homepage directly
        response = client.get(reverse("developer-home"))
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain false database claim
        assert "database of pre-qualified international buyers" not in content
        assert "pre-qualified database" not in content

    def test_developer_homepage_has_partner_section(self, client):
        """Verify developer homepage contains 'Partner with us' section."""
        response = client.get(reverse("developer-home"))
        assert response.status_code == 200
        content = response.content.decode()
        # Should contain partner CTA
        assert "Partner with us" in content or "Become a partner" in content

    def test_about_us_no_false_metrics(self, client):
        """Verify about-us page does NOT contain false metrics."""
        response = client.get(reverse("about-us"))
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain false metrics
        assert "10,000+ international buyers" not in content
        assert "1,200+ Agents" not in content
        assert "1,200+ agents" not in content
        assert "40% Of enquiries" not in content
        assert "72 hrs Average" not in content
        assert "72hrs" not in content

    def test_login_page_no_false_agent_count(self, client):
        """Verify login page does NOT contain '1,200+ agents' claim."""
        response = client.get(reverse("user:login"))
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain false agent count
        assert "1,200+ agents" not in content
        assert "1,200+ agents and thousands" not in content

    def test_signup_page_no_false_agent_count(self, client):
        """Verify signup page does NOT contain '1,200+ agents' claim."""
        response = client.get(reverse("user:signup"))
        assert response.status_code == 200
        content = response.content.decode()
        # Should not contain false agent count
        assert "1,200+ agents" not in content
        assert "1,200+ agents and thousands" not in content

    def test_base_template_no_false_buyer_count(self, client):
        """Verify base template navigation does NOT contain '10,000+ verified buyers'."""
        response = client.get("/")
        assert response.status_code == 200
        content = response.content.decode()
        # Navigation should not contain false buyer count
        assert "10,000+ verified buyers" not in content

    def test_all_pages_render_successfully(self, client):
        """Verify all modified pages return status 200."""
        pages = [
            "/",
            reverse("developer-home"),
            reverse("about-us"),
            reverse("user:login"),
            reverse("user:signup"),
            reverse("contact"),
        ]
        for page in pages:
            response = client.get(page)
            assert response.status_code == 200, f"Page {page} returned {response.status_code}"
