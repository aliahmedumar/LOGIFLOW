// src/components/air-import/AIReceiptClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIReceiptForm } from './AIReceiptForm';
import type { AIReceipt } from '@/lib/schemas/aiReceiptSchema';
import { format, parseISO, isValid } from 'date-fns';

const initialMockReceipts: AIReceipt[] = [];

export function AIReceiptClient() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<AIReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<AIReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const storedReceipts = localStorage.getItem('ai_receipts_mock');
    if (storedReceipts) {
      setReceipts(JSON.parse(storedReceipts));
    } else {
      setReceipts(initialMockReceipts);
    }
    setIsLoading(false);
  }, []);
  
  const updateMockReceiptStorage = (updatedReceipts: AIReceipt[]) => {
    setReceipts(updatedReceipts);
    localStorage.setItem('ai_receipts_mock', JSON.stringify(updatedReceipts));
  };

  const handleAddNew = () => {
    setSelectedReceipt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (receipt: AIReceipt) => {
    setSelectedReceipt(receipt);
    setIsFormOpen(true);
  };

  const handleDelete = (receiptId: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
        const updatedReceipts = receipts.filter(rec => rec.id !== receiptId);
        updateMockReceiptStorage(updatedReceipts);
        toast({ title: "Receipt Deleted", description: "The receipt has been successfully deleted." });
    }
  };

  const handleSaveReceipt = (receiptData: AIReceipt) => {
    let updatedReceipts;
    const receiptNumber = receiptData.accountInfo.chequeNo;

    if (receiptData.id) { // Editing existing
      updatedReceipts = receipts.map(rec => rec.id === receiptData.id ? { ...receiptData, updatedAt: new Date().toISOString() } : rec);
       toast({ title: "Receipt Updated", description: `Successfully updated receipt ${receiptNumber}.`, className: 'bg-green-500 text-white' });
    } else { // Creating new
      const newReceipt = { ...receiptData, id: `rec_mock_ai_${Date.now()}`, createdAt: new Date().toISOString() };
      updatedReceipts = [...receipts, newReceipt];
       toast({ title: "Receipt Created", description: `Successfully created new receipt ${receiptNumber}.`, className: 'bg-green-500 text-white' });
    }
    updateMockReceiptStorage(updatedReceipts);
    setIsFormOpen(false);
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => 
      receipt.customerInfo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.accountInfo.chequeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.linking?.jobNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [receipts, searchTerm]);
  
  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(amount || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || !isValid(parseISO(dateString))) return 'N/A';
    return format(parseISO(dateString), 'dd-MMM-yyyy');
  };

  if (isLoading) return <div className="p-6">Loading receipts...</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>AI Receipt</CardTitle>
              <CardDescription>Total Receipts: {receipts.length}</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input placeholder="Search Customer, Cheque#, Job#..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow"/>
               <Button onClick={handleAddNew} className="flex-shrink-0"><Plus className="mr-2 h-4 w-4"/> Add New</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Cheque #</TableHead>
                  <TableHead>Cheque Date</TableHead>
                  <TableHead>Job #</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>{receipt.customerInfo.customerName}</TableCell>
                      <TableCell>{receipt.accountInfo.mode}</TableCell>
                      <TableCell>{receipt.accountInfo.chequeNo}</TableCell>
                      <TableCell>{formatDate(receipt.accountInfo.chequeDate)}</TableCell>
                      <TableCell>{receipt.linking?.jobNo || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(receipt.summary?.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(receipt)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(receipt.id!)}><Trash2 className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No AI Receipts found.</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add New Receipt
                </Button>
              </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>{selectedReceipt ? 'Edit AI Receipt' : 'Add AI Receipt'}</DialogTitle>
          </DialogHeader>
          <AIReceiptForm 
            initialData={selectedReceipt}
            onSubmit={handleSaveReceipt}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
