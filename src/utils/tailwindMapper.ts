
/**
 * Maps Elementor CSS styles to Tailwind CSS classes
 */

export interface TailwindColor {
  color: string;
  className: string;
}

export const tailwindMapper = {
  /**
   * Map a color value to the closest Tailwind color
   */
  mapColor(color: string): TailwindColor {
    // Handle transparent
    if (color === 'transparent' || color === 'none') {
      return { color: 'transparent', className: 'bg-transparent' };
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return mapHexColor(color);
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      return mapRgbColor(color);
    }
    
    // Handle named colors
    return mapNamedColor(color);
  },
  
  /**
   * Map background color to Tailwind
   */
  mapBackgroundColor(color: string): TailwindColor {
    const mapped = this.mapColor(color);
    // Adjust classname for background use
    mapped.className = mapped.className.replace(/^(bg|text)-/, 'bg-');
    return mapped;
  },
  
  /**
   * Map text color to Tailwind
   */
  mapTextColor(color: string): TailwindColor {
    const mapped = this.mapColor(color);
    // Adjust classname for text use
    mapped.className = mapped.className.replace(/^(bg|text)-/, 'text-');
    return mapped;
  },
  
  /**
   * Map border color to Tailwind
   */
  mapBorderColor(color: string): TailwindColor {
    const mapped = this.mapColor(color);
    // Adjust classname for border use
    mapped.className = mapped.className.replace(/^(bg|text|border)-/, 'border-');
    return mapped;
  },
  
  /**
   * Map button color to React Bricks button color format
   */
  mapButtonColor(color: string): any {
    const mappedColor = this.mapColor(color);
    
    // Map to common button colors in React Bricks
    // This is a simplified mapping - expand based on your button color options
    const colorName = mappedColor.color;
    
    if (colorName.includes('pink') || colorName.includes('fuchsia') || colorName.includes('rose')) {
      return { value: 'pink', label: 'Pink' };
    }
    
    if (colorName.includes('purple') || colorName.includes('violet')) {
      return { value: 'purple', label: 'Purple' };
    }
    
    if (colorName.includes('blue') || colorName.includes('sky') || colorName.includes('cyan')) {
      return { value: 'blue', label: 'Blue' };
    }
    
    if (colorName.includes('green') || colorName.includes('emerald') || colorName.includes('teal')) {
      return { value: 'green', label: 'Green' };
    }
    
    if (colorName.includes('yellow') || colorName.includes('amber')) {
      return { value: 'yellow', label: 'Yellow' };
    }
    
    if (colorName.includes('red')) {
      return { value: 'red', label: 'Red' };
    }
    
    if (colorName.includes('gray') || colorName.includes('grey') || colorName.includes('slate')) {
      return { value: 'gray', label: 'Gray' };
    }
    
    // Default to gray if no match
    return { value: 'gray', label: 'Gray' };
  },
  
  /**
   * Map padding string to Tailwind class
   */
  mapPadding(padding: string): string {
    const parts = padding.trim().split(/\s+/);
    
    // Handle shorthand padding values
    if (parts.length === 1) {
      const value = convertSizeToTailwind(parts[0]);
      return value; // Same padding on all sides
    } 
    else if (parts.length === 2) {
      const vValue = convertSizeToTailwind(parts[0]);
      const hValue = convertSizeToTailwind(parts[1]);
      return `${vValue}-y ${hValue}-x`; // Vertical, horizontal
    } 
    else if (parts.length === 4) {
      // Top, right, bottom, left
      // For simplicity, we'll just use top and bottom for React Bricks
      const topValue = convertSizeToTailwind(parts[0]);
      const bottomValue = convertSizeToTailwind(parts[2]);
      return `${topValue}-t ${bottomValue}-b`;
    }
    
    return 'normal'; // Default to normal padding
  },
  
  /**
   * Map single padding value (e.g., paddingTop) to Tailwind
   */
  mapSinglePadding(padding: string): string {
    return convertSizeToTailwind(padding);
  },
  
  /**
   * Map margin values to Tailwind
   */
  mapMargin(margin: string): string {
    // Similar to padding mapping
    return this.mapPadding(margin).replace(/p/g, 'm');
  },
  
  /**
   * Map font size to React Bricks/Tailwind size
   */
  mapFontSize(fontSize: string): string {
    const size = parseFloat(fontSize);
    const unit = fontSize.replace(/[\d.-]/g, '');
    
    // Convert to pixels if needed
    let sizeInPx = size;
    if (unit === 'em' || unit === 'rem') {
      sizeInPx = size * 16; // Assuming base font size of 16px
    } else if (unit === 'pt') {
      sizeInPx = size * 1.333;
    }
    
    // Map to common sizes
    if (sizeInPx <= 12) return 'xs';
    if (sizeInPx <= 14) return 'sm';
    if (sizeInPx <= 16) return 'base';
    if (sizeInPx <= 18) return 'lg';
    if (sizeInPx <= 20) return 'xl';
    if (sizeInPx <= 24) return '2xl';
    if (sizeInPx <= 30) return '3xl';
    if (sizeInPx <= 36) return '4xl';
    if (sizeInPx <= 48) return '5xl';
    return '6xl';
  }
};

