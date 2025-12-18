(function() {
  function fetchRelated(ctId) {
    const objectSelect = document.getElementById('id_object_id');
    if (!objectSelect) return;
    // Clear current options
    objectSelect.innerHTML = '';
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '---------';
    objectSelect.appendChild(empty);
    if (!ctId) return; // nothing selected

    // Resolve endpoint
    let endpoint = null;
    const ctField = document.getElementById('id_content_type');
    if (ctField && ctField.dataset.relatedEndpoint) {
      endpoint = ctField.dataset.relatedEndpoint;
    }
    if (!endpoint) {
      // Fallback: try to derive from admin path
      const base = window.location.pathname;
      // If on add page (/add/) or change page (/id/change/) remove trailing part
      if (/\/add\/$/.test(base)) {
        endpoint = base.replace(/add\/$/, 'related-objects/');
      } else if (/\/change\/$/.test(base)) {
        endpoint = base.replace(/\d+\/change\/$/, 'related-objects/');
      } else {
        endpoint = base + 'related-objects/';
      }
    }
    const url = endpoint;
    const params = new URLSearchParams({ ct: ctId });
    fetch(url + '?' + params.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(data => {
        const currentVal = objectSelect.getAttribute('data-current-val');
        (data.results || []).forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = item.text;
          if (currentVal && currentVal === String(item.id)) {
            opt.selected = true;
          }
          objectSelect.appendChild(opt);
        });
      })
      .catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', function() {
    /** @type {HTMLSelectElement} */
    const ctSelect = (/** @type {any} */ (document.getElementById('id_content_type')));
    if (!ctSelect) return;
    ctSelect.addEventListener('change', function() {
      // Clear previous selection so user must pick a new related object
      const objectSelect = document.getElementById('id_object_id');
      if (objectSelect) {
        objectSelect.removeAttribute('data-current-val');
        objectSelect.innerHTML = '';
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '---------';
        objectSelect.appendChild(empty);
      }
      fetchRelated(this.value);
    });
    // Initial load if value present
    if (ctSelect.value) {
      fetchRelated(ctSelect.value);
    }
  });
})();
