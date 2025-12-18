/// <reference types="datatables.net" />
/// <reference types="bootstrap-datepicker" />

// Global variables typically defined in Django templates or external scripts
declare var csrfToken: string;
declare var CSRF_TOKEN: string;
declare var dayjs: any;
declare var echarts: any;
declare var Splide: any;
declare var gtag: any;
declare var fbq: any;
declare var TimeMe: any;
declare var posthog: any;
declare var google: any;
declare var bootstrap: any;
declare var videojs: any;
declare var Cookies: any;
declare var Globalize: any;
declare var define: any;

// Project-specific globals (likely from Django templates)
declare var ADS_SUGGEST_URL: any;
declare var VISITE_ANALYTCS: any;
declare var USER_GENDER_RATIO: any;
declare var ADS_LIST: any;
declare var ADS_ANALYTICS: any;
declare var property_view_time_url: any;
declare var ADS_LOCATION_PARAM: any;
declare var REEL_ID: any;
declare var TOP_PERFORMING_PROPERTIES_BY_CONVERSION: any;
declare var MAXIMUM_VIEWING_TIME_PROPERTIES: any;
declare var POPULAR_SEARCH_LOCATION_PROPERTIES: any;
declare var HIGHEST_SEARCH_APPEARANCES_PROPERTIES: any;
declare var MOST_IN_DEMAND_PRICE_RANGE: any;
declare var TOP_RANKED_PROPERTIES: any;
declare var TOP_RATED_BUILDINGS: any;
declare var MOST_FAVORITE_PROPERTIES: any;
declare var MOST_APPEARED_ON_THE_COMPARE_LIST: any;
declare var user_first_name: any;
declare var user_last_name: any;
declare var login_url: any;
declare var DEVELOPER_CREATE_URL: any;
declare var AGENT_CREATE_URL: any;
declare var PROSPECT_CREATE_URL: any;
declare var forgot_password_url: any;
declare var forgot_password_verify_url: any;
declare var profileSettingsUrl: any;
declare var update_password_url: any;
declare var initialBlogFilters: any;
declare var buildingInformationURL: any;
declare var generateBuildingDescriptionAPIUrl: any;
declare var reGenerateBuildingDescriptionAPIUrl: any;
declare var createBuildingAPIUrl: any;
declare var residenceSubTypes: any;
declare var commercialSubTypes: any;
declare var GALLERY_API_URL: any;
declare var ASSET_API_URL: any;
declare var USER_ID: any;
declare var AVAILABLE_API_URL: any;
declare var BUILDING_ID: any;
declare var PROPERTY_ID: any;
declare var RELATED_BUILDING_ID: any;
declare var msg: any;
declare var user_type: any;
declare var formatBalance: any;
declare var PropertyCardFactory: any;
declare var MapManager: any;
declare var mapManager: any;
declare var ComparisonManager: any;
declare var PropertyCompareFavorite: any;
declare var updatePropertyAPIUrl: any;
declare var generatePropertyDescriptionAPIUrl: any;
declare var reGeneratePropertyDescriptionAPIUrl: any;
declare var createPropertyAPIUrl: any;
declare var propertyInformationURL: any;
declare var COMPARISON_API_URL: any;
declare var COMPARISON_REMOVE_API_URL: any;
declare var initPropertyFilters: any;
declare var filter_data: any;
declare var buildingGeocodeAddress: any;
declare var favorite_removable: any;
declare var updateBuildingAPIUrl: any;
declare var Analytics: any;
declare var jQuery: any;
declare var $: any;

// Suppress common property errors by making these more permissive
interface Element {
    [key: string]: any;
}

interface HTMLElement {
    [key: string]: any;
}

interface EventTarget {
    [key: string]: any;
}

interface Node {
    [key: string]: any;
}

interface ParentNode {
    [key: string]: any;
}

interface Event {
    [key: string]: any;
}

interface HTMLFormElement {
    [key: string]: any;
}

