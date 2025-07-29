
'use client';

import React, { useState, useMemo, type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
  ArrowUpDown,
  FolderOpen,
  FileText as FileTextIcon,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent: string | null;
  balance: number;
  categoryPath: string[];
}

interface TreeNode {
  id: string;
  name: string;
  path: string[];
  children?: TreeNode[];
  isCategory?: boolean;
}

const initialTreeData: TreeNode[] = [
  {
    id: 'assets',
    name: 'ASSETS',
    path: ['ASSETS'],
    isCategory: true,
    children: [
      {
        id: 'fixed_assets',
        name: 'FIXED ASSETS',
        path: ['ASSETS', 'FIXED ASSETS'],
        isCategory: true,
        children: [
          { id: 'accum_depr', name: 'ACCUMULATED DEPRECIATION', path: ['ASSETS', 'FIXED ASSETS', 'ACCUMULATED DEPRECIATION'], isCategory: true },
          { id: 'office_equip', name: 'OFFICE EQUIPMENTS', path: ['ASSETS', 'FIXED ASSETS', 'OFFICE EQUIPMENTS'], isCategory: true },
          { id: 'comp_acc', name: 'COMPUTERS & ACCESSORIES', path: ['ASSETS', 'FIXED ASSETS', 'COMPUTERS & ACCESSORIES'], isCategory: true },
          { id: 'furn_fix', name: 'FURNITURES & FIXTURES', path: ['ASSETS', 'FIXED ASSETS', 'FURNITURES & FIXTURES'], isCategory: true },
          { id: 'veh_equip', name: 'VEHICLES & EQUIPMENTS', path: ['ASSETS', 'FIXED ASSETS', 'VEHICLES & EQUIPMENTS'], isCategory: true },
        ],
      },
      {
        id: 'current_assets',
        name: 'CURRENT ASSETS',
        path: ['ASSETS', 'CURRENT ASSETS'],
        isCategory: true,
        children: [
          {
            id: 'cash_bank',
            name: 'CASH & BANK BALANCE',
            path: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE'],
            isCategory: true,
            children: [
              { id: 'cash', name: 'CASH', path: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE', 'CASH'], isCategory: true },
              { id: 'banks', name: 'BANKS', path: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE', 'BANKS'], isCategory: true },
            ],
          },
          { id: 'gov_deposits', name: 'GOV. DEPOSITS', path: ['ASSETS', 'CURRENT ASSETS', 'GOV. DEPOSITS'], isCategory: true },
          { id: 'other_receivable', name: 'OTHER RECEIVABLE', path: ['ASSETS', 'CURRENT ASSETS', 'OTHER RECEIVABLE'], isCategory: true },
          { id: 'account_receivable', name: 'ACCOUNT RECEIVABLE', path: ['ASSETS', 'CURRENT ASSETS', 'ACCOUNT RECEIVABLE'], isCategory: true },
        ],
      },
    ],
  },
];

const rawInitialAccounts: Account[] = [
  { id: '1', code: 'A1001', name: 'Main Cash Account', type: 'asset', parent: 'cash', balance: 15000, categoryPath: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE', 'CASH'] },
  { id: '2', code: 'A1002', name: 'Petty Cash', type: 'asset', parent: 'cash', balance: 500, categoryPath: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE', 'CASH'] },
  { id: '3', code: 'B1001', name: 'ABC Bank Checking', type: 'asset', parent: 'banks', balance: 120000, categoryPath: ['ASSETS', 'CURRENT ASSETS', 'CASH & BANK BALANCE', 'BANKS'] },
  { id: '4', code: 'AR001', name: 'Salva Feed Mills Pvt Ltd', type: 'asset', parent: 'account_receivable', balance: 25000, categoryPath: ['ASSETS', 'CURRENT ASSETS', 'ACCOUNT RECEIVABLE'] },
  { id: '5', code: 'AR002', name: 'S.A.H Enterprises', type: 'asset', parent: 'account_receivable', balance: 18000, categoryPath: ['ASSETS', 'CURRENT ASSETS', 'ACCOUNT RECEIVABLE'] },
  { id: '6', code: 'OE001', name: 'Office Desks', type: 'asset', parent: 'office_equip', balance: 5000, categoryPath: ['ASSETS', 'FIXED ASSETS', 'OFFICE EQUIPMENTS'] },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: (7 + i).toString(),
    code: `AR${(i + 3).toString().padStart(3, '0')}`,
    name: `Test Customer ${i + 1}`,
    type: 'asset' as Account['type'],
    parent: 'account_receivable',
    balance: Math.random() * 10000,
    categoryPath: ['ASSETS', 'CURRENT ASSETS', 'ACCOUNT RECEIVABLE'],
  })),
];

type SortConfig = { key: keyof Pick<Account, 'code' | 'name'>; direction: 'ascending' | 'descending' } | null;

export function ChartOfAccountsClient() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>(['ASSETS', 'CURRENT ASSETS', 'ACCOUNT RECEIVABLE']);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'assets': true,
    'current_assets': true,
    'account_receivable': true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<Account | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const accountsToKeep = rawInitialAccounts.filter(account => !account.name.startsWith("Test Customer"));
    setAccounts(accountsToKeep);
    console.log("Mock batch delete of test accounts performed. Kept accounts:", accountsToKeep.length, "Original:", rawInitialAccounts.length);
  }, []);


  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSelectCategory = (path: string[]) => {
    setSelectedPath(path);
    setCurrentPage(1);
    setSelectedAccountForDetail(null);
  };

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter((acc) => {
      if (selectedPath.length === 0) return true;
      const nodePathId = selectedPath[selectedPath.length - 1];
      return acc.parent === nodePathId || acc.categoryPath.join('/') === selectedPath.join('/');
    }).filter((acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return filtered;
  }, [accounts, selectedPath, searchTerm, sortConfig]);

  const totalEntries = filteredAndSortedAccounts.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedAccounts.slice(startIndex, endIndex);
  }, [filteredAndSortedAccounts, currentPage, rowsPerPage]);

  const requestSort = (key: keyof Pick<Account, 'code' | 'name'>) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Pick<Account, 'code' | 'name'>) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const renderTree = (nodes: TreeNode[], level = 0): ReactNode => {
    return (
      <ul className={cn(level > 0 && 'pl-4')}>
        {nodes.map((node) => {
          const isSelected = selectedPath.join('/') === node.path.join('/');
          const isExpanded = expandedNodes[node.id] || false;
          return (
            <li key={node.id} className="relative py-0.5">
               {level > 0 && (
                <>
                  <span className="absolute left-[-0.5rem] top-0 h-1/2 w-px bg-border -translate-x-full"></span>
                  <span className="absolute left-[-0.5rem] top-1/2 h-px w-2 bg-border -translate-x-full -translate-y-px"></span>
                </>
              )}
              <div className="flex items-center">
                {node.children && node.children.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(node.id)}
                    className="p-0 h-6 w-6 mr-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    aria-expanded={isExpanded}
                    aria-controls={`subtree-${node.id}`}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                ) : (
                  <span className="inline-block w-6 mr-1"></span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectCategory(node.path)}
                  className={cn(
                    'w-full justify-start h-auto py-1 px-2 text-left text-sm',
                    isSelected ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent/50',
                    !isSelected && node.isCategory && 'font-medium'
                  )}
                >
                  {node.isCategory ? <FolderOpen className="mr-2 h-4 w-4 text-primary/70"/> : <FileTextIcon className="mr-2 h-4 w-4 text-muted-foreground"/>}
                  {node.name}
                </Button>
              </div>
              {node.children && isExpanded && <div id={`subtree-${node.id}`}>{renderTree(node.children, level + 1)}</div>}
            </li>
          );
        })}
      </ul>
    );
  };

  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
    toast({ title: "Account Deleted", description: `Account ${accountToDelete.name} deleted.` });
    setAccountToDelete(null);
    if(selectedAccountForDetail?.id === accountToDelete.id) setSelectedAccountForDetail(null);
  };

  const openDeleteConfirm = (account: Account) => {
    setAccountToDelete(account);
  };

  const handleAddNewAccount = () => {
    router.push('/dashboard/gl/setup/chart-of-accounts/new');
  };

  const handleEditAccountClick = (accountId: string) => {
    router.push(`/dashboard/gl/setup/chart-of-accounts/edit?id=${accountId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] bg-background p-4 md:p-6 space-y-4">
      <header className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground font-headline">Chart Of Account</h1>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search in Results..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => alert("More options clicked (mock)")}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 space-x-4">
        {/* Column 1: Asset Hierarchy Tree (25%) */}
        <Card className="w-1/4 lg:w-1/5 flex flex-col shadow-md min-h-0">
          <CardHeader className="p-3 border-b flex-shrink-0">
            <CardTitle className="text-md font-semibold">Account Categories</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-3">
            {renderTree(initialTreeData)}
          </ScrollArea>
        </Card>

        {/* Column 2: Account Listing Table (50% approx) */}
        <Card className="w-1/2 lg:w-[calc(55%-2rem)] flex flex-col shadow-md min-h-0">
            <Breadcrumb className="flex-shrink-0 p-3 border-b">
                <BreadcrumbList>
                {selectedPath.map((item, index) => (
                    <React.Fragment key={item}>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleSelectCategory(selectedPath.slice(0, index + 1)); }}
                        className={cn("text-sm", index === selectedPath.length -1 ? "font-semibold text-primary" : "")}
                        >
                        {item}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < selectedPath.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex-1 overflow-hidden"> {/* This div ensures Table component's own scroll works */}
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-[1]">
                        <TableRow>
                        <TableHead className="w-[100px] py-2 px-4">Actions</TableHead>
                        <TableHead className="w-[150px] py-2 px-4 cursor-pointer hover:bg-muted/50" onClick={() => requestSort('code')}>
                            Account Code {getSortIndicator('code')}
                        </TableHead>
                        <TableHead className="py-2 px-4 cursor-pointer hover:bg-muted/50" onClick={() => requestSort('name')}>
                            Account Name {getSortIndicator('name')}
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAccounts.map((account) => (
                        <TableRow
                            key={account.id}
                            onClick={() => setSelectedAccountForDetail(account)}
                            className={cn(selectedAccountForDetail?.id === account.id && "bg-accent/50", "cursor-pointer")}
                        >
                            <TableCell className="flex space-x-1 py-2 px-4">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); openDeleteConfirm(account); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); handleEditAccountClick(account.id); }}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            </TableCell>
                            <TableCell className="py-2 px-4">{account.code}</TableCell>
                            <TableCell className="py-2 px-4">{account.name}</TableCell>
                        </TableRow>
                        ))}
                        {paginatedAccounts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-10 text-muted-foreground px-4">
                            No accounts found for the selected criteria.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <CardFooter className="p-3 border-t flex items-center justify-between text-sm text-muted-foreground flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Select value={rowsPerPage.toString()} onValueChange={(value) => { setRowsPerPage(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder={`${rowsPerPage} Rows`} /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map(val => <SelectItem key={val} value={val.toString()}>{val} Rows</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                 <span>
                    Showing {totalEntries > 0 ? Math.min((currentPage - 1) * rowsPerPage + 1, totalEntries) : 0} - {Math.min(currentPage * rowsPerPage, totalEntries)} of {totalEntries}
                </span>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>
                    {[...Array(totalPages)].map((_, i) => {
                       const pageNum = i + 1;
                       const showPage = pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1 || (totalPages <= 5);
                       const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3 && totalPages > 5 && !(totalPages <= 5);
                       const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2 && totalPages > 5 && !(totalPages <=5) ;

                       if (showEllipsisBefore || showEllipsisAfter) return <PaginationEllipsis key={`ellipsis-${pageNum}`} />;
                       if (showPage) return (<PaginationItem key={pageNum}><PaginationLink href="#" isActive={currentPage === pageNum} onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}>{pageNum}</PaginationLink></PaginationItem>);
                       return null;
                    })}
                    <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1)); }} className={cn(currentPage === totalPages && "pointer-events-none opacity-50")} /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardFooter>
          </Card>


        {/* Column 3: Account Details (25%) */}
        <Card className="w-1/4 lg:w-[calc(25%-1rem)] flex flex-col shadow-md min-h-0">
          <CardHeader className="p-3 border-b flex-shrink-0">
            <CardTitle className="text-md font-semibold">Account Details</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            {selectedAccountForDetail ? (
              <div className="space-y-3 text-sm">
                <div><strong className="text-muted-foreground w-32 inline-block">Code:</strong> {selectedAccountForDetail.code}</div>
                <div><strong className="text-muted-foreground w-32 inline-block">Name:</strong> {selectedAccountForDetail.name}</div>
                <div><strong className="text-muted-foreground w-32 inline-block">Type:</strong> <span className="capitalize">{selectedAccountForDetail.type}</span></div>
                <div>
                  <strong className="text-muted-foreground w-32 inline-block">Parent Category:</strong>
                  {findNodeById(initialTreeData, selectedAccountForDetail.parent || '')?.name || 'N/A'}
                </div>
                <div><strong className="text-muted-foreground w-32 inline-block">Balance:</strong> {selectedAccountForDetail.balance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
                <div className="pt-4">
                    <Button onClick={() => handleEditAccountClick(selectedAccountForDetail.id)}>
                        <Pencil className="mr-2 h-4 w-4"/> Edit Account
                    </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-10 flex flex-col items-center justify-center h-full">
                <FileTextIcon className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Select an account to view details or edit.</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-0 fixed right-8 bottom-8 z-50 shadow-xl h-14 w-14 flex items-center justify-center"
        onClick={handleAddNewAccount}
        aria-label="Add New Account"
      >
        <Plus className="h-7 w-7" />
      </Button>

      <AlertDialog open={!!accountToDelete} onOpenChange={(isOpen) => !isOpen && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account &quot;{accountToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

