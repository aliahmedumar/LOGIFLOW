// src/app/dashboard/air-import/ai-job/[action]/page.tsx
import { AIJobFormLoader } from "@/components/air-import/AIJobFormLoader";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { notFound } from "next/navigation";

type AIJobActionPageProps = {
  params: {
    action: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function AIJobActionPage({ params, searchParams }: AIJobActionPageProps) {
  const { action } = params;
  const id = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  if (action !== 'new' && action !== 'edit' && action !== 'view') {
    notFound();
  }

  const pageTitle = action.charAt(0).toUpperCase() + action.slice(1);

  return (
    <div className="flex flex-col space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/air-import">Air Import</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/air-import/ai-job">AI Jobs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <AIJobFormLoader action={action} id={id} />
    </div>
  );
} 