
/**
 * Generates React Bricks component code from the mapped component data
 */
import { ReactBricksComponent } from './reactBricksMapper';

/**
 * Generate complete React Bricks component code for a mapped component
 */
export const generateReactBricksComponent = (
  component: ReactBricksComponent,
  imports: Set<string> = new Set()
): string => {
  // Track imports we'll need
  addRequiredImports(component, imports);
  
  // Start with imports
  let code = generateImports(Array.from(imports));
  
  // Generate the component function
  code += generateComponentFunction(component);
  
  // Generate the schema
  code += generateSchema(component);
  
  // Export the component
  code += `\nexport default ${pascalCase(component.name)};\n`;
  
  return code;
};

/**
 * Add all required imports based on the component structure
 */
const addRequiredImports = (
  component: ReactBricksComponent,
  imports: Set<string>
) => {
  // Basic imports always needed
  imports.add('import React from \'react\'');
  imports.add('import classNames from \'classnames\'');
  imports.add('import { types } from \'react-bricks/rsc\'');
  
  // Based on component type, add specific imports
  if (component.name.includes('section') || component.type === 'section') {
    imports.add('import { Link, RichText, Image, Repeater } from \'react-bricks/rsc\'');
    imports.add('import Section from \'@reactbricksui/shared/components/Section\'');
    imports.add('import Container from \'@reactbricksui/shared/components/Container\'');
    imports.add('import { sectionDefaults, backgroundSideGroup, paddingBordersSideGroup } from \'@reactbricksui/LayoutSideProps\'');
    imports.add('import { textColors, buttonColors, highlightBgColors } from \'@reactbricksui/colors\'');
    imports.add('import { photos } from \'@reactbricksui/shared/defaultImages\'');
  }
  
  if (component.name.includes('text') || component.name.includes('heading') || component.type === 'heading' || component.type === 'text-editor') {
    imports.add('import { RichText } from \'react-bricks/rsc\'');
    imports.add('import { textColors } from \'@reactbricksui/colors\'');
  }
  
  if (component.name.includes('image') || component.type === 'image') {
    imports.add('import { Image } from \'react-bricks/rsc\'');
    imports.add('import { photos } from \'@reactbricksui/shared/defaultImages\'');
  }
  
  if (component.name.includes('video') || component.type === 'video') {
    imports.add('import Video from \'@reactbricksui/shared/components/Video\'');
  }
  
  if (component.name.includes('button') || component.type === 'button') {
    imports.add('import { buttonColors } from \'@reactbricksui/colors\'');
    imports.add('import { Link } from \'react-bricks/rsc\'');
  }
  
  // Check if we need repeater
  if (component.repeaterItems && Object.keys(component.repeaterItems).length > 0) {
    imports.add('import { Repeater } from \'react-bricks/rsc\'');
  }
  
  // Recursively check child components
  if (component.children && component.children.length > 0) {
    component.children.forEach(child => addRequiredImports(child, imports));
  }
};

/**
 * Generate the imports section of the component
 */
const generateImports = (imports: string[]): string => {
  return [...new Set(imports)].join('\n') + '\n\n';
};

/**
 * Generate the component function and interface
 */
