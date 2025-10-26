/**
 * Replaces placeholders like {name} with provided context values.
 * @param {string} template
 * @param {Record<string,string>} context
 */
function interpolate(template, context = {}) {
  return template.replace(/\{(.*?)\}/g, (_, key) => context[key.trim()] || `{${key}}`);
}

module.exports = {
  interpolate,
};