/**
 * Map a hex color to the closest Tailwind color
 */
function mapHexColor(hex: string): TailwindColor {
  // Simple mapping to closest Tailwind color
  // This is a simplified implementation - a real one would do color distance calculations
  
  // Convert to RGB first
  let r = 0, g = 0, b = 0;
  
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } 
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  // Now find closest Tailwind color
  // Simplified approach - just checking some primary colors
  if (r > 200 && g > 200 && b > 200) return { color: 'gray-100', className: 'bg-gray-100' };
  if (r < 50 && g < 50 && b < 50) return { color: 'gray-900', className: 'bg-gray-900' };
  
  if (r > 200 && g < 100 && b < 100) return { color: 'red-500', className: 'bg-red-500' };
  if (r < 100 && g > 150 && b < 100) return { color: 'green-500', className: 'bg-green-500' };
  if (r < 100 && g < 100 && b > 200) return { color: 'blue-500', className: 'bg-blue-500' };
  
  if (r > 200 && g > 150 && b < 100) return { color: 'yellow-500', className: 'bg-yellow-500' };
  if (r > 150 && g < 100 && b > 150) return { color: 'purple-500', className: 'bg-purple-500' };
  
  // Default fallback
  return { color: 'gray-500', className: 'bg-gray-500' };
}

/**
 * Map RGB/RGBA color to the closest Tailwind color
 */
function mapRgbColor(rgb: string): TailwindColor {
  // Extract RGB values
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (!match) return { color: 'gray-500', className: 'bg-gray-500' };
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  // Check for transparency
  if (a < 0.5) return { color: 'transparent', className: 'bg-transparent' };
  
  // Convert to hex and use the hex mapper
  const hex = '#' + 
    ('0' + r.toString(16)).slice(-2) +
    ('0' + g.toString(16)).slice(-2) +
    ('0' + b.toString(16)).slice(-2);
    
  return mapHexColor(hex);
}

/**
 * Map named CSS colors to Tailwind
 */
function mapNamedColor(color: string): TailwindColor {
  // Mapping of common CSS color names to Tailwind colors
  const colorMap: { [key: string]: TailwindColor } = {
    'white': { color: 'white', className: 'bg-white' },
    'black': { color: 'black', className: 'bg-black' },
    'red': { color: 'red-500', className: 'bg-red-500' },
    'green': { color: 'green-500', className: 'bg-green-500' },
    'blue': { color: 'blue-500', className: 'bg-blue-500' },
    'yellow': { color: 'yellow-500', className: 'bg-yellow-500' },
    'purple': { color: 'purple-500', className: 'bg-purple-500' },
    'pink': { color: 'pink-500', className: 'bg-pink-500' },
    'gray': { color: 'gray-500', className: 'bg-gray-500' },
    'grey': { color: 'gray-500', className: 'bg-gray-500' },
    // Add more as needed
  };
  
  return colorMap[color.toLowerCase()] || { color: 'gray-500', className: 'bg-gray-500' };
}

/**
 * Convert CSS size values (px, em, rem, etc.) to Tailwind size classes
 */
function convertSizeToTailwind(size: string): string {
  // Strip units and get numeric value
  const value = parseFloat(size);
  const unit = size.replace(/[\d.-]/g, '');
  
  // Convert to pixels if needed
  let pixels = value;
  if (unit === 'em' || unit === 'rem') {
    pixels = value * 16; // Assume 1rem = 16px
  } else if (unit === '%') {
    // Percentage is complex to convert - default to normal for now
    return 'normal';
  }
  
  // Map to tailwind spacing scale
  if (pixels === 0) return 'none';
  if (pixels <= 1) return 'px';
  if (pixels <= 2) return '0.5';
  if (pixels <= 4) return '1';
  if (pixels <= 6) return '1.5';
  if (pixels <= 8) return '2';
  if (pixels <= 12) return '3';
  if (pixels <= 16) return '4';
  if (pixels <= 20) return '5';
  if (pixels <= 24) return '6';
  if (pixels <= 32) return '8';
  if (pixels <= 40) return '10';
  if (pixels <= 48) return '12';
  if (pixels <= 64) return '16';
  if (pixels <= 80) return '20';
  if (pixels <= 96) return '24';
  if (pixels <= 128) return '32';
  if (pixels <= 160) return '40';
  if (pixels <= 192) return '48';
  
  return 'large'; // Very large spacing
}
