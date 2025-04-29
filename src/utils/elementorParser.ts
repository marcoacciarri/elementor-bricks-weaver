
/**
 * Utilities for parsing Elementor HTML into structured data
 */
import { JSDOM } from 'jsdom';

export interface ElementorElement {
  id: string;
  type: string;
  tag: string;
  settings: Record<string, any>;
  children: ElementorElement[];
  classes: string[];
  styles: Record<string, string>;
  content?: string;
  attributes: Record<string, string>;
}

export interface ParsedElementorPage {
  title: string;
  elements: ElementorElement[];
  globalStyles: Record<string, any>;
}

/**
 * Main function to parse Elementor page HTML
 */
export const parseElementorPage = async (url: string): Promise<ParsedElementorPage> => {
  try {
    // Fetch the page HTML
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Get page title
    const title = document.title || 'Untitled Page';
    
    // Find the main Elementor container
    const elementorContainer = document.querySelector('.elementor');
    
    if (!elementorContainer) {
      throw new Error('No Elementor content found on the page');
    }
    
    // Extract global styles (typically in the head)
    const globalStyles = extractGlobalStyles(document);
    
    // Parse the Elementor elements hierarchy
    const elements = parseElementorElements(elementorContainer);
    
    return {
      title,
      elements,
      globalStyles
    };
  } catch (error) {
    console.error('Error parsing Elementor page:', error);
    throw error;
  }
};

/**
 * Extract global styles from the page head
 */
const extractGlobalStyles = (document: Document): Record<string, any> => {
  const styles: Record<string, any> = {};
  
  // Extract Elementor global styles
  const styleElements = document.querySelectorAll('style');
  styleElements.forEach(style => {
    if (style.textContent?.includes('elementor')) {
      // Parse CSS from style tags
      // This is a simplistic approach; real implementation would need a CSS parser
      const cssText = style.textContent;
      // Store for later processing
      styles[`style_${Object.keys(styles).length}`] = cssText;
    }
  });
  
  return styles;
};

/**
 * Recursive function to parse Elementor elements
 */
const parseElementorElements = (element: Element): ElementorElement[] => {
  const elements: ElementorElement[] = [];
  
  // Find all direct Elementor elements
  const elementorElements = element.querySelectorAll(':scope > .elementor-element');
  
  elementorElements.forEach(el => {
    // Extract the element ID
    const id = el.id || `elementor-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine element type based on classes
    const classes = Array.from(el.classList);
    let type = 'widget';
    
    if (classes.includes('elementor-section')) {
      type = 'section';
    } else if (classes.includes('elementor-column')) {
      type = 'column';
    } else if (classes.includes('elementor-widget')) {
      // Extract widget type from class name
      const widgetClass = classes.find(cls => cls.startsWith('elementor-widget-'));
      type = widgetClass ? widgetClass.replace('elementor-widget-', '') : 'widget';
    }
    
    // Extract settings from data attributes
    const settings: Record<string, any> = {};
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.replace('data-', '');
        try {
          settings[key] = JSON.parse(attr.value);
        } catch {
          settings[key] = attr.value;
        }
      }
    });
    
    // Extract inline styles
    const styles: Record<string, string> = {};
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
      styleAttr.split(';').forEach(style => {
        const [property, value] = style.split(':').map(s => s.trim());
        if (property && value) {
          styles[property] = value;
        }
      });
    }
    
    // Extract content for text widgets
    let content: string | undefined;
    if (type.includes('text') || type.includes('heading')) {
      content = el.innerHTML;
    }
    
    // Get all non-data attributes
    const attributes: Record<string, string> = {};
    Array.from(el.attributes).forEach(attr => {
      if (!attr.name.startsWith('data-') && attr.name !== 'style' && attr.name !== 'class' && attr.name !== 'id') {
        attributes[attr.name] = attr.value;
      }
    });
    
    // Parse children recursively
    const children = parseElementorElements(el);
    
    elements.push({
      id,
      type,
      tag: el.tagName.toLowerCase(),
      settings,
      children,
      classes,
      styles,
      content,
      attributes
    });
  });
  
  return elements;
};

/**
 * Extract class names that have specific Elementor prefixes
 */
export const extractElementorClasses = (classes: string[]): Record<string, string[]> => {
  const result: Record<string, string[]> = {
    layout: [],
    animation: [],
    responsive: [],
    custom: []
  };
  
  classes.forEach(cls => {
    if (cls.startsWith('elementor-')) {
      result.layout.push(cls);
    } else if (cls.startsWith('animated') || cls.includes('animation')) {
      result.animation.push(cls);
    } else if (cls.includes('hidden-') || cls.includes('visible-')) {
      result.responsive.push(cls);
    } else if (!cls.includes('elementor')) {
      result.custom.push(cls);
    }
  });
  
  return result;
};
