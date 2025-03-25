function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,th,zh-CN',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}


function googleTranslateCookie() {
  var getLang = Cookies.get('googtrans');
  if ([null, undefined].includes(getLang)) return;
  var langShot = 'EN'

  if (getLang.includes('/en/en')) {
    langShot = 'EN'
  } else if (getLang.includes('/en/th')) {
    langShot = 'TH'
  } else if (getLang.includes('/en/zh-CN')) {
    langShot = 'ZH'
  }

  $('#custom_translate_dropdown').text(langShot);
}

googleTranslateCookie()

$(document).ready(function() {
  $('.dropdown-item').click(function() {
    var getLang = Cookies.get('googtrans');

    if (![null, undefined].includes(getLang)) {
      Cookies.remove('googtrans'); // for current domain
      Cookies.remove('googtrans', { domain: '.wizerproperties.com' }); // For subdomains
      Cookies.remove('googtrans', { domain: 'wizerproperties.com' }); // For main domain
    }

    var language = $(this).data('language');

    
    setTimeout(function() {
      Cookies.set('googtrans', language); // for current domain
      Cookies.set('googtrans', language, { domain: '.wizerproperties.com' }); // For subdomains
      Cookies.set('googtrans', language, { domain: 'wizerproperties.com' }); // For main domain
        window.location.reload();
    }, 500);
  });
});