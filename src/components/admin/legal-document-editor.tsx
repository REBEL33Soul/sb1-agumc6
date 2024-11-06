import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Editor } from '@/components/ui/editor';

export function LegalDocumentEditor() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('terms');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await fetch('/api/admin/legal');
      const data = await response.json();
      setDocuments(data);
    };

    fetchDocuments();
  }, []);

  const handleSave = async (content: string) => {
    try {
      const doc = documents.find(d => d.type === selectedDoc);
      
      await fetch('/api/admin/legal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          content,
          type: selectedDoc,
        }),
      });

      toast({
        title: "Success",
        description: "Legal document updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <Tabs value={selectedDoc} onValueChange={setSelectedDoc}>
        <TabsList>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Notice</TabsTrigger>
          <TabsTrigger value="rights">Rights Verification</TabsTrigger>
        </TabsList>

        {documents.map((doc) => (
          <TabsContent key={doc.id} value={doc.type}>
            <div className="space-y-4">
              <Editor
                content={doc.content}
                onChange={(content) => handleSave(content)}
              />
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave(doc.content)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}