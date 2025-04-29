
/**
 * Maps Elementor elements to React Bricks components
 */
import { ElementorElement } from './elementorParser';
import { tailwindMapper } from './tailwindMapper';

export interface ReactBricksComponent {
  name: string;
  label: string;
  category: string;
  props: Record<string, any>;
  children?: ReactBricksComponent[];
  repeaterItems?: Record<string, any[]>;
}

/**
 * Map Elementor element to React Bricks component structure
 */
export const mapElementorToReactBricks = (
  element: ElementorElement,
  parentType?: string
): ReactBricksComponent => {
  // Base component mapping
  let component: ReactBricksComponent = {
    name: elementorTypeToComponentName(element.type),
    label: elementorTypeToComponentLabel(element.type),
    category: determineCategoryFromType(element.type),
    props: mapElementorSettingsToProps(element),
    children: []
  };

  // Handle specific element types
  switch (element.type) {
    case 'section':
      component = mapSection(element, component);
      break;
    
    case 'column':
      component = mapColumn(element, component, parentType);
      break;
      
    case 'heading':
      component = mapHeading(element, component);
      break;
    
    case 'text-editor':
      component = mapTextEditor(element, component);
      break;
      
    case 'image':
      component = mapImage(element, component);
      break;
    
    case 'button':
      component = mapButton(element, component);
      break;
      
    case 'video':
      component = mapVideo(element, component);
      break;
      
    // Add more specific mappings for other Elementor widgets
    
    default:
      // Handle generic widget mapping
      if (element.type.startsWith('widget-')) {
        component = mapGenericWidget(element, component);
      }
      break;
  }

  // Map children if any exist
  if (element.children && element.children.length > 0) {
    component.children = element.children.map(child => 
      mapElementorToReactBricks(child, element.type)
    );
  }

  return component;
};

/**
 * Convert Elementor element type to React Bricks component name
 */
const elementorTypeToComponentName = (type: string): string => {
  // Convert to kebab-case and ensure valid component name
  const baseType = type.replace('elementor-', '').replace('widget-', '');
  return `${baseType}-block`;
};

/**
 * Convert Elementor element type to user-friendly label
 */
const elementorTypeToComponentLabel = (type: string): string => {
  // Make human-readable from type
  const baseType = type.replace('elementor-', '').replace('widget-', '');
  return baseType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Determine the React Bricks category for an element
 */
const determineCategoryFromType = (type: string): string => {
  if (type === 'section') return 'Layout';
  if (type === 'column') return 'Layout';
  if (type.includes('heading')) return 'Typography';
  if (type.includes('text')) return 'Typography';
  if (type.includes('image') || type.includes('video')) return 'Media';
  if (type.includes('button')) return 'Call to Action';
  if (type.includes('form')) return 'Forms';
  return 'Other'; // Default category
};

/**
 * Map Elementor element settings to React Bricks props
 */
const mapElementorSettingsToProps = (element: ElementorElement): Record<string, any> => {
  const props: Record<string, any> = {
    backgroundColor: { color: 'white', className: 'bg-white' }, // Default
    paddingTop: 'normal',
    paddingBottom: 'normal',
  };

  // Extract background color from styles or settings
  if (element.styles.backgroundColor) {
    props.backgroundColor = tailwindMapper.mapBackgroundColor(element.styles.backgroundColor);
  }

  // Map padding values
  if (element.styles.padding) {
    props.padding = tailwindMapper.mapPadding(element.styles.padding);
  } else {
    // Map individual padding directions
    if (element.styles.paddingTop) 
      props.paddingTop = tailwindMapper.mapSinglePadding(element.styles.paddingTop);
    if (element.styles.paddingBottom)
      props.paddingBottom = tailwindMapper.mapSinglePadding(element.styles.paddingBottom);
    if (element.styles.paddingLeft)
      props.paddingLeft = tailwindMapper.mapSinglePadding(element.styles.paddingLeft);
    if (element.styles.paddingRight)
      props.paddingRight = tailwindMapper.mapSinglePadding(element.styles.paddingRight);
  }
  
  // Map margin values
  if (element.styles.margin) {
    props.margin = tailwindMapper.mapMargin(element.styles.margin);
  }

  // Map borders
  if (element.styles.borderTop || element.styles.border) {
    props.borderTop = element.styles.borderTop ? true : false;
  }
  if (element.styles.borderBottom || element.styles.border) {
    props.borderBottom = element.styles.borderBottom ? true : false;
  }

  // Map text alignment
  if (element.styles.textAlign) {
    props.textAlign = element.styles.textAlign;
  }

  return props;
};

/**
 * Map Elementor section to React Bricks Section component
 */
const mapSection = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'section-block';
  component.label = 'Section';
  
  // Extract section-specific settings
  if (element.settings['structure']) {
    component.props.structure = element.settings['structure'];
  }
  
  // Check for full-width section
  if (element.classes.includes('elementor-section-full-width')) {
    component.props.width = 'full';
  }
  
  // Look for background image
  const bgImageStyle = element.styles.backgroundImage;
  if (bgImageStyle && bgImageStyle.includes('url(')) {
    const bgImageUrl = bgImageStyle.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
    if (bgImageUrl) {
      component.props.backgroundImage = {
        source: { src: bgImageUrl },
        position: element.styles.backgroundPosition || 'center center'
      };
    }
  }

  return component;
};

