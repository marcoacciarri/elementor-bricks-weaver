
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseElementorPage, ElementorElement } from '@/utils/elementorParser';
import { mapElementorToReactBricks } from '@/utils/reactBricksMapper';
import { generateReactBricksComponent } from '@/utils/codeGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AlertCircle, Copy, FileCode } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

const ElementorConverter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    title: string;
    elementCount: number;
    elements: ElementorElement[];
  } | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('elements');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleFetch = async () => {
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setParsedData(null);
    setGeneratedCode('');
    setError(null);
    setSelectedElement(null);
    
    try {
      const data = await parseElementorPage(url);
      setParsedData({
        title: data.title,
        elementCount: data.elements.length,
        elements: data.elements
      });
      toast.success('Page parsed successfully');
      setActiveTab('elements');
    } catch (error) {
      console.error('Error fetching page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch or parse the page';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateComponent = (element: ElementorElement) => {
    try {
      const mappedComponent = mapElementorToReactBricks(element);
      const code = generateReactBricksComponent(mappedComponent);
      setGeneratedCode(code);
      setSelectedElement(element.id);
      setActiveTab('code');
      toast.success('Component generated successfully');
    } catch (error) {
      console.error('Error generating component:', error);
      toast.error('Failed to generate component');
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard');
    }
  };
  
  const findElement = (elements: ElementorElement[], id: string): ElementorElement | undefined => {
    for (const element of elements) {
      if (element.id === id) {
        return element;
      }
      if (element.children && element.children.length > 0) {
        const found = findElement(element.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const getElementTypeLabel = (type: string): string => {
    const mapping: Record<string, string> = {
      'section': 'Section',
      'column': 'Column',
      'heading': 'Heading',
      'text-editor': 'Text',
      'image': 'Image',
      'button': 'Button',
      'video': 'Video',
    };
    
    return mapping[type] || type.replace('widget-', '').charAt(0).toUpperCase() + type.replace('widget-', '').slice(1);
  };
  
  const getElementBadgeColor = (type: string): string => {
    const mapping: Record<string, string> = {
      'section': 'bg-purple-500',
      'column': 'bg-blue-500',
      'heading': 'bg-green-500',
      'text-editor': 'bg-amber-500',
      'image': 'bg-rose-500',
      'button': 'bg-cyan-500',
      'video': 'bg-orange-500',
    };
    
    return mapping[type] || 'bg-gray-500';
  };

  const renderElementTree = (elements: ElementorElement[], level = 0) => {
    return (
      <ul className="pl-4">
        {elements.map((element) => (
          <li key={element.id} className="my-1">
            <div className="flex items-center">
              <Button 
                variant={selectedElement === element.id ? "default" : "ghost"}
                size="sm"
                className="text-left justify-start h-auto py-1 font-normal flex items-center w-full"
                onClick={() => generateComponent(element)}
              >
                <span className="flex items-center">
                  <Badge className={`mr-2 text-xs ${getElementBadgeColor(element.type)}`}>
                    {getElementTypeLabel(element.type)}
                  </Badge>
                  {element.type === 'heading' && element.content 
                    ? <span className="truncate max-w-[180px]">{element.content.replace(/<[^>]*>/g, '').substring(0, 20)}{element.content.length > 20 ? '...' : ''}</span> 
                    : element.type === 'text-editor' && element.content
                    ? <span className="truncate max-w-[180px]">{element.content.replace(/<[^>]*>/g, '').substring(0, 20)}{element.content.length > 20 ? '...' : ''}</span>
                    : element.type === 'button' && element.content?.includes('<span class="elementor-button-text">')
                    ? <span className="truncate max-w-[180px]">{element.content.match(/<span class="elementor-button-text">(.*?)<\/span>/)?.[1] || ''}</span>
                    : ''}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ID: {element.id.substring(0, 6)}...
                </span>
              </Button>
            </div>
            {element.children && element.children.length > 0 && renderElementTree(element.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Elementor to React Bricks Converter</CardTitle>
          <CardDescription>
            Enter the URL of an Elementor-based WordPress page to convert it to React Bricks components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col md:flex-row">
            <Input
              className="flex-grow"
              placeholder="https://example.com/elementor-page"
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
            />
            <Button onClick={handleFetch} disabled={loading} className="whitespace-nowrap">
              {loading ? 'Fetching...' : 'Fetch Page'}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2 text-sm">
                  Note: Due to browser security restrictions (CORS), you may not be able to fetch some external websites directly. 
                  Try with a URL that allows cross-origin requests or use our proxy service.
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Elements</CardTitle>
              <CardDescription>
                Found {parsedData.elementCount} top-level elements on "{parsedData.title}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {renderElementTree(parsedData.elements)}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="elements">Element Details</TabsTrigger>
                  <TabsTrigger value="code">Generated Code</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="elements">
                  <ScrollArea className="h-[400px]">
                    {selectedElement && parsedData ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="font-medium">Element Properties:</h3>
                          {selectedElement && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto"
                              onClick={() => generateComponent(findElement(parsedData.elements, selectedElement) as ElementorElement)}
                            >
                              <FileCode className="h-4 w-4 mr-1" /> Generate Code
                            </Button>
                          )}
                        </div>
                        <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto">
                          {JSON.stringify(
                            findElement(parsedData.elements, selectedElement),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Select an element from the list to view its details
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="code">
                  <ScrollArea className="h-[400px] relative">
                    {generatedCode ? (
                      <>
                        <div className="absolute top-2 right-2 z-10">
                          <Button onClick={copyCode} size="sm" variant="secondary">
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                        <Textarea 
                          value={generatedCode} 
                          readOnly 
                          className="font-mono text-sm h-[390px]"
                        />
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Generate code from an element to see the React Bricks component
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              {generatedCode && (
                <Button onClick={copyCode} className="ml-auto">
                  <Copy className="h-4 w-4 mr-2" /> Copy Code
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Conversion Guide</CardTitle>
          <CardDescription>
            How to use this tool to convert Elementor pages to React Bricks components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-3">
            <p>1. Enter the URL of an Elementor-based WordPress page.</p>
            <p>2. Click "Fetch Page" to parse the Elementor elements.</p>
            <p>3. Browse the element tree and select elements to view details.</p>
            <p>4. Generate React Bricks components for the selected elements.</p>
            <p>5. Review and copy the generated code.</p>
            <p>6. Paste the code into your React Bricks project.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementorConverter;