const generateComponentFunction = (component: ReactBricksComponent): string => {
  const componentName = pascalCase(component.name);
  
  // Generate the props interface
  let code = `export interface ${componentName}Props {\n`;
  
  // Add common props
  code += '  backgroundColor?: any;\n';
  code += '  borderTop?: boolean;\n';
  code += '  borderBottom?: boolean;\n';
  code += '  paddingTop?: string;\n';
  code += '  paddingBottom?: string;\n';
  
  // Add component-specific props based on component type
  if (component.type === 'heading' || component.name.includes('heading')) {
    code += '  title?: types.TextValue;\n';
    code += '  tag?: string;\n';
    code += '  extraBoldTitle?: boolean;\n';
  }
  
  if (component.type === 'text-editor' || component.name.includes('text')) {
    code += '  text?: types.TextValue;\n';
    code += '  textAlign?: string;\n';
  }
  
  if (component.type === 'image' || component.name.includes('image')) {
    code += '  imageSource?: types.IImageSource;\n';
    code += '  isRounded?: boolean;\n';
    code += '  hasShadow?: boolean;\n';
  }
  
  if (component.type === 'button' || component.name.includes('button')) {
    code += '  text?: string;\n';
    code += '  href?: string;\n';
    code += '  isTargetBlank?: boolean;\n';
    code += '  buttonColor?: string;\n';
    code += '  type?: "solid" | "outline" | "link";\n';
    code += '  isBigButton?: boolean;\n';
  }
  
  if (component.type === 'section' || component.name.includes('section')) {
    code += '  imageSide?: "left" | "right";\n';
    code += '  bigImage?: boolean;\n';
    code += '  mobileImageTop?: boolean;\n';
    code += '  textAlign?: "left" | "center" | "right";\n';
    code += '  verticalAlign?: "top" | "center" | "bottom";\n';
    code += '  mediaType?: "image" | "multiple-images" | "video-file" | "video-streaming";\n';
    code += '  buttons?: types.RepeaterItems;\n';
  }
  
  // Add additional component-specific props from the elementor data
  Object.keys(component.props).forEach(propName => {
    if (!['backgroundColor', 'borderTop', 'borderBottom', 'paddingTop', 'paddingBottom', 
          'title', 'text', 'imageSource', 'tag', 'extraBoldTitle', 'textAlign', 
          'isRounded', 'hasShadow', 'href', 'buttonColor', 'type', 'isBigButton'].includes(propName)) {
      const propValue = component.props[propName];
      const propType = determinePropType(propValue);
      code += `  ${propName}?: ${propType};\n`;
    }
  });
  
  code += '}\n\n';
  
  // Begin component function
  code += `const ${componentName}: types.Brick<${componentName}Props> = ({\n`;
  
  // Add destructured props
  code += '  backgroundColor,\n';
  code += '  borderTop,\n';
  code += '  borderBottom,\n';
  code += '  paddingTop,\n';
  code += '  paddingBottom,\n';
  
  // Add component-specific props
  if (component.type === 'heading' || component.name.includes('heading')) {
    code += '  title,\n';
    code += '  tag = "h2",\n';
    code += '  extraBoldTitle = false,\n';
  }
  
  if (component.type === 'text-editor' || component.name.includes('text')) {
    code += '  text,\n';
    code += '  textAlign = "left",\n';
  }
  
  if (component.type === 'image' || component.name.includes('image')) {
    code += '  imageSource,\n';
    code += '  isRounded = false,\n';
    code += '  hasShadow = false,\n';
  }
  
  if (component.type === 'button' || component.name.includes('button')) {
    code += '  text = "Button",\n';
    code += '  href = "#",\n';
    code += '  isTargetBlank = false,\n';
    code += '  buttonColor,\n';
    code += '  type = "solid",\n';
    code += '  isBigButton = false,\n';
  }
  
  if (component.type === 'section' || component.name.includes('section')) {
    code += '  imageSide = "right",\n';
    code += '  bigImage = false,\n';
    code += '  mobileImageTop = false,\n';
    code += '  textAlign = "left",\n';
    code += '  verticalAlign = "center",\n';
    code += '  mediaType = "image",\n';
    code += '  buttons,\n';
  }
  
  // Add other props from elementor
  Object.keys(component.props).forEach(propName => {
    if (!['backgroundColor', 'borderTop', 'borderBottom', 'paddingTop', 'paddingBottom', 
          'title', 'text', 'imageSource', 'tag', 'extraBoldTitle', 'textAlign', 
          'isRounded', 'hasShadow', 'href', 'buttonColor', 'type', 'isBigButton',
          'imageSide', 'bigImage', 'mobileImageTop', 'verticalAlign', 'mediaType', 'buttons'].includes(propName)) {
      code += `  ${propName},\n`;
    }
  });
  
  code += '}) => {\n';
  
  // Component implementation
  code += generateComponentBody(component);
  
  // Close component function
  code += '};\n\n';
  
  return code;
};

/**
 * Generate the body of the component based on its type
 */
