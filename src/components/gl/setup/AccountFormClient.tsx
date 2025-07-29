
// src/components/gl/setup/AccountFormClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';

const accountTypes = ['asset', 'liability', 'equity', 'income', 'expense'] as const;
const mockParentAccounts = [
  { id: 'current_assets', name: 'CURRENT ASSETS' },
  { id: 'fixed_assets', name: 'FIXED ASSETS' },
  { id: 'cash', name: 'CASH (under CASH & BANK BALANCE)' },
  { id: 'banks', name: 'BANKS (under CASH & BANK BALANCE)' },
  { id: 'account_receivable', name: 'ACCOUNT RECEIVABLE' },
];

const accountSchema = z.object({
  parentAccount: z.string().optional(), 
  accountCode: z.string().min(1, 'Account Code is required'),
  title: z.string().min(1, 'Title of Account is required'),
  maxChildAccount: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().int().min(0, "Must be a positive integer or zero").optional()
  ),
  category: z.enum(accountTypes, { required_error: 'Category is required' }),
  subCategory: z.string().optional(), 
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormClientProps {
  action: 'new' | 'edit';
  accountId?: string;
}

const getMockAccountById = (id: string): AccountFormData | null => {
  // Simulate fetching account data for edit mode
  if (id === 'AR001') { // Example existing account
    return {
      parentAccount: 'account_receivable',
      accountCode: 'AR001',
      title: 'Salva Feed Mills Pvt Ltd',
      maxChildAccount: 10,
      category: 'asset',
      subCategory: 'trade_receivables',
    };
  }
  // Add other mock accounts as needed for testing edit
  return null; 
};

const generateNewAccountCode = (category: typeof accountTypes[number]): string => {
  // Basic mock code generation
  const prefix = category.substring(0,2).toUpperCase();
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
  return `${prefix}${randomNumber}`;
}

export function AccountFormClient({ action, accountId }: AccountFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = action === 'edit';

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      parentAccount: '', // Will be handled by placeholder or initial selection
      accountCode: '',
      title: '',
      maxChildAccount: undefined, // Explicitly undefined for optional number
      category: undefined, // No default category
      subCategory: '', // Will be handled by placeholder or initial selection
    },
  });

  useEffect(() => {
    if (isEdit && accountId) {
      const existingAccount = getMockAccountById(accountId);
      if (existingAccount) {
        // Ensure parentAccount and subCategory are set to special value if they were empty/undefined
        form.reset({
          ...existingAccount,
          parentAccount: existingAccount.parentAccount || '_NO_PARENT_',
          subCategory: existingAccount.subCategory || '_NO_SUB_CATEGORY_',
        });
      } else {
        // Handle case where account is not found for editing
        toast({ title: "Error", description: "Account not found for editing.", variant: "destructive" });
        router.push('/dashboard/gl/setup/chart-of-accounts');
      }
    } else if (!isEdit) {
      // For new accounts, ensure special values are set if "None" is the intended default visually
      form.reset({
        parentAccount: '_NO_PARENT_',
        accountCode: '',
        title: '',
        maxChildAccount: undefined,
        category: undefined,
        subCategory: '_NO_SUB_CATEGORY_',
      });
    }
  }, [isEdit, accountId, form, router, toast]);
  
  // Auto-generate account code when category changes for new accounts
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'category' && !isEdit && value.category) {
        form.setValue('accountCode', generateNewAccountCode(value.category));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEdit]);


  const onSubmit = async (data: AccountFormData) => {
    // Prepare submission data, converting special "None" values back
    const submissionData = {
      ...data,
      parentAccount: data.parentAccount === "_NO_PARENT_" ? undefined : data.parentAccount,
      subCategory: data.subCategory === "_NO_SUB_CATEGORY_" ? '' : data.subCategory,
    };
    
    console.log('Form data to be submitted:', submissionData);

    // Simulate API call
    try {
      if (action === 'new') {
        // Simulate successful database write
        console.log("Data to be sent to database:", submissionData);
        const mockResponse = { id: submissionData.accountCode, path: `accounts/${submissionData.accountCode}`, status: "success" };
        console.log("Mock DB Response:", mockResponse);
        
        // Simulate "force refresh query cache" - this would involve re-fetching or invalidating a cache in a real app
        console.log("Simulating query cache refresh. Please navigate back to the Chart of Accounts page to see potential changes if data source were live.");

        toast({
          title: 'Account Added (Mock)',
          description: `Successfully added account: ${submissionData.title}`,
          className: 'bg-green-500 text-white',
        });
      } else { // action === 'edit'
        console.log('Updated account data (Mock):', submissionData);
        toast({
          title: 'Account Updated (Mock)',
          description: `Successfully updated account: ${submissionData.title}`,
          className: 'bg-green-500 text-white',
        });
      }
      router.push('/dashboard/gl/setup/chart-of-accounts'); // Navigate back to the list
    } catch (error) {
        console.error("Mock API submission error:", error);
        toast({
          title: `Error ${action === 'new' ? 'Adding' : 'Updating'} Account`,
          description: `Failed to ${action === 'new' ? 'add' : 'update'} account: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: 'destructive',
        });
    }
  };

  // Define options for select dropdowns
  const categoryOptions = accountTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1) // Capitalize first letter
  }));
  
  // Dynamic sub-category options based on selected category
  const currentCategory = form.watch('category');
  let subCategoryOptions: { value: string; label: string }[] = [];

  if (currentCategory === 'asset') {
    subCategoryOptions = [
      { value: 'current_asset', label: 'Current Asset' },
      { value: 'fixed_asset', label: 'Fixed Asset' },
      { value: 'inventory', label: 'Inventory' },
      { value: 'trade_receivables', label: 'Trade Receivables' },
    ];
  } else if (currentCategory === 'liability') {
     subCategoryOptions = [
      { value: 'current_liability', label: 'Current Liability' },
      { value: 'long_term_liability', label: 'Long-term Liability' },
      { value: 'trade_payables', label: 'Trade Payables' },
    ];
  }
  // Add more conditions for other categories if needed

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">{isEdit ? 'Edit Account' : 'Add New Account'}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6 p-6">
            {/* Left Column */}
            <FormField
              control={form.control}
              name="parentAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || '_NO_PARENT_'} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent account (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_NO_PARENT_">None (Top Level Account)</SelectItem>
                      {mockParentAccounts.map(pa => (
                        <SelectItem key={pa.id} value={pa.id}>{pa.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AS1001" {...field} disabled={isEdit || !!form.watch('category')} />
                  </FormControl>
                  <FormDescription>
                    {isEdit ? "Cannot change code for existing account." : "Generated based on category if not manually entered."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title of Account *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Bank Account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Right Column */}
            <FormField
              control={form.control}
              name="maxChildAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Child Accounts</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10 (0 for none)" {...field} 
                           value={field.value === undefined ? '' : field.value} // Handle undefined for input display
                           onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
                  </FormControl>
                   <FormDescription>
                    Maximum number of sub-accounts allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || '_NO_SUB_CATEGORY_'} disabled={!currentCategory || subCategoryOptions.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_NO_SUB_CATEGORY_">None</SelectItem>
                      {subCategoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isEdit ? 'Save Changes' : 'Create Account'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
