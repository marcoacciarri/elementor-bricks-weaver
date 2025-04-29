
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

const ElementorConverter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
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
  };

  const handleFetch = async () => {
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setParsedData(null);
    setGeneratedCode('');
    
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
      toast.error('Failed to fetch or parse the page');
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

  const renderElementTree = (elements: ElementorElement[], level = 0) => {
    return (
      <ul className="pl-4">
        {elements.map((element) => (
          <li key={element.id} className="my-1">
            <div className="flex items-center">
              <Button 
                variant={selectedElement === element.id ? "default" : "ghost"}
                size="sm"
                className="text-left justify-start h-auto py-1 font-normal"
                onClick={() => generateComponent(element)}
              >
                <span className="mr-1">
                  {element.type} 
                  {element.type === 'heading' && element.content 
                    ? `: ${element.content.replace(/<[^>]*>/g, '').substring(0, 20)}...` 
                    : ''}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  (ID: {element.id.substring(0, 6)}...)
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
          <div className="flex gap-4">
            <Input
              className="flex-grow"
              placeholder="https://example.com/elementor-page"
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
            />
            <Button onClick={handleFetch} disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch Page'}
            </Button>
          </div>
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
              <TabsContent value="elements">
                <ScrollArea className="h-[400px]">
                  {selectedElement ? (
                    <div>
                      <h3 className="font-medium mb-2">Element Properties:</h3>
                      <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto">
                        {JSON.stringify(
                          parsedData.elements.find(e => e.id === selectedElement) ||
                          parsedData.elements.flatMap(e => e.children || []).find(e => e.id === selectedElement),
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
                    <Textarea 
                      value={generatedCode} 
                      readOnly 
                      className="font-mono text-sm h-[390px]"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate code from an element to see the React Bricks component
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </CardContent>
            <CardFooter>
              {generatedCode && (
                <Button onClick={copyCode} className="ml-auto">
                  Copy Code
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
            <p>3. Browse the element tree and select elements to convert.</p>
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
