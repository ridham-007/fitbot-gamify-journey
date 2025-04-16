
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';

const Settings = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/settings' } });
    }
  }, [isLoggedIn, navigate]);

  return (
    <MainLayout isLoggedIn={isLoggedIn}>
      <div className="bg-gray-50 dark:bg-fitDark-900 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-fitDark-900 dark:text-white mb-8">Account Settings</h1>

          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecuritySettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
