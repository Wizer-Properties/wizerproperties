"""
Tests for core.templatetags.seo_tags.
"""
from datetime import datetime
from unittest.mock import MagicMock

import pytest

from core.templatetags.seo_tags import (
    organization_schema,
    property_schema,
    building_schema,
    article_schema,
    breadcrumb_schema,
)


class TestSeoTemplatetags:
    """Coverage for core/templatetags/seo_tags."""

    def test_organization_schema_returns_script(self):
        out = organization_schema()
        assert "application/ld+json" in out
        assert "Organization" in out
        assert "Wizer Properties" in out

    def test_property_schema_with_mock_returns_script(self):
        prop = MagicMock()
        prop.title = "Test Property"
        prop.id = 1
        prop.description = "A test"
        prop.price = 100
        prop.get_absolute_url.return_value = "/property/1/"
        prop.building = None
        prop.media_files.filter.return_value = []
        prop.is_available = False
        prop.have_vacant = False
        out = property_schema(prop)
        assert "application/ld+json" in out
        assert "Product" in out
        assert "Test Property" in out

    def test_building_schema_with_mock_returns_script(self):
        building = MagicMock()
        building.title = "Test Building"
        building.id = 1
        building.description = "A building"
        building.address = None
        building.district = "District"
        building.province = "Bangkok"
        building.latitude = None
        building.longitude = None
        building.media_files.filter.return_value = []
        out = building_schema(building)
        assert "application/ld+json" in out
        assert "Place" in out
        assert "Test Building" in out

    def test_article_schema_with_mock_returns_script(self):
        article = MagicMock()
        article.title = "Test Post"
        article.subtitle = None
        article.description = None
        article.banner_image = None
        article.created_at = datetime(2024, 1, 1)
        article.updated_at = datetime(2024, 1, 2)
        article.categories.exists.return_value = False
        out = article_schema(article)
        assert "application/ld+json" in out
        assert "Article" in out
        assert "Test Post" in out

    def test_breadcrumb_schema_returns_script(self):
        breadcrumbs = [("Home", "/"), ("Blog", "/blog/"), ("Post", "/blog/p/1/")]
        out = breadcrumb_schema(breadcrumbs)
        assert "application/ld+json" in out
        assert "BreadcrumbList" in out
        assert "Home" in out
        assert "Blog" in out
