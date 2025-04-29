
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
  
  // Determine additional imports based on component properties
  if (component.name.includes('section')) {
    imports.add('import Section from \'@reactbricksui/shared/components/Section\'');
    imports.add('import Container from \'@reactbricksui/shared/components/Container\'');
    imports.add('import { sectionDefaults, backgroundSideGroup, paddingBordersSideGroup } from \'@reactbricksui/LayoutSideProps\'');
  }
  
  if (component.name.includes('text') || component.name.includes('heading')) {
    imports.add('import { RichText } from \'react-bricks/rsc\'');
    imports.add('import { textColors } from \'@reactbricksui/colors\'');
  }
  
  if (component.name.includes('image')) {
    imports.add('import { Image } from \'react-bricks/rsc\'');
    imports.add('import { photos } from \'@reactbricksui/shared/defaultImages\'');
  }
  
  if (component.name.includes('video')) {
    imports.add('import Video from \'@reactbricksui/shared/components/Video\'');
  }
  
  if (component.name.includes('button')) {
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
  return imports.join('\n') + '\n\n';
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
  
  // Add component-specific props
  Object.keys(component.props).forEach(propName => {
    if (!['backgroundColor', 'borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'].includes(propName)) {
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
  Object.keys(component.props).forEach(propName => {
    if (!['backgroundColor', 'borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'].includes(propName)) {
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
  
  // Add any local variables or constants needed
  if (component.name.includes('text') || component.name.includes('heading')) {
    body += '  const titleColor = textColors.GRAY_900;\n';
    body += '  const textColor = textColors.GRAY_700;\n\n';
  }
  
  // Start the return statement
  body += '  return (\n';
  
  // Generate the component JSX based on its type
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
    body += '    <div className="p-4">\n';
    body += '      <p>Generated component: ' + component.name + '</p>\n';
    body += '    </div>\n';
  }
  
  // Close the return statement
  body += '  );\n';
  
  return body;
};

/**
 * Generate JSX for a Section component
 */
const generateSectionJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  jsx += '    <Section\n';
  jsx += '      backgroundColor={backgroundColor}\n';
  jsx += '      borderTop={borderTop}\n';
  jsx += '      borderBottom={borderBottom}\n';
  
  // Add any background image
  if (component.props.backgroundImage) {
    jsx += '      backgroundImage={backgroundImage}\n';
  }
  
  jsx += '    >\n';
  jsx += '      <Container paddingTop={paddingTop} paddingBottom={paddingBottom}>\n';
  
  // Add content div
  jsx += '        <div className="relative flex flex-col md:flex-row">\n';
  
  // Add children content
  if (component.children && component.children.length > 0) {
    component.children.forEach(child => {
      jsx += '          <div className="w-full md:w-1/2 p-4">\n';
      jsx += '            {/* Converted child component */}\n';
      jsx += '          </div>\n';
    });
  } else {
    jsx += '          <div className="w-full">\n';
    jsx += '            {/* Section content */}\n';
    jsx += '          </div>\n';
  }
  
  jsx += '        </div>\n';
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
  
  // Add children content
  if (component.children && component.children.length > 0) {
    jsx += '      {/* Column children */}\n';
  }
  
  jsx += '    </div>\n';
  
  return jsx;
};

/**
 * Generate JSX for a Heading component
 */
const generateHeadingJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  const tag = component.props.tag || 'h2';
  const extraBold = component.props.extraBoldTitle ? 'font-extrabold' : 'font-bold';
  
  jsx += '    <RichText\n';
  jsx += '      propName="title"\n';
  jsx += '      value={title}\n';
  jsx += '      renderBlock={(props) => (\n';
  jsx += `        <${tag}\n`;
  jsx += '          className={classNames(\n';
  jsx += '            "mt-0 text-2xl leading-7",\n';
  jsx += `            ${extraBold},\n`;
  jsx += '            "mb-3",\n';
  jsx += '            titleColor\n';
  jsx += '          )}\n';
  jsx += '          {...props.attributes}\n';
  jsx += '        >\n';
  jsx += '          {props.children}\n';
  jsx += `        </${tag}>\n`;
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
  let jsx = '';
  
  jsx += '    <RichText\n';
  jsx += '      propName="text"\n';
  jsx += '      value={text}\n';
  jsx += '      renderBlock={(props) => (\n';
  jsx += '        <p\n';
  jsx += '          className={classNames(\n';
  jsx += '            "leading-7 mb-3",\n';
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
  const isRounded = component.props.isRounded;
  const hasShadow = component.props.hasShadow;
  
  jsx += '    <Image\n';
  jsx += '      propName="imageSource"\n';
  jsx += '      source={imageSource}\n';
  jsx += '      alt="Image"\n';
  jsx += '      imageClassName={classNames(\n';
  if (isRounded) {
    jsx += '        "rounded-lg",\n';
  }
  if (hasShadow) {
    jsx += '        "shadow-2xl",\n';
  }
  jsx += '      )}\n';
  jsx += '    />\n';
  
  return jsx;
};

/**
 * Generate JSX for a Button component
 */
const generateButtonJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  
  jsx += '    <Link\n';
  jsx += '      href={href || "#"}\n';
  jsx += '      target={isTargetBlank ? "_blank" : undefined}\n';
  jsx += '      className={classNames(\n';
  jsx += '        "inline-block px-5 py-3 rounded-md font-bold",\n';
  jsx += '        "transition-all ease-out duration-150",\n';
  jsx += '        type === "solid" && "text-white bg-blue-600 hover:bg-blue-700",\n';
  jsx += '        type === "outline" && "text-blue-600 border border-blue-600 hover:bg-blue-50"\n';
  jsx += '      )}\n';
  jsx += '    >\n';
  jsx += '      {text || "Button"}\n';
  jsx += '    </Link>\n';
  
  return jsx;
};

/**
 * Generate JSX for a Video component
 */
const generateVideoJSX = (component: ReactBricksComponent): string => {
  let jsx = '';
  
  jsx += '    <Video\n';
  jsx += '      type={type || "streaming"}\n';
  
  if (component.props.type === 'streaming') {
    jsx += '      platform={platform || "youtube"}\n';
    jsx += '      videoId={videoId}\n';
  } else {
    jsx += '      videoFile={videoFile}\n';
  }
  
  jsx += '      className="w-full"\n';
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
  schema += '    ...sectionDefaults,\n';
  
  // Add component-specific default props
  if (component.name.includes('heading')) {
    schema += '    title: "Generated Heading",\n';
  }
  
  if (component.name.includes('text')) {
    schema += '    text: "Generated Text Content",\n';
  }
  
  if (component.name.includes('image')) {
    schema += '    imageSource: photos.DESK_MAC,\n';
  }
  
  schema += '  }),\n';
  
  // Generate sideEditProps
  schema += '  sideEditProps: [\n';
  
  // Common side edit props for layout components
  if (component.name.includes('section')) {
    schema += '    backgroundSideGroup,\n';
    schema += '    paddingBordersSideGroup,\n';
  }
  
  // Component-specific side edit props
  if (component.name.includes('heading')) {
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
  
  if (component.name.includes('image')) {
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
  
  schema += '  ],\n';
  
  // Close the schema
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
