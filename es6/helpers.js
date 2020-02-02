// Helper Functions
export let createSlug = function(value) {
  return value.toLowerCase()
              .replace(/ /g,'-')
              .replace(/[^\w-]+/g,'');
}
export let removeSlug = function(value) {
  return value.split('-')
              .join(' ')
              .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
