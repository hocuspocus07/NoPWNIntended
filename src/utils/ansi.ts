export function ansiToHtml(text: string): string {
  // First replace all ANSI codes with HTML tags
  let converted = text
    // Remove cursor movement sequences
    .replace(/\x1B\[[0-9;]*[HJKf]/g, '')
    // Bold
    .replace(/\x1B\[1m/g, '<strong>')
    // Underline
    .replace(/\x1B\[4m/g, '<u>')
    // Reverse video (invert colors)
    .replace(/\x1B\[7m/g, '<span class="reverse">')
    // Colors
    .replace(/\x1B\[1;32m/g, '<span class="text-green-600 font-bold">')  // Bold green
    .replace(/\x1B\[0;32m/g, '<span class="text-green-600">')            // Green
    .replace(/\x1B\[1;33m/g, '<span class="text-yellow-600 font-bold">') // Bold yellow
    .replace(/\x1B\[0;33m/g, '<span class="text-yellow-600">')           // Yellow
    .replace(/\x1B\[1;31m/g, '<span class="text-red-600 font-bold">')    // Bold red
    .replace(/\x1B\[0;31m/g, '<span class="text-red-600">')              // Red
    // Reset all attributes
    .replace(/\x1B\[0?m/g, '</span></strong></u>')
    // Remove any remaining ANSI codes
    .replace(/\x1B\[[0-9;]*[mGK]/g, '')
    // Convert newlines to <br>
    .replace(/\n/g, '<br>')
    // Basic HTML escaping
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  converted = converted
    .replace(/<\/u><u>/g, '')
    .replace(/<\/strong><strong>/g, '')
    .replace(/<\/span><span/g, '<span');

  return converted;
}