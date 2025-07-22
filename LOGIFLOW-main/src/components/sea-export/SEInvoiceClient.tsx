// src/components/sea-export/SEInvoiceClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEInvoiceForm } from './SEInvoiceForm';
import type { SEInvoice } from '@/lib/schemas/seInvoiceSchema';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock data that would normally come from a database
const initialMockInvoices: SEInvoice[] = [
  // Add mock invoices here if needed for initial state
];

export function SEInvoiceClient() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<SEInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SEInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsLoading(true);
    const storedInvoices = localStorage.getItem('se_invoices_mock');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    } else {
      setInvoices(initialMockInvoices);
    }
    setIsLoading(false);
  }, []);
  
  const updateMockInvoiceStorage = (updatedInvoices: SEInvoice[]) => {
    setInvoices(updatedInvoices);
    localStorage.setItem('se_invoices_mock', JSON.stringify(updatedInvoices));
  };

  const handleAddNew = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (invoice: SEInvoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
        const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
        updateMockInvoiceStorage(updatedInvoices);
        toast({ title: "Invoice Deleted", description: "The invoice has been successfully deleted." });
    }
  };

  const handleSaveInvoice = (invoiceData: SEInvoice) => {
    let updatedInvoices;
    if (invoiceData.id) { // Editing existing
      updatedInvoices = invoices.map(inv => inv.id === invoiceData.id ? { ...invoiceData, updatedAt: new Date().toISOString() } : inv);
       toast({ title: "Invoice Updated", description: "Successfully updated the invoice.", className: 'bg-green-500 text-white' });
    } else { // Creating new
      const newInvoice = { ...invoiceData, id: `inv_mock_${Date.now()}`, invoiceNumber: `INV-${Date.now()}`, createdAt: new Date().toISOString() };
      updatedInvoices = [...invoices, newInvoice];
       toast({ title: "Invoice Created", description: "Successfully created a new invoice.", className: 'bg-green-500 text-white' });
    }
    updateMockInvoiceStorage(updatedInvoices);
    setIsFormOpen(false);
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices.filter(invoice => 
      invoice.jobId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
    }

    return result;
  }, [invoices, searchTerm, sortBy]);
  
  const toggleRow = (id: string) => {
    setOpenRows(prev => ({...prev, [id]: !prev[id]}));
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(amount || 0);
  };
  
  const getStatusBadgeClass = (status?: SEInvoice['status']) => {
    switch (status) {
      case 'Finalized': return 'bg-blue-500 text-white';
      case 'Settled': return 'bg-green-500 text-white';
      case 'Draft': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-400';
    }
  };


  if (isLoading) return <div className="p-6">Loading invoices...</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>SE Invoice</CardTitle>
              <CardDescription>Total Invoices: {invoices.length}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-auto"/>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Invoice Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Invoice Date (Oldest)</SelectItem>
                </SelectContent>
              </Select>
               <Button onClick={handleAddNew} className="flex-shrink-0"><Plus className="mr-2 h-4 w-4"/> Add New</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Job #</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead>HBL #</TableHead>
                <TableHead>MBL #</TableHead>
                <TableHead>Ref #</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
              {filteredAndSortedInvoices.length > 0 ? (
                filteredAndSortedInvoices.map((invoice) => (
                    <Collapsible asChild key={invoice.id} open={openRows[invoice.id!] || false} onOpenChange={() => toggleRow(invoice.id!)}>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                               <Button variant="ghost" size="sm" className="w-9 p-0">
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                <span className="sr-only">Toggle details</span>
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell>{invoice.invoiceType}</TableCell>
                          <TableCell><Badge className={getStatusBadgeClass(invoice.status)}>{invoice.status}</Badge></TableCell>
                          <TableCell>{invoice.jobId}</TableCell>
                          <TableCell>{invoice.costCenter}</TableCell>
                          <TableCell>{invoice.jobInfo?.hbl || 'N/A'}</TableCell>
                          <TableCell>{invoice.jobInfo?.mbl || 'N/A'}</TableCell>
                          <TableCell>{invoice.reference}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(invoice.id!)}><Trash2 className="h-4 w-4"/></Button>
                          </TableCell>
                        </TableRow>
                         <CollapsibleContent asChild>
                          <tr className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={9} className="p-0">
                              <div className="p-4 grid grid-cols-5 gap-4 text-sm">
                                <div><strong>Invoice #:</strong> {invoice.invoiceNumber}</div>
                                <div><strong>Amount:</strong> {formatCurrency(invoice.grossTotal)}</div>
                                <div><strong>Settled:</strong> {formatCurrency(invoice.settledAmount)}</div>
                                <div><strong>Balance:</strong> {formatCurrency(invoice.balance)}</div>
                                <div><strong>Tax Invoice #:</strong> {invoice.taxInvoiceNumber || 'N/A'}</div>
                              </div>
                            </TableCell>
                          </tr>
                        </CollapsibleContent>
                      </TableBody>
                  </Collapsible>
                ))
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedInvoice ? 'Edit SE Invoice' : 'Create New SE Invoice'}</DialogTitle>
          </DialogHeader>
          <SEInvoiceForm 
            initialData={selectedInvoice}
            onSubmit={handleSaveInvoice}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