const generateComponentBody = (component: ReactBricksComponent): string => {
  let body = '';
  
  // Add common local variables based on component type
  if (component.type === 'heading' || component.name.includes('heading') || 
      component.type === 'text-editor' || component.name.includes('text')) {
    body += '  const titleColor = textColors.GRAY_900;\n';
    body += '  const textColor = textColors.GRAY_700;\n\n';
  }
  
  if (component.type === 'section' || component.name.includes('section')) {
    body += '  const titleColor = textColors.GRAY_900;\n';
    body += '  const textColor = textColors.GRAY_700;\n';
    body += '  const textAlignClass = textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left";\n';
    body += '  const justifyContentClass = textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start";\n';
    body += '  const itemsAlignClass = textAlign === "center" ? "items-center" : textAlign === "right" ? "items-end" : "items-start";\n\n';
  }
  
  // Start the return statement
  body += '  return (\n';
  
  // Generate the component JSX based on its type
  switch (component.type) {
    case 'section':
      body += generateSectionJSX(component);
      break;
    case 'column':
      body += generateColumnJSX(component);
      break;
    case 'heading':
      body += generateHeadingJSX(component);
      break;
    case 'text-editor':
      body += generateTextJSX(component);
      break;
    case 'image':
      body += generateImageJSX(component);
      break;
    case 'button':
      body += generateButtonJSX(component);
      break;
    case 'video':
      body += generateVideoJSX(component);
      break;
    default:
      // Handle components based on their name if type isn't specific
      if (component.name.includes('section')) {
        body += generateSectionJSX(component);
      } else if (component.name.includes('column')) {
        body += generateColumnJSX(component);
      } else if (component.name.includes('heading')) {
        body += generateHeadingJSX(component);
      } else if (component.name.includes('text')) {
        body += generateTextJSX(component);
      } else if (component.name.includes('image')) {
        body += generateImageJSX(component);
      } else if (component.name.includes('button')) {
        body += generateButtonJSX(component);
      } else if (component.name.includes('video')) {
        body += generateVideoJSX(component);
      } else {
        // Default fallback for other components
        body += '    <div className="p-4 border rounded-md">\n';
        body += `      <p>Generated component: ${component.name} (${component.type || 'unknown type'})</p>\n`;
        if (component.content) {
          body += '      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">\n';
          body += '        {/* Content preview */}\n';
          body += '        <div dangerouslySetInnerHTML={{ __html: content }} />\n';
          body += '      </div>\n';
        }
        body += '    </div>\n';
      }
  }
  
  // Close the return statement
  body += '  );\n';
  
  return body;
};

/**
 * Generate JSX for a Section component
 */