/**
 * Map Elementor column to React Bricks component
 */
const mapColumn = (
  element: ElementorElement, 
  component: ReactBricksComponent,
  parentType?: string
): ReactBricksComponent => {
  component.name = 'column-block';
  component.label = 'Column';
  
  // Extract column width settings
  if (element.settings['_column_size']) {
    component.props.width = calculateColumnWidth(element.settings['_column_size']);
  }
  
  return component;
};

/**
 * Map Elementor heading to React Bricks RichText
 */
const mapHeading = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'heading-block';
  component.label = 'Heading';
  component.props.tag = element.tag || 'h2';
  
  // Extract heading content
  if (element.content) {
    component.props.title = {
      value: cleanHtmlContent(element.content)
    };
  }
  
  // Extract font settings
  if (element.styles.fontSize) {
    component.props.size = tailwindMapper.mapFontSize(element.styles.fontSize);
  }
  
  if (element.styles.fontWeight) {
    component.props.extraBoldTitle = element.styles.fontWeight === 'bold' || 
                                    parseInt(element.styles.fontWeight) >= 700;
  }
  
  return component;
};

/**
 * Map Elementor text editor to React Bricks RichText
 */
const mapTextEditor = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'text-block';
  component.label = 'Text';
  
  // Extract text content
  if (element.content) {
    component.props.text = {
      value: cleanHtmlContent(element.content)
    };
  }
  
  return component;
};

/**
 * Map Elementor image to React Bricks Image
 */
const mapImage = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'image-block';
  component.label = 'Image';
  
  // Extract image URL from various possible sources
  let imageUrl = '';
  
  // Try to find from content
  if (element.content) {
    const imgMatch = element.content.match(/<img.*?src=["'](.*?)["']/);
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1];
    }
  }
  
  // Or from settings
  if (!imageUrl && element.settings.image && element.settings.image.url) {
    imageUrl = element.settings.image.url;
  }
  
  // Set image source if found
  if (imageUrl) {
    component.props.imageSource = {
      src: imageUrl,
      alt: element.settings.alt_text || ''
    };
  }
  
  // Map image size/layout properties
  if (element.settings.image_size) {
    component.props.size = element.settings.image_size;
  }
  
  // Check for rounded corners
  if (element.styles.borderRadius || 
      element.classes.some(cls => cls.includes('rounded'))) {
    component.props.isRounded = true;
  }
  
  // Check for shadow
  if (element.styles.boxShadow || 
      element.classes.some(cls => cls.includes('shadow'))) {
    component.props.hasShadow = true;
  }
  
  return component;
};

