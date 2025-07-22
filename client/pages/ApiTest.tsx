import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { apiService } from "@/lib/api";

export default function ApiTest() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    setResults(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      test,
      success,
      data,
      error
    }, ...prev]);
  };

  const testUpgradeAPI = async () => {
    setLoading(true);
    try {
      const response = await apiService.upgradeSubscription('PREMIUM');
      addResult('Upgrade Subscription', response.success, response.data, response.message);
    } catch (error: any) {
      addResult('Upgrade Subscription', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testEmailNotification = async () => {
    setLoading(true);
    try {
      const response = await apiService.testNotification('EMAIL');
      addResult('Email Notification', response.success, response.data, response.message);
    } catch (error: any) {
      addResult('Email Notification', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await apiService.updateProfile({
        fullName: 'Test User',
        phone: '09123456789'
      });
      addResult('Profile Update', response.success, response.data, response.message);
    } catch (error: any) {
      addResult('Profile Update', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCurrentUser = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCurrentUser();
      addResult('Get Current User', response.success, response.data, response.message);
    } catch (error: any) {
      addResult('Get Current User', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={testCurrentUser} disabled={loading}>
                Test Current User
              </Button>
              <Button onClick={testProfileUpdate} disabled={loading}>
                Test Profile Update
              </Button>
              <Button onClick={testEmailNotification} disabled={loading}>
                Test Email
              </Button>
              <Button onClick={testUpgradeAPI} disabled={loading}>
                Test Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className={`p-4 border rounded-lg ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    Status: {result.success ? 'Success' : 'Failed'}
                  </div>
                  {result.error && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  {result.data && (
                    <div className="text-sm text-gray-600 mt-1">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-center text-gray-500">
                  No tests run yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
