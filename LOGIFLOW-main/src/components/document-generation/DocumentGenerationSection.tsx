'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateDocument, GenerateDocumentInput } from '@/ai/flows/generate-document-flow';

export function DocumentGenerationSection() {
  const [selectedDocument, setSelectedDocument] = useState<GenerateDocumentInput['documentType'] | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateDocument({ documentType: selectedDocument });
      
      if (!response || !response.documentContent || !response.fileName) {
        throw new Error("AI did not return valid document content or filename.");
      }

      const blob = new Blob([response.documentContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: "Document Generated!",
        description: `${response.fileName} has been downloaded.`,
        variant: "default",
        className: "bg-green-500 text-white",
      });

    } catch (err) {
      console.error("Error generating document:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate document: ${errorMessage}`);
      toast({
        title: "Generation Failed",
        description: `Could not generate document: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-labelledby="document-generation-title">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="document-generation-title" className="text-xl font-semibold text-foreground font-headline">
              Automated Document Generation
            </CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardDescription>
            Select a document type and AI will generate its content for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-muted-foreground mb-1">Select Document Type</label>
            <Select 
              value={selectedDocument} 
              onValueChange={(value) => setSelectedDocument(value as GenerateDocumentInput['documentType'] || '')}
              disabled={isLoading}
            >
              <SelectTrigger id="documentType" className="w-full">
                <SelectValue placeholder="Choose a document..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Bill of Lading">Bill of Lading (B/L)</SelectItem>
                <SelectItem value="Packing List">Packing List</SelectItem>
                <SelectItem value="Arrival Notice">Arrival Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-red-500 flex items-center text-sm p-2 bg-destructive/10 rounded-md">
              <AlertTriangle className="mr-2 h-4 w-4" /> {error}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            The AI will generate placeholder data for the selected document.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !selectedDocument}
            className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Generate & Download Document
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
