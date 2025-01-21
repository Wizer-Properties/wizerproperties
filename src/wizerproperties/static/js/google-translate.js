
    // Initialize Google Translate
    function googleTranslateElementInit() {
        new google.translate.TranslateElement(
            {
                pageLanguage: 'en', // Default language of the site
                includedLanguages: 'en,th,zh-CN', // Supported languages
                autoDisplay: false,
            },
            'google_translate_element' // Attach to hidden widget
        );
    }

    // Load Google Translate script
    (function () {
        var gt = document.createElement('script');
        gt.type = 'text/javascript';
        gt.async = true;
        gt.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gt, s);
    })();

    // Utility to get the value of a cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Utility to set Google Translate cookies
    function setGoogleTranslateCookie(selectedLang) {
        const cookieValue = selectedLang === 'en' ? 'null' : `/${selectedLang}`;
        document.cookie = `googtrans=/en${cookieValue}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=/en${cookieValue}; path=/;`;
    }

    // Function to handle language changes
    function setLanguage(langCode, displayLang, element) {
        // Update Google Translate cookies
        setGoogleTranslateCookie(langCode);

        // Update the dropdown button text to the short display language code
        document.getElementById('custom_translate_dropdown').innerText = displayLang;

        // Remove active class from all dropdown items
        document.querySelectorAll('.lang-list .dropdown-item').forEach(item => item.classList.remove('active'));

        // Add active class to the selected item
        if (element) {
            element.classList.add('active');
        }

        // Reload the page to apply translation
        window.location.reload();
    }

    // On page load, update dropdown and prevent its translation
    window.onload = function () {
        // Add 'notranslate' to prevent translation of the dropdown
        document.getElementById('custom_translate_dropdown').classList.add('notranslate');

        // Get the current selected language from the cookie
        const googtrans = getCookie('googtrans');
        const selectedLang = googtrans ? googtrans.split('/').pop() : 'en';

        // Map full codes to short display codes
        const langMap = {
            'en': 'EN',
            'th': 'TH',
            'zh-CN': 'ZH'
        };

        // Update the dropdown text to the mapped language code
        document.getElementById('custom_translate_dropdown').innerText = langMap[selectedLang] || 'en';

        // Highlight the selected language in the dropdown
        const selectedItem = document.querySelector(`.lang-list .dropdown-item[onclick*="'${selectedLang}'"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    };