/**
 * Map Elementor button to React Bricks Button
 */
const mapButton = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'button-block';
  component.label = 'Button';
  
  // Extract button text
  if (element.content) {
    const textMatch = element.content.match(/>([^<]+)</);
    if (textMatch && textMatch[1]) {
      component.props.text = textMatch[1].trim();
    }
  }
  
  // Extract link URL
  const linkMatch = element.content?.match(/href=["'](.*?)["']/);
  if (linkMatch && linkMatch[1]) {
    component.props.href = linkMatch[1];
  }
  
  // Extract button type/style
  if (element.classes.includes('elementor-button-link')) {
    component.props.type = 'link';
  } else if (element.classes.includes('elementor-button-outline')) {
    component.props.type = 'outline';
  } else {
    component.props.type = 'solid'; // Default
  }
  
  // Map button color
  if (element.styles.backgroundColor) {
    component.props.buttonColor = tailwindMapper.mapButtonColor(element.styles.backgroundColor);
  }
  
  // Check if it's a big button
  if (element.classes.includes('elementor-size-lg') || 
      element.classes.includes('elementor-size-xl')) {
    component.props.isBigButton = true;
  }
  
  return component;
};

/**
 * Map Elementor video to React Bricks Video
 */
const mapVideo = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  component.name = 'video-block';
  component.label = 'Video';
  
  // Determine video type (file or streaming)
  let videoType = 'streaming';
  let platform = 'youtube';
  let videoId = '';
  
  // Check for YouTube embed
  if (element.content?.includes('youtube')) {
    const youtubeMatch = element.content.match(/youtube.com\/embed\/([^"&?/\s]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      videoId = youtubeMatch[1];
    }
  }
  
  // Check for Vimeo embed
  else if (element.content?.includes('vimeo')) {
    const vimeoMatch = element.content.match(/vimeo.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      platform = 'vimeo';
      videoId = vimeoMatch[1];
    }
  }
  
  // Check for file video
  else if (element.content?.includes('<video') || 
           (element.settings.video_type && element.settings.video_type === 'hosted')) {
    videoType = 'file';
    
    // Try to extract video URL
    const videoUrlMatch = element.content?.match(/src=["'](.*?\.(?:mp4|webm|ogg))["']/);
    if (videoUrlMatch && videoUrlMatch[1]) {
      component.props.videoFile = {
        name: 'video',
        url: videoUrlMatch[1]
      };
    }
  }
  
  // Set video props
  if (videoType === 'streaming' && videoId) {
    component.props.type = 'streaming';
    component.props.platform = platform;
    component.props.videoId = videoId;
  } else {
    component.props.type = 'file';
  }
  
  return component;
};

/**
 * Map generic widget when no specific mapping exists
 */
const mapGenericWidget = (
  element: ElementorElement, 
  component: ReactBricksComponent
): ReactBricksComponent => {
  // Just do basic mapping and let the user refine later
  if (element.content) {
    component.props.content = element.content;
  }
  
  return component;
};

/**
 * Calculate column width for React Bricks based on Elementor column size
 */
const calculateColumnWidth = (columnSize: number): string => {
  // Elementor often uses percentages like 33.33, 66.66, etc.
  // Convert to closest common fraction for Tailwind
  if (columnSize <= 25) return '1/4';
  if (columnSize <= 33.33) return '1/3';
  if (columnSize <= 50) return '1/2';
  if (columnSize <= 66.66) return '2/3';
  if (columnSize <= 75) return '3/4';
  return 'full';
};

/**
 * Clean HTML content from Elementor markup
 */
const cleanHtmlContent = (html: string): string => {
  // Remove Elementor-specific classes and data attributes
  return html
    .replace(/\sclass="[^"]*elementor[^"]*"/g, '')
    .replace(/\sdata-elementor[^=]*="[^"]*"/g, '')
    .trim();
};
