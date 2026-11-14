// Applies the saved colour theme before the page paints, so dark mode never
// flashes light. Loaded as a tiny blocking script (the CSP forbids inline scripts).
// Keep in sync with src/hooks/useTheme.ts.
;(function () {
  var theme = 'light'
  try {
    var saved = localStorage.getItem('portfolio-theme')
    if (saved === 'light' || saved === 'dark') theme = saved
  } catch (e) {
    /* storage blocked: use the default */
  }
  var root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#11160e' : '#f8f5ec')
})()
