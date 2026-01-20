"""
Tests for user.adapters.CustomAccountAdapter (PLG: social/Google signup activation).
"""
from unittest.mock import MagicMock, patch

import pytest

from user.adapters import CustomAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class TestCustomAccountAdapter:
    """PLG: Activation via Google OAuth; UX: user is marked verified and auth_type set."""

    def test_pre_social_login_does_nothing(self):
        """pre_social_login is a no-op hook; call completes without error."""
        adapter = CustomAccountAdapter(MagicMock())
        adapter.pre_social_login(MagicMock(), MagicMock())

    def test_save_user_sets_email_verification_status_and_auth_type(self):
        """When Google signup completes, user is marked verified and auth_type=google (PLG activation)."""
        mock_user = MagicMock()
        with patch.object(DefaultSocialAccountAdapter, "save_user", return_value=mock_user):
            adapter = CustomAccountAdapter(MagicMock())
            request = MagicMock()
            sociallogin = MagicMock()

            result = adapter.save_user(request, sociallogin, form=None)

            assert result is mock_user
            assert mock_user.email_verification_status is True
            assert mock_user.auth_type == "google"
            mock_user.save.assert_called_once()
