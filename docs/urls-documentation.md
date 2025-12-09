# Wizer Properties - Complete URL & Link Documentation

This document provides a comprehensive overview of all URLs, links, and routes in the Wizer Properties application, including their purposes and the files that control them.

**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Main Application Routes](#main-application-routes)
2. [User Authentication & Profile Routes](#user-authentication--profile-routes)
3. [Property Routes](#property-routes)
4. [Building Routes](#building-routes)
5. [Blog Routes](#blog-routes)
6. [Advertisement Routes](#advertisement-routes)
7. [Schedule Routes](#schedule-routes)
8. [API Endpoints](#api-endpoints)
9. [External Links](#external-links)

---

## Main Application Routes

### Homepage & Core Pages

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/` | `http://localhost:8000/` | `https://wizerproperties.com/` | `home` | Main landing page (buyer-focused) or developer homepage if user is developer/agent | `src/core/views/common.py` (`home_page`) | `src/core/templates/home.html` or `home_developer.html` |
| `/developers/` | `http://localhost:8000/developers/` | `https://wizerproperties.com/developers/` | `developer-home` | Developer-focused homepage | `src/core/views/common.py` (`developer_home_page`) | `src/core/templates/home_developer.html` |
| `/developers/pricing/` | `http://localhost:8000/developers/pricing/` | `https://wizerproperties.com/developers/pricing/` | `developer-pricing` | Developer pricing information page | `src/core/views/common.py` (`developer_pricing_page`) | `src/core/templates/developers_pricing.html` |
| `/dashboard/` | `http://localhost:8000/dashboard/` | `https://wizerproperties.com/dashboard/` | `dashboard` | User dashboard (different for developers/agents vs prospects) | `src/core/views/dashboard.py` (`dashboard`) | `src/core/templates/core/developer_or_agent_dashboard.html` or `prospect_dashboard.html` |
| `/contact/` | `http://localhost:8000/contact/` | `https://wizerproperties.com/contact/` | `contact` | Contact us page | `src/core/views/common.py` (`contact_page`) | `src/core/templates/contact_us.html` |
| `/about-us/` | `http://localhost:8000/about-us/` | `https://wizerproperties.com/about-us/` | `about-us` | About us page | `src/core/views/common.py` (`about_us_page`) | `src/core/templates/about-us.html` |
| `/privacy/` | `http://localhost:8000/privacy/` | `https://wizerproperties.com/privacy/` | `privacy` | Privacy policy page | `src/core/views/common.py` (`privacy_page`) | `src/core/templates/privacy.html` |
| `/404/` | `http://localhost:8000/404/` | `https://wizerproperties.com/404/` | `custom_404` | Custom 404 error page | `src/core/views/common.py` (`custom_404`) | `src/core/templates/404.html` |
| `/reels/` | `http://localhost:8000/reels/` | `https://wizerproperties.com/reels/` | `reels` | Public reels/video tours page | `src/advertise/views.py` (`reels`) | `src/advertise/templates/reels.html` |

### SEO & System Routes

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/robots.txt` | `http://localhost:8000/robots.txt` | `https://wizerproperties.com/robots.txt` | `robots_txt` | Robots.txt file for search engines | `src/core/views/seo.py` (`robots_txt`) | Generated dynamically |
| `/sitemap.xml` | `http://localhost:8000/sitemap.xml` | `https://wizerproperties.com/sitemap.xml` | `django.contrib.sitemaps.views.sitemap` | XML sitemap for SEO | Django sitemaps | Generated dynamically |
| `/admin/` | `http://localhost:8000/admin/` | `https://wizerproperties.com/admin/` | `admin` | Django admin interface (custom admin site) | `src/core/admin.py` | Django admin templates |

### Google Authentication

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/accounts/google/login/` | `http://localhost:8000/accounts/google/login/` | `https://wizerproperties.com/accounts/google/login/` | `google_login` | Google OAuth login | `allauth.socialaccount.providers.google.views` | Handled by allauth |
| `/accounts/google/login/callback/` | `http://localhost:8000/accounts/google/login/callback/` | `https://wizerproperties.com/accounts/google/login/callback/` | `google_callback` | Google OAuth callback | `allauth.socialaccount.providers.google.views` | Handled by allauth |

---

## User Authentication & Profile Routes

### Authentication

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/user/signup/` | `http://localhost:8000/user/signup/` | `https://wizerproperties.com/user/signup/` | `user:signup` | User registration page | `src/user/views/auth/signup.py` (`SignupView`) | `src/user/templates/auth/signup.html` |
| `/user/get-started/` | `http://localhost:8000/user/get-started/` | `https://wizerproperties.com/user/get-started/` | `user:signup_legacy` | Legacy signup URL (alias) | `src/user/views/auth/signup.py` (`SignupView`) | `src/user/templates/auth/signup.html` |
| `/user/login/` | `http://localhost:8000/user/login/` | `https://wizerproperties.com/user/login/` | `user:login` | User login page | `src/user/views/auth/login.py` (`login`) | `src/user/templates/auth/login.html` |
| `/user/logout/` | `http://localhost:8000/user/logout/` | `https://wizerproperties.com/user/logout/` | `user:logout` | User logout | Django's `LogoutView` | Redirects to login |

### Email Verification

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/user/email-verify/` | `http://localhost:8000/user/email-verify/` | `https://wizerproperties.com/user/email-verify/` | `user:email_verify` | Email verification page | `src/user/views/auth/email_verification.py` (`email_verification`) | `src/user/templates/auth/email_verification.html` |
| `/user/email/verify/` | `http://localhost:8000/user/email/verify/` | `https://wizerproperties.com/user/email/verify/` | `user:email_verify_alt` | Alternative email verification URL | `src/user/views/auth/email_verification.py` (`email_verification`) | `src/user/templates/auth/email_verification.html` |
| `/user/verify-link/` | `http://localhost:8000/user/verify-link/` | `https://wizerproperties.com/user/verify-link/` | `user:verify_link` | Verify email link handler | `src/user/views/auth/verify_link.py` (`verify_link`) | Various templates |
| `/user/verify/` | `http://localhost:8000/user/verify/` | `https://wizerproperties.com/user/verify/` | `user:verify_link_alt` | Alternative verify link URL | `src/user/views/auth/verify_link.py` (`verify_link`) | Various templates |

### Password Management

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/user/password/reset/` | `http://localhost:8000/user/password/reset/` | `https://wizerproperties.com/user/password/reset/` | `user:password_reset` | Password reset request | `src/user/views/auth/forgot_password.py` (`forgot_password`) | `src/user/templates/auth/forgot_password.html` |
| `/user/forgot-password/` | `http://localhost:8000/user/forgot-password/` | `https://wizerproperties.com/user/forgot-password/` | `user:forgot_password` | Legacy password reset URL | `src/user/views/auth/forgot_password.py` (`forgot_password`) | `src/user/templates/auth/forgot_password.html` |
| `/user/password/reset/confirm/` | `http://localhost:8000/user/password/reset/confirm/` | `https://wizerproperties.com/user/password/reset/confirm/` | `user:password_reset_confirm` | Password reset confirmation | `src/user/views/auth/update-password.py` (`update_password`) | `src/user/templates/auth/update-password.html` |
| `/user/update-password/` | `http://localhost:8000/user/update-password/` | `https://wizerproperties.com/user/update-password/` | `user:update_password` | Legacy update password URL | `src/user/views/auth/update-password.py` (`update_password`) | `src/user/templates/auth/update-password.html` |
| `/user/password/reset/verify/` | `http://localhost:8000/user/password/reset/verify/` | `https://wizerproperties.com/user/password/reset/verify/` | `user:password_reset_verify` | Password reset verification | `src/user/views/auth/forgot_password_verification.py` (`forgot_password_verification`) | `src/user/templates/auth/forgot_password_verification.html` |
| `/user/forgot-password-verify/` | `http://localhost:8000/user/forgot-password-verify/` | `https://wizerproperties.com/user/forgot-password-verify/` | `user:forgot_password_verify` | Legacy password reset verify URL | `src/user/views/auth/forgot_password_verification.py` (`forgot_password_verification`) | `src/user/templates/auth/forgot_password_verification.html` |

### Profile Management

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/user/complete-profile/` | `http://localhost:8000/user/complete-profile/` | `https://wizerproperties.com/user/complete-profile/` | `user:complete_profile` | Complete user profile setup | `src/user/views/auth/profile/complete_profile.py` (`complete_profile`) | `src/user/templates/auth/complete_profile.html` |
| `/user/profile/complete/` | `http://localhost:8000/user/profile/complete/` | `https://wizerproperties.com/user/profile/complete/` | `user:complete_profile_alt` | Alternative complete profile URL | `src/user/views/auth/profile/complete_profile.py` (`complete_profile`) | `src/user/templates/auth/complete_profile.html` |
| `/user/profile-settings/` | `http://localhost:8000/user/profile-settings/` | `https://wizerproperties.com/user/profile-settings/` | `user:profile_settings` | User profile settings page | `src/user/views/auth/profile/profile_settings.py` (`profile_settings`) | `src/user/templates/auth/profile_settings.html` |
| `/user/profile/settings/` | `http://localhost:8000/user/profile/settings/` | `https://wizerproperties.com/user/profile/settings/` | `user:profile_settings_alt` | Alternative profile settings URL | `src/user/views/auth/profile/profile_settings.py` (`profile_settings`) | `src/user/templates/auth/profile_settings.html` |

---

## Property Routes

### Property Management

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/property/create/` | `http://localhost:8000/property/create/` | `https://wizerproperties.com/property/create/` | `property:create` | Create new property listing | `src/property/views/property.py` (`create_property`) | `src/property/templates/create_property.html` |
| `/property/details/<id>/` | `http://localhost:8000/property/details/<id>/` | `https://wizerproperties.com/property/details/<id>/` | `property:get` | View property details page | `src/property/views/property.py` (`get_property`) | `src/property/templates/get_property.html` |
| `/property/update/<id>/` | `http://localhost:8000/property/update/<id>/` | `https://wizerproperties.com/property/update/<id>/` | `property:update` | Update existing property | `src/property/views/property.py` (`update_property`) | `src/property/templates/update_property.html` |

### Property Search & Discovery

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/property/search/` | `http://localhost:8000/property/search/` | `https://wizerproperties.com/property/search/` | `property:search` | Property search page | `src/property/views/property.py` (`search_property`) | `src/property/templates/search_property.html` |
| `/property/search-with-map/` | `http://localhost:8000/property/search-with-map/` | `https://wizerproperties.com/property/search-with-map/` | `property:search_with_map` | Property search with map view | `src/property/views/property.py` (`search_property_with_map`) | `src/property/templates/search_property_with_map.html` |
| `/property/comparison/` | `http://localhost:8000/property/comparison/` | `https://wizerproperties.com/property/comparison/` | `property:comparison` | Compare multiple properties side-by-side | `src/property/views/property.py` (`comparison_property`) | `src/property/templates/comparison.html` |
| `/property/favorite-list/` | `http://localhost:8000/property/favorite-list/` | `https://wizerproperties.com/property/favorite-list/` | `property:favorite_list` | User's favorite properties list | `src/property/views/property.py` (`favorite_list`) | `src/property/templates/favorite-list.html` |
| `/property/list/<id>/` | `http://localhost:8000/property/list/<id>/` | `https://wizerproperties.com/property/list/<id>/` | `property:list` | Developer/agent property list page | `src/property/views/property.py` (`dev_agent_property_list`) | `src/property/templates/developer-agent-property-list.html` |

### Discount & Featured Properties

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/property/discount/list/` | `http://localhost:8000/property/discount/list/` | `https://wizerproperties.com/property/discount/list/` | `property:discount_list` | List all discount properties | `src/property/views/discount_featured.py` (`discount_property_list`) | `src/property/templates/property/discount_featured_list.html` |
| `/property/featured/list/` | `http://localhost:8000/property/featured/list/` | `https://wizerproperties.com/property/featured/list/` | `property:featured_list` | List all featured properties | `src/property/views/discount_featured.py` (`featured_property_list`) | `src/property/templates/property/discount_featured_list.html` |
| `/property/discount/create/` | `http://localhost:8000/property/discount/create/` | `https://wizerproperties.com/property/discount/create/` | `property:create_discount` | Create discount promotion for property | `src/property/views/discount_featured.py` (`create_discount_property`) | `src/property/templates/property/create_discount_featured.html` |
| `/property/featured/create/` | `http://localhost:8000/property/featured/create/` | `https://wizerproperties.com/property/featured/create/` | `property:create_featured` | Create featured promotion for property | `src/property/views/discount_featured.py` (`create_featured_property`) | `src/property/templates/property/create_discount_featured.html` |
| `/property/discount/edit/<discount_id>/` | `http://localhost:8000/property/discount/edit/<discount_id>/` | `https://wizerproperties.com/property/discount/edit/<discount_id>/` | `property:edit_discount` | Edit discount promotion | `src/property/views/discount_featured.py` (`edit_discount_property`) | `src/property/templates/property/edit_discount_featured.html` |
| `/property/featured/edit/<featured_id>/` | `http://localhost:8000/property/featured/edit/<featured_id>/` | `https://wizerproperties.com/property/featured/edit/<featured_id>/` | `property:edit_featured` | Edit featured promotion | `src/property/views/discount_featured.py` (`edit_featured_property`) | `src/property/templates/property/edit_discount_featured.html` |
| `/property/discount/delete/<discount_id>/` | `http://localhost:8000/property/discount/delete/<discount_id>/` | `https://wizerproperties.com/property/discount/delete/<discount_id>/` | `property:delete_discount` | Delete discount promotion | `src/property/views/discount_featured.py` (`delete_discount_property`) | `src/property/templates/property/delete_discount_featured.html` |
| `/property/featured/delete/<featured_id>/` | `http://localhost:8000/property/featured/delete/<featured_id>/` | `https://wizerproperties.com/property/featured/delete/<featured_id>/` | `property:delete_featured` | Delete featured promotion | `src/property/views/discount_featured.py` (`delete_featured_property`) | `src/property/templates/property/delete_discount_featured.html` |

---

## Building Routes

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/building/create/` | `http://localhost:8000/building/create/` | `https://wizerproperties.com/building/create/` | `building:create` | Create new building/project | `src/building/views.py` (`create_building`) | `src/building/templates/create_building.html` |
| `/building/details/<id>/` | `http://localhost:8000/building/details/<id>/` | `https://wizerproperties.com/building/details/<id>/` | `building:get` | View building details page | `src/building/views.py` (`get_building`) | `src/building/templates/get_building.html` |
| `/building/update/<id>/` | `http://localhost:8000/building/update/<id>/` | `https://wizerproperties.com/building/update/<id>/` | `building:update` | Update existing building | `src/building/views.py` (`update_building`) | `src/building/templates/update_building.html` |

---

## Blog Routes

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/blogs/` | `http://localhost:8000/blogs/` | `https://wizerproperties.com/blogs/` | `blogs:blog_list` | Blog listing page | `src/blog/views.py` (`blog_list`) | `src/blog/templates/blog-list.html` |
| `/blogs/<slug>/` | `http://localhost:8000/blogs/<slug>/` | `https://wizerproperties.com/blogs/<slug>/` | `blogs:blog_details` | Individual blog post page | `src/blog/views.py` (`blog_details`) | `src/blog/templates/blog-details.html` |

---

## Advertisement Routes

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/advertise/create-reels/` | `http://localhost:8000/advertise/create-reels/` | `https://wizerproperties.com/advertise/create-reels/` | `advertise:create_reels` | Create video reel/advertisement | `src/advertise/views.py` (`create_reels`) | `src/advertise/templates/create-edit-reels.html` |
| `/advertise/edit-reels/<id>/` | `http://localhost:8000/advertise/edit-reels/<id>/` | `https://wizerproperties.com/advertise/edit-reels/<id>/` | `advertise:create_reels` | Edit video reel/advertisement | `src/advertise/views.py` (`edit_reels`) | `src/advertise/templates/create-edit-reels.html` |
| `/advertise/analytics/` | `http://localhost:8000/advertise/analytics/` | `https://wizerproperties.com/advertise/analytics/` | `advertise:analytics` | Advertisement analytics dashboard | `src/advertise/views.py` (`advertise_analytics`) | `src/advertise/templates/advertise-analytics.html` |
| `/advertise/performance/` | `http://localhost:8000/advertise/performance/` | `https://wizerproperties.com/advertise/performance/` | `advertise:performance` | Advertisement performance dashboard | `src/advertise/views.py` (`advertise_performance`) | `src/advertise/templates/advertise-performance.html` |

---

## Schedule Routes

| URL | Localhost | Production | Name | Purpose | View File | Template File |
|-----|----------|-----------|------|---------|-----------|---------------|
| `/schedule/create_schedule/` | `http://localhost:8000/schedule/create_schedule/` | `https://wizerproperties.com/schedule/create_schedule/` | `schedule:create_schedule` | Create property viewing schedule | `src/schedule/views.py` (`create_schedule`) | `src/schedule/templates/create_schedule.html` |

---

## API Endpoints

### Core API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/core/api/contact/` | `http://localhost:8000/core/api/contact/` | `https://wizerproperties.com/core/api/contact/` | `core:api:contact` | Submit contact form (POST) | `src/core/api/views/contact.py` (`ContactViewSet`) |
| `/core/api/chatbot-gpt-api/` | `http://localhost:8000/core/api/chatbot-gpt-api/` | `https://wizerproperties.com/core/api/chatbot-gpt-api/` | `core:api:chatbot_gpt_api` | AI chatbot API endpoint | `src/core/api/views/contact.py` (`chatbot_gpt_api_view`) |

### User API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/user/api/developer-create/` | `http://localhost:8000/user/api/developer-create/` | `https://wizerproperties.com/user/api/developer-create/` | `user:api:developer_create` | Create developer profile (POST) | `src/user/api/views/profile.py` (`DeveloperProfileViewSet`) |
| `/user/api/agent-create/` | `http://localhost:8000/user/api/agent-create/` | `https://wizerproperties.com/user/api/agent-create/` | `user:api:agent_create` | Create agent profile (POST) | `src/user/api/views/profile.py` (`AgentProfileViewSet`) |
| `/user/api/prospect-create/` | `http://localhost:8000/user/api/prospect-create/` | `https://wizerproperties.com/user/api/prospect-create/` | `user:api:prospect_create` | Create prospect profile (POST) | `src/user/api/views/profile.py` (`ProspectProfileViewSet`) |
| `/user/api/developer-update/<pk>/` | `http://localhost:8000/user/api/developer-update/<pk>/` | `https://wizerproperties.com/user/api/developer-update/<pk>/` | `user:api:developer_update` | Update developer profile (PUT/PATCH) | `src/user/api/views/profile.py` (`DeveloperProfileViewSet`) |
| `/user/api/agent-update/<pk>/` | `http://localhost:8000/user/api/agent-update/<pk>/` | `https://wizerproperties.com/user/api/agent-update/<pk>/` | `user:api:agent_update` | Update agent profile (PUT/PATCH) | `src/user/api/views/profile.py` (`AgentProfileViewSet`) |
| `/user/api/prospect-update/<pk>/` | `http://localhost:8000/user/api/prospect-update/<pk>/` | `https://wizerproperties.com/user/api/prospect-update/<pk>/` | `user:api:prospect_update` | Update prospect profile (PUT/PATCH) | `src/user/api/views/profile.py` (`ProspectProfileViewSet`) |

### Property API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/property/api/list/` | `http://localhost:8000/property/api/list/` | `https://wizerproperties.com/property/api/list/` | `property:api:list` | List all properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/list/discount/` | `http://localhost:8000/property/api/list/discount/` | `https://wizerproperties.com/property/api/list/discount/` | `property:api:discount` | List discount properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/nearby_property_list/<pk>/` | `http://localhost:8000/property/api/nearby_property_list/<pk>/` | `https://wizerproperties.com/property/api/nearby_property_list/<pk>/` | `property:api:nearby_property_list` | Get nearby properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/information/` | `http://localhost:8000/property/api/details/<pk>/information/` | `https://wizerproperties.com/property/api/details/<pk>/information/` | `property:api:property_info` | Get property information (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/list/newly-created/` | `http://localhost:8000/property/api/list/newly-created/` | `https://wizerproperties.com/property/api/list/newly-created/` | `property:api:newly_created` | Get newly created properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/list/popular/` | `http://localhost:8000/property/api/list/popular/` | `https://wizerproperties.com/property/api/list/popular/` | `property:api:popular` | Get popular properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/list/suggested-properties/` | `http://localhost:8000/property/api/list/suggested-properties/` | `https://wizerproperties.com/property/api/list/suggested-properties/` | `property:api:suggested_properties` | Get suggested properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/` | `http://localhost:8000/property/api/details/<pk>/` | `https://wizerproperties.com/property/api/details/<pk>/` | `property:api:details` | Get property details (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/media-files/` | `http://localhost:8000/property/api/details/<pk>/media-files/` | `https://wizerproperties.com/property/api/details/<pk>/media-files/` | `property:api:media_files` | Get property media files (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/developer-info/` | `http://localhost:8000/property/api/details/<pk>/developer-info/` | `https://wizerproperties.com/property/api/details/<pk>/developer-info/` | `property:api:developer_info` | Get developer information (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/building-info/` | `http://localhost:8000/property/api/details/<pk>/building-info/` | `https://wizerproperties.com/property/api/details/<pk>/building-info/` | `property:api:building_info` | Get building information (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/schedule/` | `http://localhost:8000/property/api/details/<pk>/schedule/` | `https://wizerproperties.com/property/api/details/<pk>/schedule/` | `property:api:schedule` | Get property schedule info (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/available-facilities/` | `http://localhost:8000/property/api/details/<pk>/available-facilities/` | `https://wizerproperties.com/property/api/details/<pk>/available-facilities/` | `property:api:available_facilities` | Get available facilities (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/count-in-price-ranges/` | `http://localhost:8000/property/api/count-in-price-ranges/` | `https://wizerproperties.com/property/api/count-in-price-ranges/` | `property:api:count_in_price_ranges` | Count properties in price ranges (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/nearest/` | `http://localhost:8000/property/api/nearest/` | `https://wizerproperties.com/property/api/nearest/` | `property:api:nearest` | Get nearest properties (GET) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/generate-description/` | `http://localhost:8000/property/api/generate-description/` | `https://wizerproperties.com/property/api/generate-description/` | `property:api:generate_description` | Generate AI property description (POST) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/re-generate-description/` | `http://localhost:8000/property/api/re-generate-description/` | `https://wizerproperties.com/property/api/re-generate-description/` | `property:api:re_generate_description` | Regenerate AI property description (POST) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/create/` | `http://localhost:8000/property/api/create/` | `https://wizerproperties.com/property/api/create/` | `property:api:create` | Create property (POST) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/update/<pk>/` | `http://localhost:8000/property/api/update/<pk>/` | `https://wizerproperties.com/property/api/update/<pk>/` | `property:api:update` | Update property (PUT/PATCH) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/delete/<pk>/` | `http://localhost:8000/property/api/delete/<pk>/` | `https://wizerproperties.com/property/api/delete/<pk>/` | `property:api:delete` | Delete property (DELETE) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/details/<pk>/manage-property-view-time/` | `http://localhost:8000/property/api/details/<pk>/manage-property-view-time/` | `https://wizerproperties.com/property/api/details/<pk>/manage-property-view-time/` | `property:api:manage_property_view_time` | Track property view time (PATCH) | `src/property/api/views/property.py` (`PropertyViewSet`) |
| `/property/api/compare/list/` | `http://localhost:8000/property/api/compare/list/` | `https://wizerproperties.com/property/api/compare/list/` | `property:api:compare_list` | Get comparison list (GET) | `src/property/api/views/property.py` (`ComparePropertyViewSet`) |
| `/property/api/compare/create/` | `http://localhost:8000/property/api/compare/create/` | `https://wizerproperties.com/property/api/compare/create/` | `property:api:compare_create` | Add property to comparison (POST) | `src/property/api/views/property.py` (`ComparePropertyViewSet`) |
| `/property/api/compare/delete/` | `http://localhost:8000/property/api/compare/delete/` | `https://wizerproperties.com/property/api/compare/delete/` | `property:api:compare_delete` | Remove property from comparison (DELETE) | `src/property/api/views/property.py` (`ComparePropertyViewSet`) |
| `/property/api/prospect-favorite/list/` | `http://localhost:8000/property/api/prospect-favorite/list/` | `https://wizerproperties.com/property/api/prospect-favorite/list/` | `property:api:prospect_favorite_property_list` | Get favorite properties (GET) | `src/property/api/views/property.py` (`ProspectFavoritePropertyViewSet`) |
| `/property/api/prospect-favorite/add/` | `http://localhost:8000/property/api/prospect-favorite/add/` | `https://wizerproperties.com/property/api/prospect-favorite/add/` | `property:api:add_prospect_favorite_property` | Add to favorites (POST) | `src/property/api/views/property.py` (`ProspectFavoritePropertyViewSet`) |
| `/property/api/prospect-favorite/remove/` | `http://localhost:8000/property/api/prospect-favorite/remove/` | `https://wizerproperties.com/property/api/prospect-favorite/remove/` | `property:api:remove_prospect_favorite_property` | Remove from favorites (DELETE) | `src/property/api/views/property.py` (`ProspectFavoritePropertyViewSet`) |
| `/property/api/user-properties/<user_id>/` | `http://localhost:8000/property/api/user-properties/<user_id>/` | `https://wizerproperties.com/property/api/user-properties/<user_id>/` | `property:api:user_properties` | Get user's properties (GET) | `src/property/api/views/property.py` (`user_properties`) |
| `/property/api/analytics/top-ranked-properties/` | `http://localhost:8000/property/api/analytics/top-ranked-properties/` | `https://wizerproperties.com/property/api/analytics/top-ranked-properties/` | `property:api:top_ranked_properties` | Get top ranked properties (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/maximum-viewing-time-properties/` | `http://localhost:8000/property/api/analytics/maximum-viewing-time-properties/` | `https://wizerproperties.com/property/api/analytics/maximum-viewing-time-properties/` | `property:api:maximum_viewing_time_properties` | Get properties with max viewing time (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/highest-search-appearances-properties/` | `http://localhost:8000/property/api/analytics/highest-search-appearances-properties/` | `https://wizerproperties.com/property/api/analytics/highest-search-appearances-properties/` | `property:api:highest_search_appearances_properties` | Get properties with most search appearances (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/popular-search-location-properties/` | `http://localhost:8000/property/api/analytics/popular-search-location-properties/` | `https://wizerproperties.com/property/api/analytics/popular-search-location-properties/` | `property:api:popular_search_location_properties` | Get popular search locations (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/user-properties-locations/` | `http://localhost:8000/property/api/analytics/user-properties-locations/` | `https://wizerproperties.com/property/api/analytics/user-properties-locations/` | `property:api:user_properties_locations` | Get user property locations (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/user-gender-ratio/` | `http://localhost:8000/property/api/analytics/user-gender-ratio/` | `https://wizerproperties.com/property/api/analytics/user-gender-ratio/` | `property:api:user_gender_ratio` | Get user gender ratio analytics (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/most-in-demand-price-range/` | `http://localhost:8000/property/api/analytics/most-in-demand-price-range/` | `https://wizerproperties.com/property/api/analytics/most-in-demand-price-range/` | `property:api:most_in_demand_price_range` | Get most in-demand price range (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/top-performing-properties-by-conversion/` | `http://localhost:8000/property/api/analytics/top-performing-properties-by-conversion/` | `https://wizerproperties.com/property/api/analytics/top-performing-properties-by-conversion/` | `property:api:top_performing_properties_by_conversion` | Get top performing properties by conversion (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/top-rated-buildings/` | `http://localhost:8000/property/api/analytics/top-rated-buildings/` | `https://wizerproperties.com/property/api/analytics/top-rated-buildings/` | `property:api:top_rated_buildings` | Get top rated buildings (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/most-favorite-properties/` | `http://localhost:8000/property/api/analytics/most-favorite-properties/` | `https://wizerproperties.com/property/api/analytics/most-favorite-properties/` | `property:api:most_favorite_properties` | Get most favorited properties (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/analytics/most-appeared-on-the-compare-list/` | `http://localhost:8000/property/api/analytics/most-appeared-on-the-compare-list/` | `https://wizerproperties.com/property/api/analytics/most-appeared-on-the-compare-list/` | `property:api:most_appeared_on_the_compare_list` | Get properties most compared (GET) | `src/property/api/views/property.py` (`PropertiesAnalyticsView`) |
| `/property/api/visit-analytics/` | `http://localhost:8000/property/api/visit-analytics/` | `https://wizerproperties.com/property/api/visit-analytics/` | `property:api:visit-analytics` | Property visit analytics (GET) | `src/property/api/views/property.py` (`PropertyVisitAnalytics`) |

### Building API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/building/api/list/` | `http://localhost:8000/building/api/list/` | `https://wizerproperties.com/building/api/list/` | `building:api:list` | List all buildings (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/` | `http://localhost:8000/building/api/details/<pk>/` | `https://wizerproperties.com/building/api/details/<pk>/` | `building:api:details` | Get building details (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/media-files/` | `http://localhost:8000/building/api/details/<pk>/media-files/` | `https://wizerproperties.com/building/api/details/<pk>/media-files/` | `building:api:media_files` | Get building media files (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/developer-info/` | `http://localhost:8000/building/api/details/<pk>/developer-info/` | `https://wizerproperties.com/building/api/details/<pk>/developer-info/` | `building:api:developer_info` | Get developer information (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/information/` | `http://localhost:8000/building/api/details/<pk>/information/` | `https://wizerproperties.com/building/api/details/<pk>/information/` | `building:api:building_info` | Get building information (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/available-facilities/` | `http://localhost:8000/building/api/details/<pk>/available-facilities/` | `https://wizerproperties.com/building/api/details/<pk>/available-facilities/` | `building:api:available_facilities` | Get available facilities (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/available-units/` | `http://localhost:8000/building/api/details/<pk>/available-units/` | `https://wizerproperties.com/building/api/details/<pk>/available-units/` | `building:api:available_units` | Get available units (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/details/<pk>/schedule/` | `http://localhost:8000/building/api/details/<pk>/schedule/` | `https://wizerproperties.com/building/api/details/<pk>/schedule/` | `building:api:schedule` | Get building schedule info (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/create/` | `http://localhost:8000/building/api/create/` | `https://wizerproperties.com/building/api/create/` | `building:api:create` | Create building (POST) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/generate-description/` | `http://localhost:8000/building/api/generate-description/` | `https://wizerproperties.com/building/api/generate-description/` | `building:api:generate_description` | Generate AI building description (POST) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/re-generate-description/` | `http://localhost:8000/building/api/re-generate-description/` | `https://wizerproperties.com/building/api/re-generate-description/` | `building:api:re_generate_description` | Regenerate AI building description (POST) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/update/<pk>/` | `http://localhost:8000/building/api/update/<pk>/` | `https://wizerproperties.com/building/api/update/<pk>/` | `building:api:update` | Update building (PUT/PATCH) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/delete/<pk>/` | `http://localhost:8000/building/api/delete/<pk>/` | `https://wizerproperties.com/building/api/delete/<pk>/` | `building:api:delete` | Delete building (DELETE) | `src/building/api/views/building.py` (`BuildingViewSet`) |
| `/building/api/review/list/` | `http://localhost:8000/building/api/review/list/` | `https://wizerproperties.com/building/api/review/list/` | `building:api:review_list` | Get building reviews (GET) | `src/building/api/views/building.py` (`BuildingReviewViewSet`) |
| `/building/api/review/create/` | `http://localhost:8000/building/api/review/create/` | `https://wizerproperties.com/building/api/review/create/` | `building:api:review_create` | Create building review (POST) | `src/building/api/views/building.py` (`BuildingReviewViewSet`) |
| `/building/api/building_list_for_map_search/` | `http://localhost:8000/building/api/building_list_for_map_search/` | `https://wizerproperties.com/building/api/building_list_for_map_search/` | `building:api:building_list_for_map_search` | Get buildings for map search (GET) | `src/building/api/views/building.py` (`BuildingViewSet`) |

### Blog API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/blogs/api/posts/` | `http://localhost:8000/blogs/api/posts/` | `https://wizerproperties.com/blogs/api/posts/` | `blogs:api:post-list` | List blog posts (GET) | `src/blog/api/views.py` (`PostListView`) |
| `/blogs/api/posts/related-posts/` | `http://localhost:8000/blogs/api/posts/related-posts/` | `https://wizerproperties.com/blogs/api/posts/related-posts/` | `blogs:api:related-post-list` | Get related blog posts (GET) | `src/blog/api/views.py` (`RelatedPostListView`) |
| `/blogs/api/posts/post-like-dislike/` | `http://localhost:8000/blogs/api/posts/post-like-dislike/` | `https://wizerproperties.com/blogs/api/posts/post-like-dislike/` | `blogs:api:post-like-dislike` | Like/dislike blog post (POST) | `src/blog/api/views.py` (`PostLikeDislikeView`) |
| `/blogs/api/posts/save-read-time/` | `http://localhost:8000/blogs/api/posts/save-read-time/` | `https://wizerproperties.com/blogs/api/posts/save-read-time/` | `blogs:api:save-read-time` | Save blog post read time (POST) | `src/blog/api/views.py` (`SaveReadTimeView`) |
| `/blogs/api/advertisement/` | `http://localhost:8000/blogs/api/advertisement/` | `https://wizerproperties.com/blogs/api/advertisement/` | `blogs:api:blog-advertisement` | Get blog advertisements (GET) | `src/blog/api/views.py` (`BlogAdvertisementView`) |

### Advertisement API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/advertise/api/reel/` | `http://localhost:8000/advertise/api/reel/` | `https://wizerproperties.com/advertise/api/reel/` | `advertise:api:reel-list` | List user's reels (GET) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/<pk>/` | `http://localhost:8000/advertise/api/reel/<pk>/` | `https://wizerproperties.com/advertise/api/reel/<pk>/` | `advertise:api:reel-detail` | Get reel details (GET) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/` | `http://localhost:8000/advertise/api/reel/` | `https://wizerproperties.com/advertise/api/reel/` | `advertise:api:reel-create` | Create reel (POST) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/<pk>/` | `http://localhost:8000/advertise/api/reel/<pk>/` | `https://wizerproperties.com/advertise/api/reel/<pk>/` | `advertise:api:reel-update` | Update reel (PUT/PATCH) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/<pk>/` | `http://localhost:8000/advertise/api/reel/<pk>/` | `https://wizerproperties.com/advertise/api/reel/<pk>/` | `advertise:api:reel-delete` | Delete reel (DELETE) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/active/` | `http://localhost:8000/advertise/api/reel/active/` | `https://wizerproperties.com/advertise/api/reel/active/` | `advertise:api:reel-active` | Get active reels (GET) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/reel/suggested/` | `http://localhost:8000/advertise/api/reel/suggested/` | `https://wizerproperties.com/advertise/api/reel/suggested/` | `advertise:api:reel-suggested` | Get suggested reels based on user preferences (GET) | `src/advertise/api/views/default.py` (`ReelViewSet`) |
| `/advertise/api/advertisement/` | `http://localhost:8000/advertise/api/advertisement/` | `https://wizerproperties.com/advertise/api/advertisement/` | `advertise:api:advertisement-list` | List advertisements (GET) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |
| `/advertise/api/advertisement/<pk>/` | `http://localhost:8000/advertise/api/advertisement/<pk>/` | `https://wizerproperties.com/advertise/api/advertisement/<pk>/` | `advertise:api:advertisement-detail` | Get advertisement details (GET) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |
| `/advertise/api/advertisement/<pk>/manage-view-time/` | `http://localhost:8000/advertise/api/advertisement/<pk>/manage-view-time/` | `https://wizerproperties.com/advertise/api/advertisement/<pk>/manage-view-time/` | `advertise:api:advertisement-manage-view-time` | Track advertisement view time (PATCH) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |
| `/advertise/api/advertisement/<pk>/analytics/` | `http://localhost:8000/advertise/api/advertisement/<pk>/analytics/` | `https://wizerproperties.com/advertise/api/advertisement/<pk>/analytics/` | `advertise:api:advertisement-analytics` | Get advertisement analytics (GET) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |
| `/advertise/api/advertisement/list/` | `http://localhost:8000/advertise/api/advertisement/list/` | `https://wizerproperties.com/advertise/api/advertisement/list/` | `advertise:api:advertisement-list` | Get user's advertisements list (GET) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |
| `/advertise/api/advertisement/suggested/` | `http://localhost:8000/advertise/api/advertisement/suggested/` | `https://wizerproperties.com/advertise/api/advertisement/suggested/` | `advertise:api:advertisement-suggested` | Get suggested advertisements (GET) | `src/advertise/api/views/advertisement.py` (`AdvertisementViewSet`) |

### Schedule API

| URL | Localhost | Production | Name | Purpose | View File |
|-----|----------|-----------|------|---------|-----------|
| `/schedule/api/` | `http://localhost:8000/schedule/api/` | `https://wizerproperties.com/schedule/api/` | `schedule:api:schedules-list` | List visiting schedules (GET) - filtered by user type | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |
| `/schedule/api/<pk>/` | `http://localhost:8000/schedule/api/<pk>/` | `https://wizerproperties.com/schedule/api/<pk>/` | `schedule:api:schedules-detail` | Get schedule details (GET) | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |
| `/schedule/api/` | `http://localhost:8000/schedule/api/` | `https://wizerproperties.com/schedule/api/` | `schedule:api:schedules-create` | Create visiting schedule (POST) - syncs to Zoho CRM | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |
| `/schedule/api/<pk>/` | `http://localhost:8000/schedule/api/<pk>/` | `https://wizerproperties.com/schedule/api/<pk>/` | `schedule:api:schedules-update` | Update schedule (PATCH) | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |
| `/schedule/api/<pk>/accept/` | `http://localhost:8000/schedule/api/<pk>/accept/` | `https://wizerproperties.com/schedule/api/<pk>/accept/` | `schedule:api:schedules-accept` | Accept a pending schedule (PATCH) | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |
| `/schedule/api/<pk>/cancel/` | `http://localhost:8000/schedule/api/<pk>/cancel/` | `https://wizerproperties.com/schedule/api/<pk>/cancel/` | `schedule:api:schedules-cancel` | Cancel a pending schedule (PATCH) | `src/schedule/api/views.py` (`VisitingScheduleViewSet`) |

---

## External Links & Third-Party Services

### Analytics & Tracking
- **Google Analytics 4**: Integrated via `GA4_MEASUREMENT_ID` in templates
- **Meta Pixel**: Integrated via `META_PIXEL_ID` in templates
- **PostHog**: Integrated via `POSTHOG_API_KEY` and `POSTHOG_HOST` in templates
- **Zoho SalesIQ**: Chat widget integration

### CDN & External Resources
- **TimeMe.js**: Time tracking library (`https://cdn.jsdelivr.net/npm/timeme.js@2.2.5/timeme.min.js`)
- **Bootstrap Icons**: Icon library (`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css`)
- **Google Fonts**: Font loading via preconnect

### Social Authentication
- **Google OAuth**: `/accounts/google/login/` and `/accounts/google/login/callback/`

---

## URL Configuration Files

| File | Purpose |
|------|---------|
| `src/wizerproperties/urls.py` | Main URL configuration - includes all app URLs |
| `src/core/urls.py` | Core app URLs (API routes) |
| `src/user/urls.py` | User authentication and profile URLs |
| `src/property/urls.py` | Property management URLs |
| `src/building/urls.py` | Building management URLs |
| `src/blog/urls.py` | Blog URLs |
| `src/advertise/urls.py` | Advertisement URLs |
| `src/schedule/urls.py` | Schedule URLs |
| `src/core/api/urls.py` | Core API URLs |
| `src/user/api/urls.py` | User API URLs |
| `src/property/api/urls.py` | Property API URLs |
| `src/building/api/urls.py` | Building API URLs |
| `src/blog/api/urls.py` | Blog API URLs |
| `src/advertise/api/urls.py` | Advertisement API URLs (uses DRF router) |
| `src/schedule/api/urls.py` | Schedule API URLs (uses DRF router) |

---

## Notes

1. **Authentication Requirements**: Many routes require user authentication (`@login_required` decorator)
2. **User Type Restrictions**: Some routes are restricted to specific user types (developer, agent, prospect)
3. **Legacy URLs**: Some URLs have legacy aliases for backward compatibility
4. **API Endpoints**: Most API endpoints use Django REST Framework ViewSets
5. **URL Names**: All URLs have named patterns for easy reference in templates using `{% url %}` tag

---

## Template URL Usage

In templates, URLs are referenced using Django's `{% url %}` tag:

```django
{% url 'home' %}
{% url 'property:search' %}
{% url 'user:signup' %}
{% url 'property:get' id=property.id %}
```

---

---

## Additional Notes

### URL Parameters & Query Strings

Many endpoints accept query parameters:

- **Property Search**: `/property/search/` accepts filters like `?min_price=`, `?max_price=`, `?building__type=`, etc.
- **Advertisement Tracking**: Property/building detail pages accept `?ad_id=` to track advertisement clicks
- **Discount/Featured Tracking**: Property detail pages accept `?discounted=True` or `?featured=True` to track promotion clicks
- **Blog Posts**: Use slug-based URLs: `/blogs/<slug>/`

### Authentication & Permissions

- **Public Routes**: Homepage, property search, property details, blog posts
- **Authenticated Routes**: Dashboard, profile settings, create/update operations
- **User Type Specific**:
  - **Developer/Agent**: Building/property management, advertisements, analytics
  - **Prospect**: Favorites, comparisons, schedules

### Third-Party Integrations

- **Zoho CRM**: Schedule creation automatically syncs to Zoho CRM
- **Google OAuth**: Social authentication
- **Analytics**: GA4, Meta Pixel, PostHog tracking

---

**Documentation Generated:** 2025-01-27  
**Total Routes Documented:** 100+  
**Total API Endpoints:** 60+  
**URL Configuration Files:** 15