const generateSectionJSX = (component: ReactBricksComponent): string => {
  // Extract useful data from the component
  const hasChildren = component.children && component.children.length > 0;
  const hasHeadings = hasChildren && component.children.some(child => 
    child.type === 'heading' || child.name.includes('heading'));
  const hasText = hasChildren && component.children.some(child => 
    child.type === 'text-editor' || child.name.includes('text'));
  const hasButtons = hasChildren && component.children.some(child => 
    child.type === 'button' || child.name.includes('button'));
  const hasImages = hasChildren && component.children.some(child => 
    child.type === 'image' || child.name.includes('image'));
  
  let jsx = '';
  jsx += '    <Section\n';
  jsx += '      backgroundColor={backgroundColor}\n';
  jsx += '      borderTop={borderTop}\n';
  jsx += '      borderBottom={borderBottom}\n';
  
  // Add any background image if present in props
  if (component.props.backgroundImage) {
    jsx += '      backgroundImage={backgroundImage}\n';
  }
  
  jsx += '    >\n';
  jsx += '      <Container paddingTop={paddingTop} paddingBottom={paddingBottom}>\n';
  
  // Add content based on children
  if (hasHeadings || hasText || hasButtons) {
    jsx += '        <div className="relative flex flex-col md:flex-row items-center">\n';
    
    // Create left/content side
    jsx += '          <div className={classNames(\n';
    jsx += '            "w-full md:w-1/2 flex flex-col",\n';
    jsx += '            textAlignClass\n';
    jsx += '          )}>\n';
    
    // Add heading placeholders
    if (hasHeadings) {
      jsx += '            <RichText\n';
      jsx += '              propName="title"\n';
      jsx += '              value={title}\n';
      jsx += '              renderBlock={(props) => (\n';
      jsx += '                <h2\n';
      jsx += '                  className={classNames(\n';
      jsx += '                    "mt-0 text-2xl leading-7",\n';
      jsx += '                    extraBoldTitle ? "font-extrabold" : "font-bold",\n';
      jsx += '                    "mb-4",\n';
      jsx += '                    titleColor\n';
      jsx += '                  )}\n';
      jsx += '                  {...props.attributes}\n';
      jsx += '                >\n';
      jsx += '                  {props.children}\n';
      jsx += '                </h2>\n';
      jsx += '              )}\n';
      jsx += '              placeholder="Type a title..."\n';
      jsx += '              allowedFeatures={[types.RichTextFeatures.Highlight]}\n';
      jsx += '            />\n';
    }
    
    // Add text placeholders
    if (hasText) {
      jsx += '            <RichText\n';
      jsx += '              propName="text"\n';
      jsx += '              value={text}\n';
      jsx += '              renderBlock={(props) => (\n';
      jsx += '                <p\n';
      jsx += '                  className={classNames(\n';
      jsx += '                    "leading-7 mb-4",\n';
      jsx += '                    textColor\n';
      jsx += '                  )}\n';
      jsx += '                  {...props.attributes}\n';
      jsx += '                >\n';
      jsx += '                  {props.children}\n';
      jsx += '                </p>\n';
      jsx += '              )}\n';
      jsx += '              placeholder="Type content here..."\n';
      jsx += '              allowedFeatures={[\n';
      jsx += '                types.RichTextFeatures.Bold,\n';
      jsx += '                types.RichTextFeatures.Link,\n';
      jsx += '              ]}\n';
      jsx += '              renderLink={({ children, href, target, rel }) => (\n';
      jsx += '                <Link\n';
      jsx += '                  href={href}\n';
      jsx += '                  target={target}\n';
      jsx += '                  rel={rel}\n';
      jsx += '                  className="inline-block text-sky-500 hover:text-sky-600 hover:-translate-y-px transition-all ease-out duration-150"\n';
      jsx += '                >\n';
      jsx += '                  {children}\n';
      jsx += '                </Link>\n';
      jsx += '              )}\n';
      jsx += '            />\n';
    }
    
    // Add buttons if present
    if (hasButtons) {
      jsx += '            <div className={classNames("flex mt-4 space-x-3", justifyContentClass)}>\n';
      jsx += '              <Repeater propName="buttons" items={buttons} />\n';
      jsx += '            </div>\n';
    }
    
    jsx += '          </div>\n';
    
    // Add media side if there are images
    if (hasImages) {
      jsx += '          <div className="w-full md:w-1/2 mt-6 md:mt-0">\n';
      jsx += '            <Image\n';
      jsx += '              propName="imageSource"\n';
      jsx += '              source={imageSource}\n';
      jsx += '              alt="Image"\n';
      jsx += '              imageClassName={classNames(\n';
      jsx += '                { "rounded-lg": isRounded },\n';
      jsx += '                { "shadow-2xl": hasShadow },\n';
      jsx += '                { "md:h-[500px] md:max-w-none object-cover": bigImage }\n';
      jsx += '              )}\n';
      jsx += '            />\n';
      jsx += '          </div>\n';
    }
    
    jsx += '        </div>\n';
  } else {
    // Generic container for any other content
    jsx += '        <div className="relative flex flex-wrap">\n';
    jsx += '          {/* Section content */}\n';
    jsx += '        </div>\n';
  }
  
  jsx += '      </Container>\n';
  jsx += '    </Section>\n';
  
  return jsx;
};

/**
 * Generate JSX for a Column component
 */
const generateColumnJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  const width = component.props.width || 'full';
  
  jsx += `    <div className="w-full md:w-${width} p-4">\n`;
  
  // Add children content if exists
  if (component.children && component.children.length > 0) {
    jsx += '      <div className="flex flex-col space-y-4">\n';
    component.children.forEach((child, index) => {
      jsx += `        {/* Child component ${index + 1} (${child.type || child.name}) */}\n`;
    });
    jsx += '      </div>\n';
  } else {
    jsx += '      {/* Column content */}\n';
  }
  
  jsx += '    </div>\n';
  
  return jsx;
};

/**
 * Generate JSX for a Heading component
 */
const generateHeadingJSX = (component: ReactBricksComponent): string => {
  // Extract content from component for more specific template
  const headingContent = component.content || 'Heading';
  const cleanContent = headingContent.replace(/<\/?[^>]+(>|$)/g, '').trim();
  const headingTag = component.tag || 'h2';
  
  let jsx = '';
  jsx += '    <RichText\n';
  jsx += '      propName="title"\n';
  jsx += '      value={title || { text: ' + JSON.stringify(cleanContent) + ' }}\n';
  jsx += '      renderBlock={(props) => (\n';
  jsx += `        <${headingTag}\n`;
  jsx += '          className={classNames(\n';
  jsx += '            "mt-0 text-2xl leading-7",\n';
  jsx += '            extraBoldTitle ? "font-extrabold" : "font-bold",\n';
  jsx += '            "mb-3",\n';
  jsx += '            titleColor\n';
  jsx += '          )}\n';
  jsx += '          {...props.attributes}\n';
  jsx += '        >\n';
  jsx += '          {props.children}\n';
  jsx += `        </${headingTag}>\n`;
  jsx += '      )}\n';
  jsx += '      placeholder="Type a title..."\n';
  jsx += '      allowedFeatures={[types.RichTextFeatures.Highlight]}\n';
  jsx += '    />\n';
  
  return jsx;
};

/**
 * Generate JSX for a Text component
 */
const generateTextJSX = (component: ReactBricksComponent): string => {
  // Extract content for more specific template
  const textContent = component.content || 'Text content';
  const cleanContent = textContent.replace(/<\/?[^>]+(>|$)/g, '').trim();
  
  let jsx = '';
  jsx += '    <RichText\n';
  jsx += '      propName="text"\n';
  jsx += '      value={text || { text: ' + JSON.stringify(cleanContent) + ' }}\n';
  jsx += '      renderBlock={(props) => (\n';
  jsx += '        <p\n';
  jsx += '          className={classNames(\n';
  jsx += '            "leading-7 mb-3",\n';
  jsx += '            textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left",\n';
  jsx += '            textColor\n';
  jsx += '          )}\n';
  jsx += '          {...props.attributes}\n';
  jsx += '        >\n';
  jsx += '          {props.children}\n';
  jsx += '        </p>\n';
  jsx += '      )}\n';
  jsx += '      placeholder="Type a text..."\n';
  jsx += '      allowedFeatures={[\n';
  jsx += '        types.RichTextFeatures.Bold,\n';
  jsx += '        types.RichTextFeatures.Link,\n';
  jsx += '      ]}\n';
  jsx += '      renderLink={({ children, href, target, rel }) => (\n';
  jsx += '        <Link\n';
  jsx += '          href={href}\n';
  jsx += '          target={target}\n';
  jsx += '          rel={rel}\n';
  jsx += '          className="inline-block text-sky-500 hover:text-sky-600 hover:-translate-y-px transition-all ease-out duration-150"\n';
  jsx += '        >\n';
  jsx += '          {children}\n';
  jsx += '        </Link>\n';
  jsx += '      )}\n';
  jsx += '    />\n';
  
  return jsx;
};

/**
 * Generate JSX for an Image component
 */
const generateImageJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  // Try to extract image URL from component
  let imageUrl = '';
  
  if (component.content) {
    const imgMatch = component.content.match(/<img.*?src=["'](.*?)["']/);
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1];
    }
  }
  
  if (component.settings?.image?.url) {
    imageUrl = component.settings.image.url;
  }
  
  jsx += '    <Image\n';
  jsx += '      propName="imageSource"\n';
  jsx += '      source={imageSource || {\n';
  if (imageUrl) {
    jsx += `        src: "${imageUrl}",\n`;
    jsx += '        alt: "' + (component.settings?.alt_text || 'Image') + '",\n';
  } else {
    jsx += '        src: photos.DESK_MAC.src,\n';
    jsx += '        alt: photos.DESK_MAC.alt,\n';
  }
  jsx += '      }}\n';
  jsx += '      alt="Image"\n';
  jsx += '      imageClassName={classNames(\n';
  jsx += '        isRounded && "rounded-lg",\n';
  jsx += '        hasShadow && "shadow-2xl"\n';
  jsx += '      )}\n';
  jsx += '    />\n';
  
  return jsx;
};

/**
 * Generate JSX for a Button component
 */
const generateButtonJSX = (component: ReactBricksComponent): string => {
  // Extract button text and link if available
  let buttonText = 'Button';
  let buttonLink = '#';
  
  if (component.content) {
    const textMatch = component.content.match(/>([^<]+)</);
    if (textMatch && textMatch[1]) {
      buttonText = textMatch[1].trim();
    }
    
    const linkMatch = component.content.match(/href=["'](.*?)["']/);
    if (linkMatch && linkMatch[1]) {
      buttonLink = linkMatch[1];
    }
  }
  
  let jsx = '';
  jsx += '    <Link\n';
  jsx += `      href={href || "${buttonLink}"}\n`;
  jsx += '      target={isTargetBlank ? "_blank" : undefined}\n';
  jsx += '      className={classNames(\n';
  jsx += '        "inline-block px-5 py-3 rounded-md font-bold",\n';
  jsx += '        "transition-all ease-out duration-150",\n';
  jsx += '        isBigButton ? "text-lg" : "text-base",\n';
  jsx += '        type === "solid" && "text-white bg-blue-600 hover:bg-blue-700",\n';
  jsx += '        type === "outline" && "text-blue-600 border border-blue-600 hover:bg-blue-50",\n';
  jsx += '        type === "link" && "text-blue-600 hover:text-blue-700 hover:underline"\n';
  jsx += '      )}\n';
  jsx += '    >\n';
  jsx += `      {text || "${buttonText}"}\n`;
  jsx += '    </Link>\n';
  
  return jsx;
};

/**
 * Generate JSX for a Video component
 */
const generateVideoJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  let videoType = 'streaming';
  let platform = 'youtube';
  let videoId = '';
  
  // Try to extract video ID if available
  if (component.content) {
    if (component.content.includes('youtube')) {
      const youtubeMatch = component.content.match(/youtube.com\/embed\/([^"&?/\s]+)/);
      if (youtubeMatch && youtubeMatch[1]) {
        videoId = youtubeMatch[1];
      }
    } else if (component.content.includes('vimeo')) {
      const vimeoMatch = component.content.match(/vimeo.com\/(?:video\/)?([0-9]+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        platform = 'vimeo';
        videoId = vimeoMatch[1];
      }
    } else if (component.content.includes('<video')) {
      videoType = 'file';
    }
  }
  
  jsx += '    <Video\n';
  jsx += `      type="${videoType}"\n`;
  
  if (videoType === 'streaming') {
    jsx += `      platform="${platform}"\n`;
    if (videoId) {
      jsx += `      videoId="${videoId}"\n`;
    } else {
      jsx += '      videoId="dQw4w9WgXcQ" // Default YouTube video\n';
    }
  } else {
    jsx += '      videoFile={videoFile}\n';
  }
  
  jsx += '      className="w-full rounded"\n';
  jsx += '    />\n';
  
  return jsx;
};

/**
 * Generate the schema for the React Bricks component
 */
const generateSchema = (component: ReactBricksComponent): string => {
  const componentName = pascalCase(component.name);
  
  let schema = `${componentName}.schema = {\n`;
  schema += `  name: '${component.name}',\n`;
  schema += `  label: '${component.label}',\n`;
  schema += `  category: '${component.category}',\n`;
  
  // Generate getDefaultProps
  schema += '  getDefaultProps: () => ({\n';
  
  // Add appropriate defaults based on component type
  if (component.type === 'section' || component.name.includes('section')) {
    schema += '    ...sectionDefaults,\n';
  } else {
    schema += '    backgroundColor: { color: "white", className: "bg-white" },\n';
  }
  
  // Component-specific default props
  if (component.type === 'heading' || component.name.includes('heading')) {
    const headingContent = component.content 
      ? component.content.replace(/<\/?[^>]+(>|$)/g, '').trim() 
      : 'Heading';
    schema += `    title: "${headingContent}",\n`;
    schema += '    tag: "h2",\n';
  }
  
  if (component.type === 'text-editor' || component.name.includes('text')) {
    const textContent = component.content 
      ? component.content.replace(/<\/?[^>]+(>|$)/g, '').trim() 
      : 'Text content';
    schema += `    text: "${textContent}",\n`;
  }
  
  if (component.type === 'image' || component.name.includes('image')) {
    schema += '    imageSource: photos.DESK_MAC,\n';
    schema += '    isRounded: false,\n';
    schema += '    hasShadow: false,\n';
  }
  
  if (component.type === 'button' || component.name.includes('button')) {
    const buttonText = component.content && component.content.match(/>([^<]+)</)
      ? component.content.match(/>([^<]+)</)[1].trim()
      : 'Button';
    schema += `    text: "${buttonText}",\n`;
    schema += '    href: "#",\n';
    schema += '    type: "solid",\n';
    schema += '    buttonColor: buttonColors.BLUE.value,\n';
  }
  
  schema += '  }),\n';
  
  // Generate sideEditProps
  schema += '  sideEditProps: [\n';
  
  // Common side edit props for layout components
  if (component.type === 'section' || component.name.includes('section')) {
    schema += '    backgroundSideGroup,\n';
    schema += '    paddingBordersSideGroup,\n';
    
    schema += '    {\n';
    schema += '      groupName: "Layout",\n';
    schema += '      props: [\n';
    schema += '        {\n';
    schema += '          name: "imageSide",\n';
    schema += '          label: "Image side",\n';
    schema += '          type: types.SideEditPropType.Select,\n';
    schema += '          selectOptions: {\n';
    schema += '            display: types.OptionsDisplay.Radio,\n';
    schema += '            options: [\n';
    schema += '              { value: "right", label: "Right" },\n';
    schema += '              { value: "left", label: "Left" },\n';
    schema += '            ],\n';
    schema += '          },\n';
    schema += '        },\n';
    schema += '      ],\n';
    schema += '    },\n';
  } else {
    schema += '    paddingBordersSideGroup,\n';
  }
  
  // Component-specific side edit props
  if (component.type === 'heading' || component.name.includes('heading')) {
    schema += '    {\n';
    schema += '      groupName: "Typography",\n';
    schema += '      props: [\n';
    schema += '        {\n';
    schema += '          name: "tag",\n';
    schema += '          label: "Tag",\n';
    schema += '          type: types.SideEditPropType.Select,\n';
    schema += '          selectOptions: {\n';
    schema += '            display: types.OptionsDisplay.Radio,\n';
    schema += '            options: [\n';
    schema += '              { value: "h1", label: "Heading 1" },\n';
    schema += '              { value: "h2", label: "Heading 2" },\n';
    schema += '              { value: "h3", label: "Heading 3" },\n';
    schema += '              { value: "h4", label: "Heading 4" },\n';
    schema += '              { value: "h5", label: "Heading 5" },\n';
    schema += '              { value: "h6", label: "Heading 6" },\n';
    schema += '            ],\n';
    schema += '          },\n';
    schema += '        },\n';
    schema += '        {\n';
    schema += '          name: "extraBoldTitle",\n';
    schema += '          label: "Extra Bold",\n';
    schema += '          type: types.SideEditPropType.Boolean,\n';
    schema += '        },\n';
    schema += '      ],\n';
    schema += '    },\n';
  }
  
  if (component.type === 'text-editor' || component.name.includes('text')) {
    schema += '    {\n';
    schema += '      groupName: "Typography",\n';
    schema += '      props: [\n';
    schema += '        {\n';
    schema += '          name: "textAlign",\n';
    schema += '          label: "Text Alignment",\n';
    schema += '          type: types.SideEditPropType.Select,\n';
    schema += '          selectOptions: {\n';
    schema += '            display: types.OptionsDisplay.Radio,\n';
    schema += '            options: [\n';
    schema += '              { value: "left", label: "Left" },\n';
    schema += '              { value: "center", label: "Center" },\n';
    schema += '              { value: "right", label: "Right" },\n';
    schema += '            ],\n';
    schema += '          },\n';
    schema += '        },\n';
    schema += '      ],\n';
    schema += '    },\n';
  }
  
  if (component.type === 'image' || component.name.includes('image')) {
    schema += '    {\n';
    schema += '      groupName: "Image Settings",\n';
    schema += '      props: [\n';
    schema += '        {\n';
    schema += '          name: "isRounded",\n';
    schema += '          label: "Rounded Corners",\n';
    schema += '          type: types.SideEditPropType.Boolean,\n';
    schema += '        },\n';
    schema += '        {\n';
    schema += '          name: "hasShadow",\n';
    schema += '          label: "Show Shadow",\n';
    schema += '          type: types.SideEditPropType.Boolean,\n';
    schema += '        },\n';
    schema += '      ],\n';
    schema += '    },\n';
  }
  
  if (component.type === 'button' || component.name.includes('button')) {
    schema += '    {\n';
    schema += '      groupName: "Button",\n';
    schema += '      props: [\n';
    schema += '        {\n';
    schema += '          name: "type",\n';
    schema += '          label: "Type",\n';
    schema += '          type: types.SideEditPropType.Select,\n';
    schema += '          selectOptions: {\n';
    schema += '            display: types.OptionsDisplay.Radio,\n';
    schema += '            options: [\n';
    schema += '              { value: "solid", label: "Solid" },\n';
    schema += '              { value: "outline", label: "Outline" },\n';
    schema += '              { value: "link", label: "Link" },\n';
    schema += '            ],\n';
    schema += '          },\n';
    schema += '        },\n';
    schema += '        {\n';
    schema += '          name: "href",\n';
    schema += '          label: "Link (URL)",\n';
    schema += '          type: types.SideEditPropType.Text,\n';
    schema += '        },\n';
    schema += '        {\n';
    schema += '          name: "isTargetBlank",\n';
    schema += '          label: "Open in new window",\n';
    schema += '          type: types.SideEditPropType.Boolean,\n';
    schema += '        },\n';
    schema += '        {\n';
    schema += '          name: "isBigButton",\n';
    schema += '          label: "Big button",\n';
    schema += '          type: types.SideEditPropType.Boolean,\n';
    schema += '        },\n';
    schema += '      ],\n';
    schema += '    },\n';
  }
  
  // Close the schema
  schema += '  ],\n';
  
  // Add repeaterItems if necessary based on component type
  if (component.type === 'section' || component.name.includes('section')) {
    schema += '  repeaterItems: [\n';
    schema += '    {\n';
    schema += '      name: "buttons",\n';
    schema += '      itemType: "button",\n';
    schema += '      itemLabel: "Button",\n';
    schema += '      min: 0,\n';
    schema += '      max: 2,\n';
    schema += '    },\n';
    schema += '  ],\n';
  }
  
  schema += '};\n';
  
  return schema;
};

/**
 * Determine the TypeScript type for a prop based on its value
 */
const determinePropType = (value: any): string => {
  if (value === null || value === undefined) return 'any';
  
  const type = typeof value;
  
  if (type === 'boolean') return 'boolean';
  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  
  if (type === 'object') {
    if (Array.isArray(value)) return 'any[]';
    if (value.src || value.value) return 'types.IImageSource'; // Likely an image source
    return 'Record<string, any>';
  }
  
  return 'any';
};

/**
 * Convert kebab-case to PascalCase
 */
const pascalCase = (str: string): string => {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

