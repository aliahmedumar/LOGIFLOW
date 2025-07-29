
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logisticsChatbot, LogisticsChatbotInput, LogisticsChatbotOutput } from '@/ai/flows/logistics-chatbot-flow';
import { MessageSquare, Send, Loader2, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function LogisticsChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  
  useEffect(() => {
    // Initial greeting from bot
    setMessages([
      { id: 'init', role: 'model', content: "Hello! I'm LogiBot, your AI assistant for LogiFlow. How can I help you today?" }
    ]);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    const chatHistoryForAPI = messages.map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const response: LogisticsChatbotOutput = await logisticsChatbot({
        userQuery: newUserMessage.content,
        chatHistory: chatHistoryForAPI,
      });
      const newBotMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.botResponse,
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (err) {
      console.error("Error with chatbot:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Chatbot Error",
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
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="logistics-chat-title" className="text-xl font-semibold text-foreground font-headline">Logistics AI Assistant</CardTitle>
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Ask about shipment tracking, ETAs, or operational procedures.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end space-x-2",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && <Bot className="h-6 w-6 text-primary shrink-0" />}
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
                 {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground shrink-0" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center space-x-2">
                 <Bot className="h-6 w-6 text-primary shrink-0" />
                <div className="p-3 rounded-lg bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1"
            aria-label="Chat message input"
          />
          <Button type="submit" disabled={isLoading || !currentMessage.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
