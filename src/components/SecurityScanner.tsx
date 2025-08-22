
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Lock, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityResult {
  safeBrowsing: {
    status: 'safe' | 'unsafe' | 'unknown';
    details: string;
  };
  sslGrade: {
    grade: string;
    status: 'excellent' | 'good' | 'warning' | 'poor';
    details: string;
  };
}

const SecurityScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<SecurityResult | null>(null);
  const { toast } = useToast();

  const validateUrl = (inputUrl: string): string => {
    try {
      // Add protocol if missing
      if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
        inputUrl = 'https://' + inputUrl;
      }
      
      const urlObj = new URL(inputUrl);
      return urlObj.hostname;
    } catch {
      throw new Error('Please enter a valid URL');
    }
  };

  const checkSafeBrowsing = async (domain: string) => {
    // Simulating API call - in real implementation, this would go through a backend
    // to avoid CORS and API key exposure
    console.log('Checking Safe Browsing for:', domain);
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response - in real app, this would call the actual Google Safe Browsing API
    const mockSafeResults = ['google.com', 'github.com', 'stackoverflow.com'];
    const isSafe = mockSafeResults.some(safe => domain.includes(safe)) || Math.random() > 0.3;
    
    return {
      status: isSafe ? 'safe' : 'unsafe',
      details: isSafe ? 'No threats detected' : 'Potential security threats found'
    };
  };

  const checkSSL = async (domain: string) => {
    // Simulating SSL Labs API call
    console.log('Checking SSL for:', domain);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock SSL grades
    const grades = ['A+', 'A', 'A-', 'B', 'C', 'F'];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    
    let status: 'excellent' | 'good' | 'warning' | 'poor';
    if (grade.startsWith('A')) status = 'excellent';
    else if (grade === 'B') status = 'good';
    else if (grade === 'C') status = 'warning';
    else status = 'poor';
    
    return {
      grade,
      status,
      details: `SSL certificate grade: ${grade}`
    };
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to scan",
        variant: "destructive"
      });
      return;
    }

    try {
      const domain = validateUrl(url.trim());
      setIsScanning(true);
      setResults(null);

      // Run both scans concurrently
      const [safeBrowsingResult, sslResult] = await Promise.all([
        checkSafeBrowsing(domain),
        checkSSL(domain)
      ]);

      setResults({
        safeBrowsing: safeBrowsingResult,
        sslGrade: sslResult
      });

      toast({
        title: "Scan Complete",
        description: `Security scan completed for ${domain}`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan website",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'safe':
      case 'excellent':
        return 'status-badge-safe';
      case 'good':
      case 'warning':
        return 'status-badge-warning';
      default:
        return 'status-badge-danger';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Website Security Scanner</h1>
        </div>
        <p className="text-muted-foreground">
          Check any website for security threats and SSL certificate quality
        </p>
      </div>

      {/* Scanner Input */}
      <Card className="security-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="url"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && !isScanning && handleScan()}
              />
            </div>
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="scan-button h-12 px-8"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Scan Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isScanning && (
        <Card className="security-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-scan-pulse">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Security scan in progress...</p>
                <p className="text-sm text-muted-foreground">Checking for threats and SSL status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !isScanning && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Safe Browsing Results */}
          <Card className="security-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Safe Browsing
              </CardTitle>
              <CardDescription>
                Google Safe Browsing protection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.safeBrowsing.status)}
                  <span className="font-medium">
                    {results.safeBrowsing.status === 'safe' ? 'Safe' : 'Unsafe'}
                  </span>
                </div>
                <Badge className={`border ${getStatusBadgeClass(results.safeBrowsing.status)}`}>
                  {results.safeBrowsing.details}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* SSL Results */}
          <Card className="security-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                SSL Certificate
              </CardTitle>
              <CardDescription>
                SSL/TLS encryption quality rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.sslGrade.status)}
                  <span className="font-medium">Grade {results.sslGrade.grade}</span>
                </div>
                <Badge className={`border ${getStatusBadgeClass(results.sslGrade.status)}`}>
                  {results.sslGrade.status.charAt(0).toUpperCase() + results.sslGrade.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityScanner;
