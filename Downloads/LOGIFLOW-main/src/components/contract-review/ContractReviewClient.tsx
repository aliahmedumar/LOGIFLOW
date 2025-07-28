
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { reviewCarrierContract, ReviewCarrierContractInput, ReviewCarrierContractOutput } from '@/ai/flows/review-contract-flow';
import { FileSignature, Loader2, CheckCircle, AlertTriangle, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContractReviewClient() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ReviewCarrierContractOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };
  
  const processFileAndReview = async () => {
    if (!file) {
      setError("Please select a contract document to review.");
      toast({
        title: "No Document Selected",
        description: "Please select a file for review.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const contractDataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        
        const response = await reviewCarrierContract({ contractDataUri });
        setResult(response);
        toast({
          title: "Contract Reviewed!",
          description: "Successfully analyzed the carrier contract.",
          variant: "default",
          className: "bg-green-500 text-white"
        });
    } catch (err) {
        console.error("Error reviewing contract:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to review contract: ${errorMessage}`);
        toast({
            title: "Review Failed",
            description: `Could not review contract: ${errorMessage}`,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="contract-review-title" className="text-xl font-semibold text-foreground font-headline">AI Carrier Contract Review</CardTitle>
          <FileSignature className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Upload a carrier contract to get an AI-powered review of key clauses, pricing, and compliance.</CardDescription>
      </CardHeader>
      <form onSubmit={(e) => { e.preventDefault(); processFileAndReview(); }}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contractFile" className="block text-sm font-medium text-muted-foreground mb-2">Upload Contract Document</Label>
             <div className="flex items-center space-x-2">
                <Input id="contractFile" type="file" onChange={handleFileChange} className="flex-1" accept=".pdf,.doc,.docx,.txt" />
                {file && <span className="text-sm text-muted-foreground truncate max-w-[150px]">{file.name}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Supported formats: PDF, DOC, DOCX, TXT.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button type="submit" disabled={isLoading || !file} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Review Contract
          </Button>

          {error && (
            <div className="text-red-500 flex items-center text-sm">
              <AlertTriangle className="mr-2 h-4 w-4" /> {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 border rounded-md bg-secondary w-full space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center mb-3"><CheckCircle className="mr-2 h-5 w-5 text-green-500" />Contract Review Summary</h3>
              
              <div>
                <p className="font-semibold text-md text-foreground">Overall Assessment:</p>
                <p className="text-sm text-muted-foreground italic">{result.overallAssessment}</p>
              </div>
              <hr className="my-3"/>
              <div>
                <p className="font-semibold text-md text-foreground">Pricing Summary:</p>
                <p className="text-sm text-muted-foreground">{result.pricingSummary}</p>
              </div>
              
              {result.keyClauses && result.keyClauses.length > 0 && (
                <div>
                  <p className="font-semibold text-md text-foreground mt-3">Key Clauses:</p>
                  <Accordion type="single" collapsible className="w-full">
                    {result.keyClauses.map((clause, index) => (
                      <AccordionItem value={`clause-${index}`} key={index}>
                        <AccordionTrigger className="text-sm hover:no-underline">
                          {clause.clauseType}: <span className="font-normal text-muted-foreground ml-2 truncate flex-1 text-left">{clause.summary}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pl-6 pr-2">
                          {clause.details ? clause.details : <i>No specific details extracted by AI for this clause.</i>}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
              
              {result.complianceIssues && result.complianceIssues.length > 0 && (
                <div>
                  <p className="font-semibold text-md text-foreground mt-3">Compliance Issues & Unfavorable Terms:</p>
                  <Accordion type="single" collapsible className="w-full">
                    {result.complianceIssues.map((issueItem, index) => (
                       <AccordionItem value={`issue-${index}`} key={index}>
                        <AccordionTrigger className="text-sm hover:no-underline text-red-600 dark:text-red-400">
                          Issue: <span className="font-normal text-muted-foreground ml-2 flex-1 text-left">{issueItem.issue}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pl-6 pr-2">
                          <strong>Recommendation:</strong> {issueItem.recommendation || <i>N/A</i>}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
