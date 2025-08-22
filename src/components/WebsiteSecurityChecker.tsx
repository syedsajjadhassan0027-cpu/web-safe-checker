import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Globe, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThreatMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threat: {
    url: string;
  };
}

interface SafeBrowsingResponse {
  matches?: ThreatMatch[];
}

const WebsiteSecurityChecker = () => {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ safe: boolean; threats?: string[] } | null>(null);
  const { toast } = useToast();

  const validateUrl = (inputUrl: string): string => {
    try {
      // Add protocol if missing
      if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
        inputUrl = 'https://' + inputUrl;
      }
      
      const urlObj = new URL(inputUrl);
      return urlObj.href;
    } catch {
      throw new Error('Please enter a valid URL');
    }
  };

  const checkSafety = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to check",
        variant: "destructive"
      });
      return;
    }

    try {
      const validatedUrl = validateUrl(url.trim());
      setIsChecking(true);
      setResult(null);

      const response = await fetch(
        'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyD_GxjfRfXOdQydi1yETvz-YQQkh7sUBTk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: {
              clientId: 'web-safe-checker',
              clientVersion: '1.0'
            },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [
                { url: validatedUrl }
              ]
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SafeBrowsingResponse = await response.json();

      if (!data.matches || data.matches.length === 0) {
        setResult({ safe: true });
        toast({
          title: "Scan Complete",
          description: "Website is safe to visit",
        });
      } else {
        const threats = data.matches.map(match => match.threatType);
        setResult({ safe: false, threats });
        toast({
          title: "Security Warning",
          description: "Potential threats detected",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Security check error:', error);
      
      // Handle CORS or API errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to security service. This may be due to CORS restrictions.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check Failed",
          description: error instanceof Error ? error.message : "Failed to check website safety",
          variant: "destructive"
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isChecking) {
      checkSafety();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Main Card */}
        <Card className="security-main-card">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-3">
              Website Safety Scanner
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Check if a website is safe using Google Safe Browsing API
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="url"
                  placeholder="Enter website URL (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="security-input pl-12"
                  disabled={isChecking}
                />
              </div>
              
              <Button 
                onClick={checkSafety}
                disabled={isChecking}
                className="security-button w-full"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Checking Safety...
                  </>
                ) : (
                  <>
                    <Shield className="mr-3 h-5 w-5" />
                    Check Safety
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isChecking && (
          <Card className="security-main-card fade-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-pulse">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-primary">Scanning website...</p>
                  <p className="text-muted-foreground">Checking for security threats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isChecking && (
          <Card className={`fade-in ${result.safe ? 'result-card-safe' : 'result-card-unsafe'}`}>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  {result.safe ? (
                    <div className="p-4 rounded-full bg-success/20">
                      <CheckCircle className="h-12 w-12 text-success" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-full bg-destructive/20">
                      <XCircle className="h-12 w-12 text-destructive" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${result.safe ? 'text-success' : 'text-destructive'}`}>
                    {result.safe ? '✅ This website is safe.' : '❌ This website is unsafe.'}
                  </h3>
                  
                  {result.safe ? (
                    <p className="text-muted-foreground">
                      No security threats detected by Google Safe Browsing.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-muted-foreground">
                        The following security threats were detected:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.threats?.map((threat, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {threat.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebsiteSecurityChecker;