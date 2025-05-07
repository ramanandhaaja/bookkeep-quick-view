
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const Settings = () => {
  const [companyName, setCompanyName] = useState("BookKeep Inc.");
  const [email, setEmail] = useState("admin@bookkeep.com");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [address, setAddress] = useState("123 Accounting St, Finance City, FC 12345");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <Layout
      title="Settings"
      subtitle="Manage your account and application preferences"
    >
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value="••••••••" readOnly />
              <p className="text-sm text-muted-foreground">
                Last changed 3 months ago.
              </p>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="company" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input 
                id="company-phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Input 
                id="company-address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  Logo
                </div>
                <Button variant="outline">Upload</Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <div className="max-w-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new transactions and reports
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme throughout the application
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes to forms
                  </p>
                </div>
                <Switch 
                  id="auto-save" 
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <div className="max-w-xl">
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Payment Gateway</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your payment processor to accept online payments
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Email Marketing</h3>
                    <p className="text-sm text-muted-foreground">
                      Sync your contacts with email marketing platforms
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Cloud Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Back up your data to cloud storage providers
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
