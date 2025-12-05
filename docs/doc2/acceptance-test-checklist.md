# Acceptance Test Checklist
## Wizer Properties Platform - Quality Assurance & Testing

**Version**: 1.0  
**Date**: January 2025  
**Purpose**: Comprehensive acceptance testing checklist covering code quality, security, performance, accessibility, functionality, and compliance with contract deliverables.

---

## Table of Contents

1. [Code Quality & Standards](#1-code-quality--standards)
2. [Security Review](#2-security-review)
3. [Performance Testing](#3-performance-testing)
4. [Accessibility Testing](#4-accessibility-testing)
5. [Functional Testing by Module](#5-functional-testing-by-module)
6. [API Testing](#6-api-testing)
7. [Integration Testing](#7-integration-testing)
8. [Browser Compatibility](#8-browser-compatibility)
9. [Mobile Responsiveness](#9-mobile-responsiveness)
10. [SEO & Analytics Verification](#10-seo--analytics-verification)
11. [CRM Integration Testing](#11-crm-integration-testing)
12. [User Flows & E2E Testing](#12-user-flows--e2e-testing)

---

## 1. Code Quality & Standards

### 1.1 Python Code Quality
- [ ] All Python files follow PEP 8 style guidelines
- [ ] No syntax errors or import errors in any Python files
- [ ] All Django models have proper field validation
- [ ] Proper use of Django best practices (models, views, forms)
- [ ] No hardcoded credentials or sensitive data in code
- [ ] Proper error handling with try/except blocks
- [ ] All database queries use ORM (no raw SQL vulnerabilities)
- [ ] Proper use of Django's security features (CSRF, XSS protection)
- [ ] All view functions have appropriate decorators (@login_required, permissions)
- [ ] Code is properly commented and documented

### 1.2 JavaScript Code Quality
- [ ] No console errors in browser console
- [ ] Modern ES6+ syntax used consistently
- [ ] Proper error handling in all async operations
- [ ] No memory leaks (event listeners properly cleaned up)
- [ ] Code is modular and reusable
- [ ] Proper use of fetch API (no deprecated jQuery AJAX)
- [ ] All API calls handle errors gracefully
- [ ] Loading states implemented for async operations
- [ ] Proper validation on client-side forms

### 1.3 HTML/Template Quality
- [ ] Valid HTML5 markup (no unclosed tags)
- [ ] Semantic HTML elements used appropriately
- [ ] All templates extend base.html correctly
- [ ] No inline styles (use Tailwind classes)
- [ ] Proper use of Django template tags
- [ ] All images have alt attributes
- [ ] All links have proper href attributes
- [ ] Forms have proper CSRF tokens

### 1.4 CSS/Styling Quality
- [ ] All styling uses Tailwind CSS utilities
- [ ] No legacy Bootstrap classes remain
- [ ] Consistent spacing and typography
- [ ] Design tokens properly implemented
- [ ] Responsive breakpoints used correctly
- [ ] No conflicting styles

### 1.5 Code Documentation
- [ ] README.md updated with setup instructions
- [ ] All major functions have docstrings
- [ ] Complex logic has inline comments
- [ ] API endpoints documented
- [ ] Configuration files documented

---

## 2. Security Review

### 2.1 Authentication & Authorization
- [ ] User authentication works correctly (login/logout)
- [ ] Password reset functionality secure
- [ ] Email verification prevents unauthorized access
- [ ] Profile completion middleware works correctly
- [ ] OAuth2 (Google login) integration secure
- [ ] Session management secure (CSRF tokens)
- [ ] Permission checks on all protected routes
- [ ] Users can only access their own data
- [ ] Admin routes properly protected

### 2.2 Input Validation & Sanitization
- [ ] All form inputs validated server-side
- [ ] XSS protection on all user inputs
- [ ] SQL injection prevention (ORM usage)
- [ ] File upload validation (type, size)
- [ ] Email validation on all email fields
- [ ] Phone number validation
- [ ] URL validation on external links
- [ ] Rich text editor (CKEditor) properly sanitized

### 2.3 Data Protection
- [ ] Sensitive data not exposed in URLs
- [ ] Passwords properly hashed (Django's password hashers)
- [ ] API keys stored in environment variables
- [ ] Database credentials not in code
- [ ] Media files access controlled
- [ ] User data privacy respected

### 2.4 API Security
- [ ] API endpoints require authentication where needed
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] API responses don't expose sensitive data
- [ ] Proper HTTP status codes returned

### 2.5 Third-Party Integration Security
- [ ] Zoho CRM credentials secured
- [ ] Google OAuth credentials secured
- [ ] OpenAI API key secured
- [ ] All third-party scripts load from trusted sources
- [ ] SalesIQ widget code secure

---

## 3. Performance Testing

### 3.1 Page Load Performance
- [ ] Homepage loads in < 3 seconds
- [ ] Property listing pages load in < 3 seconds
- [ ] Property detail pages load in < 4 seconds
- [ ] Image lazy loading implemented
- [ ] JavaScript files minified in production
- [ ] CSS files minified in production
- [ ] Proper caching headers set

### 3.2 Core Web Vitals
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Time to Interactive (TTI) < 3.8s

### 3.3 Database Performance
- [ ] Database queries optimized (use select_related/prefetch_related)
- [ ] No N+1 query problems
- [ ] Database indexes on foreign keys
- [ ] Pagination implemented on list views
- [ ] Efficient filtering on search pages

### 3.4 API Performance
- [ ] API response times < 500ms
- [ ] Proper pagination on API endpoints
- [ ] Efficient serialization
- [ ] No unnecessary data in responses

### 3.5 Frontend Performance
- [ ] Infinite scroll works smoothly
- [ ] Image optimization (proper formats, sizes)
- [ ] Splide carousels load efficiently
- [ ] No blocking JavaScript
- [ ] Proper use of async/defer on scripts

---

## 4. Accessibility Testing

### 4.1 ARIA Attributes
- [ ] All interactive elements have ARIA labels
- [ ] Form inputs have aria-required where needed
- [ ] Error messages have aria-live regions
- [ ] Modal dialogs have proper ARIA roles
- [ ] Navigation landmarks defined
- [ ] Loading states announced to screen readers

### 4.2 Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical and intuitive
- [ ] Focus indicators visible
- [ ] Escape key closes modals
- [ ] Enter key submits forms
- [ ] Keyboard shortcuts work (if implemented)

### 4.3 Screen Reader Compatibility
- [ ] All images have descriptive alt text
- [ ] Form labels properly associated
- [ ] Error messages read aloud
- [ ] Status changes announced
- [ ] Decorative elements hidden from screen readers

### 4.4 WCAG 2.1 Compliance
- [ ] Color contrast ratios meet WCAG AA standards
- [ ] Text resizable up to 200% without breaking layout
- [ ] No content flashes (flash threshold < 3 per second)
- [ ] Error identification and suggestions provided
- [ ] Form validation messages clear and helpful

### 4.5 Semantic HTML
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Lists use proper list elements
- [ ] Forms use proper form elements
- [ ] Buttons vs links used correctly
- [ ] Tables have proper headers

---

## 5. Functional Testing by Module

### 5.1 Core Pages

#### Home Page (`/`)
- [ ] Hero section displays correctly
- [ ] Search functionality works
- [ ] Property type filters work
- [ ] Trust badges display
- [ ] Featured sections render
- [ ] Splide carousels function
- [ ] Links navigate correctly
- [ ] CTAs work
- [ ] Analytics tracking fires

#### About Us (`/about-us/`)
- [ ] Page loads correctly
- [ ] All sections display
- [ ] Images load
- [ ] Links work
- [ ] Meta tags present

#### Contact Us (`/contact/`)
- [ ] Contact form displays
- [ ] Form validation works
- [ ] Form submission succeeds
- [ ] Success message shows
- [ ] Error handling works
- [ ] Zoho CRM sync works (if enabled)
- [ ] Email sent confirmation

#### Privacy Policy (`/privacy/`)
- [ ] Page loads
- [ ] Content displays correctly
- [ ] Meta tags include noindex

#### 404 Error Page (`/404/`)
- [ ] Custom 404 displays for invalid URLs
- [ ] Navigation options work
- [ ] Helpful error message shown

### 5.2 User Authentication Module

#### Signup (`/user/get-started/`)
- [ ] Signup form displays
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] User type selection works
- [ ] Form submission creates user
- [ ] Email verification sent
- [ ] Redirects to email verification page
- [ ] Google OAuth signup works

#### Login (`/user/login/`)
- [ ] Login form displays
- [ ] Valid credentials log in user
- [ ] Invalid credentials show error
- [ ] Remember me functionality (if implemented)
- [ ] Redirects to dashboard after login
- [ ] Google OAuth login works
- [ ] PostHog login tracking fires

#### Email Verification (`/user/email-verify/`)
- [ ] Verification page displays
- [ ] Verification link works
- [ ] Invalid token shows error
- [ ] Resend email works
- [ ] Redirects after verification

#### Profile Completion (`/user/complete-profile/`)
- [ ] Profile form displays based on user type
- [ ] Required fields validated
- [ ] Google Maps autocomplete works (address)
- [ ] Form submission updates profile
- [ ] Redirects to dashboard after completion
- [ ] Middleware enforces completion

#### Profile Settings (`/user/profile-settings/`)
- [ ] Settings page loads
- [ ] Form pre-populated with user data
- [ ] Updates save correctly
- [ ] Password change works
- [ ] Email change works (if allowed)
- [ ] Image uploads work

#### Forgot Password (`/user/forgot-password/`)
- [ ] Form displays
- [ ] Email validation works
- [ ] Reset email sent
- [ ] Reset link works
- [ ] New password can be set
- [ ] Success message shows

#### Logout
- [ ] Logout button works
- [ ] Session cleared
- [ ] Redirects to login
- [ ] PostHog user reset fires

### 5.3 Property Module

#### Property List (Developer/Agent) (`/property/list/<id>/`)
- [ ] Properties list displays
- [ ] Infinite scroll works
- [ ] Property cards render correctly
- [ ] Filters work (if implemented)
- [ ] Empty state shows when no properties
- [ ] Edit/Delete buttons work (if user owns)
- [ ] Analytics tracking fires

#### Create Property (`/property/create/`)
- [ ] Form displays all fields
- [ ] Building selection works
- [ ] Form validation works
- [ ] Image uploads work
- [ ] Multiple images can be uploaded
- [ ] Video uploads work
- [ ] AI description generation works (if enabled)
- [ ] Form submission creates property
- [ ] Redirects after creation
- [ ] Success message shows

#### Update Property (`/property/update/<id>/`)
- [ ] Form pre-populated with existing data
- [ ] Updates save correctly
- [ ] Image deletion works
- [ ] New images can be added
- [ ] All fields update correctly
- [ ] Redirects after update

#### Property Detail (`/property/details/<id>/`)
- [ ] Property details display correctly
- [ ] Gallery carousel works (Splide)
- [ ] Video playback works
- [ ] All property information shows
- [ ] Building information displays
- [ ] Developer/Agent info shows
- [ ] Map displays (if implemented)
- [ ] Reviews section works
- [ ] Favorite button works
- [ ] Compare button works
- [ ] Schedule viewing button works
- [ ] Share functionality works
- [ ] Analytics tracking fires
- [ ] SEO meta tags present

#### Property Search (`/property/search/`)
- [ ] Search page loads
- [ ] Filters panel works
- [ ] Search results display
- [ ] Infinite scroll works
- [ ] Property cards render
- [ ] Sort functionality works
- [ ] View toggle (list/map) works
- [ ] Filter chips work
- [ ] Clear filters works
- [ ] Search analytics tracking fires

#### Property Search with Map (`/property/search-with-map/`)
- [ ] Map view loads
- [ ] Properties display on map
- [ ] Map markers clickable
- [ ] List view toggle works
- [ ] Map interactions work

#### Comparison (`/property/comparison/`)
- [ ] Comparison page loads
- [ ] Multiple properties display side-by-side
- [ ] Add to comparison works
- [ ] Remove from comparison works
- [ ] Carousel navigation works
- [ ] Empty state shows
- [ ] Analytics tracking fires

#### Favorites (`/property/favorite-list/`)
- [ ] Favorites page loads
- [ ] Favorite properties display
- [ ] Remove from favorites works
- [ ] Empty state shows when no favorites
- [ ] Count updates correctly
- [ ] Analytics tracking fires

#### Discount/Featured Property Management
- [ ] Create discount property works
- [ ] Create featured property works
- [ ] Edit discount/featured works
- [ ] Delete discount/featured works
- [ ] List pages display correctly
- [ ] Credit balance displays
- [ ] Payment flow works (if implemented)

### 5.4 Building Module

#### Create Building (`/building/create/`)
- [ ] Form displays all fields
- [ ] Form validation works
- [ ] Image uploads work
- [ ] Facility view upload works
- [ ] Location view upload works
- [ ] AI description generation works
- [ ] Form submission creates building
- [ ] Redirects after creation

#### Update Building (`/building/update/<id>/`)
- [ ] Form pre-populated
- [ ] Updates save correctly
- [ ] Image management works
- [ ] All fields update

#### Building Detail (`/building/details/<id>/`)
- [ ] Building details display
- [ ] Gallery carousel works
- [ ] Amenities display
- [ ] Units list displays
- [ ] Lazy loading works
- [ ] Reviews section works
- [ ] Map displays
- [ ] Schedule viewing works
- [ ] SEO meta tags present

### 5.5 Schedule Module

#### Create Schedule (`/schedule/create_schedule/`)
- [ ] Schedule form displays
- [ ] Property/Building selection works
- [ ] Date/time picker works
- [ ] Form validation works
- [ ] Submission creates schedule
- [ ] Zoho CRM sync works (if enabled)
- [ ] Success message shows
- [ ] Email notification sent

#### Schedule Management (via Dashboard)
- [ ] Schedules list in dashboard
- [ ] Status updates work
- [ ] Schedule details view works
- [ ] Edit schedule works
- [ ] Cancel schedule works
- [ ] Email notifications sent

### 5.6 Blog Module

#### Blog List (`/blogs/`)
- [ ] Blog list displays
- [ ] Posts render correctly
- [ ] Filters work
- [ ] Pagination/load more works
- [ ] Featured posts display
- [ ] Categories filter works
- [ ] SEO meta tags present

#### Blog Detail (`/blogs/<slug>/`)
- [ ] Blog post displays
- [ ] Content renders correctly
- [ ] Author info shows
- [ ] Related posts display
- [ ] Like/dislike buttons work
- [ ] Share buttons work
- [ ] Read time displays
- [ ] SEO meta tags present
- [ ] Schema markup present

### 5.7 Advertise Module

#### Reels List (`/reels/`)
- [ ] Reels page loads
- [ ] Reels display in carousel
- [ ] Filters work
- [ ] Platform filters work
- [ ] Empty state shows

#### Create/Edit Reels (`/advertise/create-reels/`, `/advertise/edit-reels/<id>/`)
- [ ] Form displays
- [ ] Property/Building selection works
- [ ] Media upload works
- [ ] Form validation works
- [ ] Submission works
- [ ] Redirects after save

#### Analytics (`/advertise/analytics/`)
- [ ] Analytics page loads
- [ ] Charts display
- [ ] Filters work
- [ ] Data tables load
- [ ] Export works (if implemented)

#### Performance (`/advertise/performance/`)
- [ ] Performance page loads
- [ ] Campaign list displays
- [ ] Metrics show correctly
- [ ] Search/filter works
- [ ] Modals work

### 5.8 Dashboard Module

#### Developer/Agent Dashboard (`/dashboard/`)
- [ ] Dashboard loads for developers/agents
- [ ] Statistics cards display
- [ ] Property count correct
- [ ] Building count correct
- [ ] Schedule count correct
- [ ] Tables display
- [ ] Toggle switches work
- [ ] Quick actions work
- [ ] Data accurate

#### Prospect Dashboard (`/dashboard/`)
- [ ] Dashboard loads for prospects
- [ ] Statistics display
- [ ] Favorite count correct
- [ ] Comparison count correct
- [ ] Schedule list displays
- [ ] Quick actions work
- [ ] Property recommendations show

### 5.9 Home Helper AI (`/chat/`)
- [ ] Chat interface loads
- [ ] Message input works
- [ ] Messages send successfully
- [ ] AI responses display
- [ ] Quick prompts work
- [ ] Conversation history loads
- [ ] Keyboard shortcuts work (Enter, Shift+Enter)
- [ ] Error handling works
- [ ] Loading states show

---

## 6. API Testing

### 6.1 Property API (`/property/api/`)
- [ ] List properties endpoint works
- [ ] Property detail endpoint works
- [ ] Property search endpoint works
- [ ] Filter parameters work
- [ ] Pagination works
- [ ] Sorting works
- [ ] Nearby properties endpoint works
- [ ] Media files endpoint works
- [ ] Compare property endpoints work
- [ ] Favorite property endpoints work
- [ ] View time tracking works
- [ ] Analytics endpoints work

### 6.2 Building API (`/building/api/`)
- [ ] List buildings endpoint works
- [ ] Building detail endpoint works
- [ ] Available units endpoint works
- [ ] Media files endpoint works
- [ ] Reviews endpoint works

### 6.3 User API (`/user/api/`)
- [ ] Create developer profile works
- [ ] Create agent profile works
- [ ] Create prospect profile works
- [ ] Update profile endpoints work
- [ ] Authentication works

### 6.4 Schedule API (`/schedule/api/`)
- [ ] Create schedule endpoint works
- [ ] List schedules endpoint works
- [ ] Update schedule endpoint works
- [ ] Delete schedule endpoint works
- [ ] Zoho CRM sync works

### 6.5 Contact API (`/core/api/contact/`)
- [ ] Contact form submission works
- [ ] Zoho CRM lead creation works
- [ ] Email notification sent
- [ ] Error handling works

### 6.6 Advertise API (`/advertise/api/`)
- [ ] Create reel endpoint works
- [ ] List reels endpoint works
- [ ] Analytics endpoints work
- [ ] Performance endpoints work

### 6.7 Blog API (`/blogs/api/`)
- [ ] List posts endpoint works
- [ ] Post detail endpoint works
- [ ] Like/dislike endpoints work
- [ ] Filters work

### 6.8 API Response Format
- [ ] All API responses in JSON format
- [ ] Proper HTTP status codes returned
- [ ] Error messages clear and helpful
- [ ] Response structure consistent
- [ ] Pagination metadata included

### 6.9 API Authentication
- [ ] Protected endpoints require authentication
- [ ] Token-based auth works
- [ ] Permission checks work
- [ ] Unauthorized access blocked

---

## 7. Integration Testing

### 7.1 Third-Party Integrations

#### Google OAuth
- [ ] Google login works
- [ ] Callback handles response
- [ ] User created/updated correctly
- [ ] Session established

#### Google Maps
- [ ] Maps display correctly
- [ ] Autocomplete works in forms
- [ ] Location selection works
- [ ] Markers display correctly

#### Zoho CRM
- [ ] CRM sync enabled/disabled correctly
- [ ] Contact form creates lead
- [ ] Schedule creates contact and deal
- [ ] Duplicate handling works
- [ ] Error logging works
- [ ] Token refresh works

#### Zoho SalesIQ
- [ ] Widget loads on all pages
- [ ] Chat interface functional
- [ ] Visitor tracking works

#### Analytics Integrations
- [ ] GA4 events fire correctly
- [ ] Meta Pixel events fire correctly
- [ ] PostHog events fire correctly
- [ ] User identification works
- [ ] Ecommerce tracking works

#### OpenAI Integration
- [ ] AI description generation works
- [ ] Chat responses work
- [ ] Error handling works
- [ ] API key secured

### 7.2 Email Integration
- [ ] Email verification emails sent
- [ ] Password reset emails sent
- [ ] Schedule confirmation emails sent
- [ ] Contact form emails sent
- [ ] Email templates render correctly
- [ ] Email links work

### 7.3 File Storage
- [ ] Image uploads work
- [ ] Video uploads work
- [ ] File validation works
- [ ] Files accessible via URLs
- [ ] File deletion works
- [ ] Storage limits enforced

---

## 8. Browser Compatibility

### 8.1 Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### 8.2 Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet

### 8.3 Feature Compatibility
- [ ] CSS Grid works
- [ ] Flexbox works
- [ ] ES6 JavaScript features work
- [ ] Fetch API works
- [ ] IntersectionObserver works
- [ ] LocalStorage works

---

## 9. Mobile Responsiveness

### 9.1 Breakpoints
- [ ] Mobile (< 640px) layout works
- [ ] Tablet (640px - 1024px) layout works
- [ ] Desktop (> 1024px) layout works
- [ ] Large screens (> 1280px) layout works

### 9.2 Mobile-Specific Features
- [ ] Touch interactions work
- [ ] Swipe gestures work (Splide)
- [ ] Mobile menu works
- [ ] Forms usable on mobile
- [ ] Buttons appropriately sized
- [ ] Text readable without zooming

### 9.3 Responsive Components
- [ ] Navigation responsive
- [ ] Forms responsive
- [ ] Tables responsive
- [ ] Cards stack correctly
- [ ] Images scale correctly
- [ ] Modals full-screen on mobile

---

## 10. SEO & Analytics Verification

### 10.1 Meta Tags
- [ ] Title tags present and unique
- [ ] Meta descriptions present
- [ ] Meta keywords present (where needed)
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Canonical URLs set
- [ ] Robots meta tags correct

### 10.2 Structured Data (JSON-LD)
- [ ] Organization schema on home page
- [ ] Product schema on property pages
- [ ] Place schema on building pages
- [ ] Article schema on blog posts
- [ ] Breadcrumb schema on detail pages
- [ ] Schema validation passes (Google Rich Results Test)

### 10.3 SEO Infrastructure
- [ ] Sitemap.xml accessible (`/sitemap.xml`)
- [ ] Sitemap includes all pages
- [ ] Robots.txt accessible (`/robots.txt`)
- [ ] Robots.txt correctly configured
- [ ] Proper noindex tags on user/admin pages

### 10.4 Analytics Implementation
- [ ] GA4 tracking code present
- [ ] Meta Pixel code present
- [ ] PostHog code present
- [ ] Page view events fire
- [ ] Custom events fire correctly
- [ ] Ecommerce tracking works
- [ ] User identification works

### 10.5 URL Structure
- [ ] URLs SEO-friendly (no query strings where possible)
- [ ] Proper redirects (301/302)
- [ ] No broken links
- [ ] Proper use of trailing slashes

---

## 11. CRM Integration Testing

### 11.1 Zoho SalesIQ Widget
- [ ] Widget loads on all pages
- [ ] Chat interface functional
- [ ] Widget doesn't block content
- [ ] Widget responsive on mobile

### 11.2 Zoho CRM Sync

#### Contact Form Sync
- [ ] Lead created in Zoho CRM
- [ ] Duplicate handling works (adds note)
- [ ] Real estate fields mapped correctly
- [ ] Error logging works
- [ ] PostHog tracking fires

#### Schedule Sync
- [ ] Contact created/updated in Zoho CRM
- [ ] Deal created with property details
- [ ] Property fields mapped correctly
- [ ] Building information included
- [ ] Update sync works
- [ ] Error handling works

### 11.3 CRM Configuration
- [ ] Environment variables set correctly
- [ ] CRM can be enabled/disabled
- [ ] OAuth token refresh works
- [ ] API calls logged appropriately

---

## 12. User Flows & E2E Testing

### 12.1 Prospect User Flow
1. [ ] **Signup Flow**
   - Visit homepage
   - Click "Get Started"
   - Fill signup form
   - Verify email
   - Complete profile
   - Land on dashboard

2. [ ] **Property Discovery Flow**
   - Search for properties
   - Apply filters
   - View property details
   - Add to favorites
   - Add to comparison
   - Schedule viewing

3. [ ] **Purchase Journey**
   - Browse properties
   - Compare properties
   - Schedule multiple viewings
   - Contact developer/agent
   - Complete transaction (if applicable)

### 12.2 Developer/Agent User Flow
1. [ ] **Onboarding Flow**
   - Signup as developer/agent
   - Complete profile
   - Verify company details
   - Land on dashboard

2. [ ] **Property Management Flow**
   - Create building
   - Add properties to building
   - Upload media
   - Set pricing
   - Publish property

3. [ ] **Promotion Flow**
   - Create discount promotion
   - Create featured promotion
   - Monitor analytics
   - Manage credit balance

4. [ ] **Lead Management Flow**
   - View schedule requests
   - Accept/decline schedules
   - View property analytics
   - Manage reviews

### 12.3 Cross-Module Flows
- [ ] **Property → Schedule → CRM**
  - Prospect views property
  - Schedules viewing
  - Schedule syncs to CRM
  - Deal created in Zoho

- [ ] **Contact → CRM → Analytics**
  - Visitor fills contact form
  - Lead created in Zoho
  - Event tracked in analytics
  - Email notification sent

---

## 13. Error Handling & Edge Cases

### 13.1 Form Validation
- [ ] Required fields enforced
- [ ] Invalid email formats rejected
- [ ] Invalid phone formats rejected
- [ ] File size limits enforced
- [ ] File type restrictions enforced
- [ ] Character limits enforced

### 13.2 API Error Handling
- [ ] 404 errors handled gracefully
- [ ] 500 errors don't expose stack traces
- [ ] Network errors handled
- [ ] Timeout errors handled
- [ ] Invalid data rejected with clear messages

### 13.3 Edge Cases
- [ ] Empty states display correctly
- [ ] No search results handled
- [ ] Large datasets handled (pagination)
- [ ] Concurrent form submissions prevented
- [ ] Session expiration handled
- [ ] Browser back/forward buttons work

### 13.4 Data Integrity
- [ ] Orphaned records prevented
- [ ] Cascading deletes work correctly
- [ ] Foreign key constraints enforced
- [ ] Unique constraints enforced
- [ ] Data validation at model level

---

## 14. Documentation & Deliverables

### 14.1 Technical Documentation
- [ ] README.md complete and accurate
- [ ] Setup instructions clear
- [ ] Environment variables documented
- [ ] API documentation available
- [ ] Deployment guide available

### 14.2 User Documentation
- [ ] User guides available (if applicable)
- [ ] FAQ section (if applicable)
- [ ] Help text in forms
- [ ] Tooltips where needed

### 14.3 Code Documentation
- [ ] Inline code comments
- [ ] Function docstrings
- [ ] Complex logic explained
- [ ] Architecture documented

---

## 15. Performance Benchmarks

### 15.1 Page Load Targets
- [ ] Homepage: < 3 seconds
- [ ] Search pages: < 3 seconds
- [ ] Detail pages: < 4 seconds
- [ ] Dashboard: < 2 seconds
- [ ] Forms: < 2 seconds

### 15.2 API Response Targets
- [ ] List endpoints: < 500ms
- [ ] Detail endpoints: < 300ms
- [ ] Search endpoints: < 1 second
- [ ] File upload: < 5 seconds (depends on size)

### 15.3 Database Query Targets
- [ ] No queries > 1 second
- [ ] N+1 queries eliminated
- [ ] Proper indexing in place
- [ ] Query counts reasonable (< 50 per page load)

---

## Test Execution Checklist

### Pre-Testing
- [ ] Test environment set up
- [ ] Test data prepared
- [ ] Test accounts created (all user types)
- [ ] Browser/devices prepared
- [ ] Test plan reviewed

### During Testing
- [ ] Test cases executed systematically
- [ ] Issues logged with details
- [ ] Screenshots/videos captured for bugs
- [ ] Browser console checked for errors
- [ ] Network tab monitored

### Post-Testing
- [ ] Test results documented
- [ ] Bug reports created
- [ ] Critical issues prioritized
- [ ] Test summary prepared
- [ ] Sign-off obtained

---

## Sign-Off

**Tester Name**: _______________________  
**Date**: _______________________  
**Overall Status**: ☐ Pass ☐ Fail ☐ Conditional Pass  
**Notes**:  
_____________________________________________  
_____________________________________________  
_____________________________________________

**Client Approval**:  
**Name**: _______________________  
**Date**: _______________________  
**Signature**: _______________________

---

## Notes

- Mark each item as ☑ (Pass), ☐ (Fail), or ⚠ (Needs Attention)
- Attach screenshots/videos for failed items
- Document any blockers or dependencies
- Update this checklist as new issues are found
- Use conditional pass for non-critical issues with mitigation plans

