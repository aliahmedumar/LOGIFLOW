
'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithShippingDocument, type ChatWithShippingDocumentInput, type ChatWithShippingDocumentOutput } from '@/ai/flows/analyze-shipping-documents';
import { FileSearch, Loader2, AlertTriangle, UploadCloud, Send, User, Bot, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function DocumentAnalysisClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processedDocumentDataUri, setProcessedDocumentDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserQuery, setCurrentUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear previous errors first
    const currentFiles = e.target.files;

    if (currentFiles && currentFiles[0]) {
      const selectedFile = currentFiles[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Reset states for the new document
      setMessages([]); 
      setProcessedDocumentDataUri(null); 
      setIsProcessingFile(true);
      setIsLoading(true); // General loading for file processing

      try {
        const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        
        if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
            throw new Error("File could not be read properly or is empty.");
        }

        setProcessedDocumentDataUri(dataUri);
        setMessages([
          { id: 'init-doc', role: 'model', content: `Document "${selectedFile.name}" loaded. What would you like to know about it?` }
        ]);
        toast({ title: "Document Loaded", description: `Ready to chat about ${selectedFile.name}.`, className: "bg-green-500 text-white" });
      } catch (err) {
        console.error("Error processing file:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load document: ${errorMessage}`);
        toast({ title: "File Error", description: `Could not load document: ${errorMessage}`, variant: "destructive" });
        setFile(null);
        setFileName(null);
        setProcessedDocumentDataUri(null); // Ensure it's cleared on error
        setMessages([]); // Clear messages on error too
      } finally {
        setIsProcessingFile(false);
        setIsLoading(false);
      }
    } else {
      // No file selected or selection was cleared
      setFile(null);
      setFileName(null);
      setProcessedDocumentDataUri(null);
      setMessages([]);
      setError(null); // Clear any previous error if file selection is cleared
    }
  };
  
  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault(); // Allow calling without event for the form's onSubmit
    if (!currentUserQuery.trim() || !processedDocumentDataUri) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentUserQuery.trim(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    const queryToSubmit = currentUserQuery.trim();
    setCurrentUserQuery('');
    setIsLoading(true); // Loading for AI response

    const chatHistoryForAPI = messages.map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const response: ChatWithShippingDocumentOutput = await chatWithShippingDocument({
        documentDataUri: processedDocumentDataUri,
        userQuery: queryToSubmit,
        chatHistory: chatHistoryForAPI,
      });
      const newBotMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.botResponse,
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (err) {
      console.error("Error with document chat:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Chat Error",
        description: `Could not get response: ${errorMessage}`,
        variant: "destructive",
      });
      const errorBotMessage: ChatMessage = {
        id: `bot-error-${Date.now()}`,
        role: 'model',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false); // Done loading for AI response
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="document-chat-title" className="text-xl font-semibold text-foreground font-headline">Interactive Document Chat</CardTitle>
          <FileSearch className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Upload a document and ask questions to extract information using AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="documentFile" className="block text-sm font-medium text-muted-foreground mb-2">
            {processedDocumentDataUri ? "Change Document" : "Upload Document"}
          </Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="documentFile" 
              type="file" 
              onChange={handleFileChange} 
              className="flex-1" 
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.txt,.doc,.docx" 
              disabled={isProcessingFile}
              aria-label="Document file input"
            />
            {fileName && !isProcessingFile && <span className="text-sm text-muted-foreground truncate max-w-[150px]">{fileName}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Supported formats: PDF, PNG, JPG, TIFF, TXT, DOC, DOCX.</p>
          {isProcessingFile && (
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing document...
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 flex items-center text-sm p-2 bg-destructive/10 rounded-md">
            <AlertTriangle className="mr-2 h-4 w-4" /> {error}
          </div>
        )}

        {processedDocumentDataUri && !isProcessingFile && !error && (
          <div className="mt-4 border-t pt-4 flex flex-col h-[500px] bg-background rounded-md shadow">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end space-x-2",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && <Bot className="h-6 w-6 text-primary shrink-0 self-start" />}
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-[70%]",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground shrink-0 self-start" />}
                  </div>
                ))}
                {isLoading && !isProcessingFile && ( // Show thinking indicator for chat responses only
                  <div className="flex justify-start items-center space-x-2">
                    <Bot className="h-6 w-6 text-primary shrink-0" />
                    <div className="p-3 rounded-lg bg-muted">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSubmitForm} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Ask about the document..."
                  value={currentUserQuery}
                  onChange={(e) => setCurrentUserQuery(e.target.value)}
                  disabled={isLoading || !processedDocumentDataUri} // isLoading here refers to AI response loading
                  className="flex-1"
                  aria-label="Chat message input"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !currentUserQuery.trim() || !processedDocumentDataUri} 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          </div>
        )}
        {!processedDocumentDataUri && !isProcessingFile && !error && (
            <div className="mt-6 p-8 text-center border-2 border-dashed rounded-md">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Upload a document to start</p>
                <p className="text-sm text-muted-foreground">Then, ask questions about its content.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
