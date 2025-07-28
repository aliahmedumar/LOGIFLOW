
// src/app/dashboard/settings/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
          Settings
        </h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground font-headline">
              Application Settings
            </CardTitle>
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is where application settings will be managed. More options will be available here soon.
          </p>
          {/* Placeholder for future settings options */}
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Theme</h3>
              <p className="text-sm text-muted-foreground">Theme customization options will be here.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Notification preferences will be configured here.</p>
            </div>
             <div>
              <h3 className="text-lg font-medium text-foreground">Account</h3>
              <p className="text-sm text-muted-foreground">Manage your account details and preferences.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