// Global functions (often defined in other JS files or templates)
declare function showModal(id?: any): void;
declare function hideModal(id?: any): void;

interface TagsInputOptions {
    tagClass?: string | ((item: any) => string);
    itemValue?: string | ((item: any) => any);
    itemText?: string | ((item: any) => string);
    confirmKeys?: number[];
    maxTags?: number;
    maxChars?: number;
    trimValue?: boolean;
    allowDuplicates?: boolean;
    freeInput?: boolean;
    typeahead?: any;
    onTagExists?: (item: any, $tag: JQuery) => void;
}

interface FlipperOptions {
    rotation?: string;
    duration?: number;
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
}

interface AnalyticsConfig {
    ga4Id: string | null;
    metaPixelId: string | null;
    posthogKey: string | null;
    posthogHost: string | null;
    enabled: boolean;
}

interface AnalyticsInterface {
    config: AnalyticsConfig;
    init(config: Partial<AnalyticsConfig>): void;
    initMetaPixel(): void;
    initPostHog(): void;
    track(eventName: string, properties?: Record<string, any>): void;
    trackPageView(path: string, title: string): void;
    mapToMetaEvent(eventName: string): string | null;
    trackPropertyView(propertyId: string | number, propertyData?: Record<string, any>): void;
    trackPropertyFavorite(propertyId: string | number, propertyData?: Record<string, any>, isFavorite?: boolean): void;
    trackPropertyCompare(propertyId: string | number, propertyData?: Record<string, any>, isAdded?: boolean): void;
    trackPropertyContact(propertyId: string | number, propertyData?: Record<string, any>, contactType?: string): void;
    trackSearch(searchTerm: string, filters?: Record<string, any>, resultCount?: number): void;
    trackSignup(userType?: string, method?: string): void;
    trackLogin(userType?: string, method?: string): void;
    trackFormSubmit(formName: string, formData?: Record<string, any>): void;
    trackVideoPlay(videoId: string | number, videoTitle?: string): void;
    setUserProperties(userId: string | number, properties?: Record<string, any>): void;
    resetUser(): void;
    trackCrmSync(eventType: string, entityType: string, entityId: string | number, success?: boolean): void;
}

// JQuery Plugins
interface JQuery {
    DataTable(options?: DataTables.Settings): DataTables.Api;
    datepicker(options?: DatepickerOptions): JQuery;
    tagsinput(options?: TagsInputOptions | 'add' | 'remove' | 'removeAll' | 'destroy' | 'focus' | 'input' | 'refresh' | 'items', ...args: any[]): JQuery;
    flipper(options?: FlipperOptions | string): JQuery;
    val(): any;
    attr(name: string, value?: any): any;
    prop(name: string, value?: any): any;
    [key: string]: any;
}

// Window extensions
interface Window {
    csrfToken: string;
    CSRF_TOKEN: string;
    inlineAds: any;
    fbq: any;
    _fbq: any;
    user_type: string;
    formatBalance: (val: any) => string;
    Analytics: any;
    posthog: any;
    PropertyCardFactory: any;
    MapManager: any;
    mapManager: any;
    ComparisonManager: any;
    PropertyCompareFavorite: any;
    initPropertyFilters: any;
    filter_data: any;
    Countdown: any;
    videojs: any;
    COMPARISON_API_URL: string;
    COMPARISON_REMOVE_API_URL: string;
    jQuery: any;
    $: any;
    google: any;
    [key: string]: any;
}

// Google Maps mock
declare namespace google {
    export namespace maps {
        class Map { constructor(el: any, opts?: any); }
        class Marker { constructor(opts?: any); setMap(map: any): void; }
        class LatLng { constructor(lat: number, lng: number); }
        class InfoWindow { constructor(opts?: any); open(map: any, marker: Marker): void; }
        class Geocoder { constructor(); geocode(opts: any, cb: any): void; }
        namespace event {
            function addListener(instance: any, eventName: string, handler: Function): void;
        }
    }
}
