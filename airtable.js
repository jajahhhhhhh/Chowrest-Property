// ============================================================================
//  CHOWTO — Airtable connector
// ----------------------------------------------------------------------------
//  This file fetches property data from your Airtable "Properties" table.
//  Both index.html and villas-for-sale.html reference it.
//
//  To rotate the token: regenerate it at https://airtable.com/create/tokens,
//  then change the `token:` value below. That's the only place to update.
// ============================================================================

window.CHOWTO_AIRTABLE = {
  token: 'pat7KC0O4W0RkHIzG.fcc271c560b8bb892dcac95dc7f616bfa79361d2c1eebda22e16f2d4c892437b',
  baseId: 'appXNSycaCsR18AIO',
  tableId: 'tbl6VK5e7iZXkJPNk',
};

// ----------------------------------------------------------------------------
//  fetchProperties — pulls records from Airtable, returns clean objects
// ----------------------------------------------------------------------------
window.fetchProperties = async function (options) {
  options = options || {};
  const cfg = window.CHOWTO_AIRTABLE;
  const params = new URLSearchParams();

  if (options.filterByFormula) params.set('filterByFormula', options.filterByFormula);
  if (options.maxRecords) params.set('maxRecords', String(options.maxRecords));
  if (options.sort) {
    options.sort.forEach((s, i) => {
      params.set('sort[' + i + '][field]', s.field);
      if (s.direction) params.set('sort[' + i + '][direction]', s.direction);
    });
  }

  const url =
    'https://api.airtable.com/v0/' + cfg.baseId + '/' + cfg.tableId +
    (params.toString() ? '?' + params.toString() : '');

  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + cfg.token },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Airtable error (' + res.status + '): ' + txt);
  }

  const data = await res.json();
  return data.records.map(r => ({
    id: r.id,
    slug: r.fields['ID'],
    name: r.fields['Property Name'],
    category: r.fields['Category'],
    status: r.fields['Status'],
    price: r.fields['Price'],
    priceUnit: r.fields['Price Unit'],
    location: r.fields['Location'],
    description: r.fields['Description'],
    bedrooms: r.fields['Bedrooms'],
    bathrooms: r.fields['Bathrooms'],
    landSqm: r.fields['Land (sqm)'],
    builtSqm: r.fields['Built (sqm)'],
    titleType: r.fields['Title Type'],
    ownership: r.fields['Ownership'],
    features: r.fields['Features'] || [],
    coverPhotoUrl: r.fields['Cover Photo URL'],
    pageUrl: r.fields['Page URL'],
    lat: r.fields['Latitude'],
    lng: r.fields['Longitude'],
  }));
};

// ----------------------------------------------------------------------------
//  Price formatters
// ----------------------------------------------------------------------------
window.formatPrice = function (price, unit) {
  if (price === null || price === undefined) return '';
  const formatted = '฿' + price.toLocaleString('en-US');
  if (unit === 'Per night') return formatted + ' / night';
  if (unit === 'Per month') return formatted + ' / month';
  return formatted;
};

window.formatPriceHTML = function (price, unit) {
  if (price === null || price === undefined) return '';
  const formatted = '฿' + price.toLocaleString('en-US');
  const suffix = unit === 'Per night' ? ' / night' : unit === 'Per month' ? ' / month' : '';
  if (!suffix) return formatted;
  return formatted + ' <span style="color:var(--text-muted);font-weight:400">' + suffix + '</span>';
};

window.formatPriceShort = function (price) {
  if (!price) return '฿—';
  if (price >= 1000000) {
    const m = price / 1000000;
    return '฿' + (m % 1 === 0 ? m : m.toFixed(1)) + 'M';
  }
  if (price >= 1000) {
    const k = price / 1000;
    return '฿' + (k % 1 === 0 ? k : k.toFixed(1)) + 'K';
  }
  return '฿' + price;
};

// ----------------------------------------------------------------------------
//  Category-aware specs string (e.g., "4 bed · 5 bath · 1,200 sqm · Chanote")
// ----------------------------------------------------------------------------
window.formatSpecs = function (v) {
  const parts = [];
  if (v.category === 'Land for sale') {
    if (v.landSqm) {
      const rai = v.landSqm / 1600;
      parts.push((rai % 1 === 0 ? rai : rai.toFixed(1)) + ' rai');
    }
    if (v.titleType) parts.push(v.titleType);
  } else {
    if (v.bedrooms) parts.push(v.bedrooms + ' bed');
    if (v.bathrooms) parts.push(v.bathrooms + ' bath');
    if (v.landSqm) parts.push(v.landSqm.toLocaleString() + ' sqm');
  }
  return parts.join(' · ');
};

window.escapeHTML = function (s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
};
