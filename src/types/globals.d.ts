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
declare var jQuery: any;
declare var $: any;

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
declare var Analytics: any;
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
// declare var Countdown: any; // Conflicts with local definition
declare var initPropertyFilters: any;
declare var filter_data: any;
declare var buildingGeocodeAddress: any;
declare var favorite_removable: any;
declare var updateBuildingAPIUrl: any;

// Suppress common property errors by making these more permissive
interface Element {
    value?: any;
    dataset?: any;
    style: any;
    src?: any;
    href?: any;
    files?: any;
    checked?: any;
    innerHTML: any;
    innerText: any;
    textContent: any;
    matches(selector: string): boolean;
    closest(selector: string): any;
    requestSubmit?(): void;
    disabled?: any;
    reset?(): void;
    click?(): void;
    open?: any;
    focus?(): void;
}

interface HTMLElement {
    value?: any;
    dataset?: any;
    style: any;
    src?: any;
    href?: any;
    files?: any;
    checked?: any;
    content?: any;
}

interface EventTarget {
    value?: any;
    dataset?: any;
    classList: any;
    getAttribute(name: string): string | null;
    closest(selector: string): any;
    matches(selector: string): boolean;
    href?: any;
    detail?: any;
    nodeType?: number;
    ownerDocument?: any;
}

interface Event {
    key?: string;
    shiftKey?: boolean;
    detail?: any;
}

// Global functions (often defined in other JS files or templates)
declare function showModal(id?: any): void;
declare function hideModal(id?: any): void;

// JQuery Plugins
interface JQuery {
    DataTable(options?: any): any;
    datepicker(options?: any): any;
    tagsinput(options?: any): any;
    flipper(options?: any): any;
}

// Window extensions
interface Window {
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
}

