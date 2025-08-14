export function ansiToHtml(text: string): string {
  // First do HTML escaping on the raw text
  let converted = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Remove all cursor movement sequences
  converted = converted.replace(/\x1B\[[0-9;]*[HJKf]/g, "")

  // Convert ANSI to HTML (after escaping, so our HTML tags don't get escaped)
  converted = converted
    .replace(/\x1B\[1m/g, "<strong>")
    .replace(/\x1B\[4m/g, "<u>")
    .replace(/\x1B\[7m/g, '<span class="reverse">')
    .replace(/\x1B\[1;32m/g, '<span class="text-green-600 font-bold">')
    .replace(/\x1B\[0;32m/g, '<span class="text-green-600">')
    .replace(/\x1B\[1;33m/g, '<span class="text-yellow-600 font-bold">')
    .replace(/\x1B\[0;33m/g, '<span class="text-yellow-600">')
    .replace(/\x1B\[1;31m/g, '<span class="text-red-600 font-bold">')
    .replace(/\x1B\[0;31m/g, '<span class="text-red-600">')
    .replace(/\x1B\[1;34m/g, '<span class="text-blue-600 font-bold">')
    .replace(/\x1B\[0;34m/g, '<span class="text-blue-600">')
    .replace(/\x1B\[1;35m/g, '<span class="text-purple-600 font-bold">')
    .replace(/\x1B\[0;35m/g, '<span class="text-purple-600">')
    .replace(/\x1B\[1;36m/g, '<span class="text-cyan-600 font-bold">')
    .replace(/\x1B\[0;36m/g, '<span class="text-cyan-600">')
    // Handle reset sequences - close all open tags
    .replace(/\x1B\[0?m/g, "</span></strong></u>")
    // Remove any remaining ANSI codes
    .replace(/\x1B\[[0-9;]*[mGK]/g, "")
    // Convert newlines to HTML breaks
    .replace(/\n/g, "<br>")

  // Clean up nested and empty tags
  converted = converted
    .replace(/<\/u><u>/g, "")
    .replace(/<\/strong><strong>/g, "")
    .replace(/<\/span><span([^>]*)>/g, "<span$1>")
    .replace(/<\/span><\/strong><\/u><strong><u><span([^>]*)>/g, "<span$1>")
    // Remove empty tags
    .replace(/<strong><\/strong>/g, "")
    .replace(/<u><\/u>/g, "")
    .replace(/<span[^>]*><\/span>/g, "")

  return converted
}
