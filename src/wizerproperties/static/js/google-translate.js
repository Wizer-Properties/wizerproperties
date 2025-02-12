
    // Initialize Google Translate
    function googleTranslateElementInit() {
        if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
            new google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,th,zh-CN',
                    autoDisplay: false
                },
                'google_translate_element'
            );
        } else {
            console.error("Google Translate API not loaded properly.");
        }
    }

    // Load Google Translate script
    (function () {
        var gt = document.createElement('script');
        gt.type = 'text/javascript';
        gt.async = true;
        gt.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        gt.onload = function () {
            console.log("Google Translate script loaded successfully");
            googleTranslateElementInit(); // Initialize once the script is loaded
        };
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gt, s);
    })();

    // Utility to get the value of a cookie
    function getCookie(name) {
        var value = `; ${document.cookie}`; // Get all cookies as a single string
        var parts = value.split(`; ${name}=`); // Split by the requested cookie name
        if (parts.length === 2) return parts.pop().split(';').shift(); // Extract and return the cookie value
        return null; // Return null if the cookie does not exist
    }

    // Utility to set Google Translate cookies properly
    function setGoogleTranslateCookie(selectedLang) {
        var cookieValue = selectedLang === "en" ? "null" : `/${selectedLang}`;
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); // 1-year expiry
        
        document.cookie = `googtrans=/en${cookieValue}; path=/; expires=${expires.toUTCString()}; Secure; SameSite=None`;
    }

    // Function to handle language selection
    function setLanguage(langCode, displayLang, element) {
        // Update Google Translate cookies
        setGoogleTranslateCookie(langCode);

        // Immediately update the dropdown text before reloading
        $("#custom_translate_dropdown").text(displayLang);

        // Remove active class from all dropdown items
        $(".lang-list .dropdown-item").removeClass("active");

        // Add active class to the selected item
        if (element) {
            $(element).addClass("active");
        }

        // Use session storage to remember the selected language
        sessionStorage.setItem("selectedLang", langCode);

        // Reload the page to apply translation
        location.reload();
    }

    // On page load, update dropdown and prevent its translation
    $(document).ready(function () {
        setTimeout(function () {
            $("#custom_translate_dropdown").addClass("notranslate");

            let selectedLang = sessionStorage.getItem("selectedLang"); // First, check session storage

            if (!selectedLang) {
                const googtrans = getCookie("googtrans");
                console.log("Detected googtrans cookie:", googtrans); // Debugging output
                selectedLang = googtrans ? googtrans.split("/").pop() : "en";
            }

            const langMap = {
                en: "EN",
                th: "TH",
                "zh-CN": "ZH",
            };

            $("#custom_translate_dropdown").text(langMap[selectedLang] || "EN");

            $(".lang-list .dropdown-item").removeClass("active");
            $(`.lang-list .dropdown-item[onclick*="'${selectedLang}'"]`).addClass("active");

        }, 500); // Delay to allow cookie reading 
    });
