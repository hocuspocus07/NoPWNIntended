export function ansiToHtml(text: string): string {
  // First remove all cursor movement sequences
  let converted = text.replace(/\x1B\[[0-9;]*[HJKf]/g, '');
  
  // Convert ANSI to HTML (simplified version)
  converted = converted
    .replace(/\x1B\[1m/g, '<strong>')
    .replace(/\x1B\[4m/g, '<u>')
    .replace(/\x1B\[7m/g, '<span class="reverse">')
    .replace(/\x1B\[1;32m/g, '<span class="text-green-600 font-bold">')
    .replace(/\x1B\[0;32m/g, '<span class="text-green-600">')
    .replace(/\x1B\[1;33m/g, '<span class="text-yellow-600 font-bold">')
    .replace(/\x1B\[0;33m/g, '<span class="text-yellow-600">')
    .replace(/\x1B\[1;31m/g, '<span class="text-red-600 font-bold">')
    .replace(/\x1B\[0;31m/g, '<span class="text-red-600">')
    // Handle reset sequences more carefully
    .replace(/\x1B\[0?m/g, (match) => {
      // Only close tags that were actually opened
      return '</span></strong></u>'.replace(/<\/[^>]+>/g, (tag) => 
        converted.includes(tag.replace(/<\/?([^>]+)>/, '<$1')) ? tag : ''
      );
    })
    // Remove any remaining ANSI codes
    .replace(/\x1B\[[0-9;]*[mGK]/g, '')
    // Convert newlines
    .replace(/\n/g, '<br>')
    // Basic HTML escaping
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Clean up nested tags
  converted = converted
    .replace(/<\/u><u>/g, '')
    .replace(/<\/strong><strong>/g, '')
    .replace(/<\/span><span/g, '<span');

  return converted;
}