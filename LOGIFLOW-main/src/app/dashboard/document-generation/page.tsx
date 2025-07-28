
import { DocumentGenerationSection } from '@/components/document-generation/DocumentGenerationSection';

export default function DocumentGenerationPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
          Automated Document Generation
        </h1>
      </div>
      <DocumentGenerationSection />
    </div>
  );
}
