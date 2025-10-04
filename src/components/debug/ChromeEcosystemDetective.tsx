import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Chrome,
  Search,
  Settings,
  Shield,
  Target,
  Zap,
  FileX,
  MonitorSpeaker
} from 'lucide-react';

interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  permissions: string[];
  filesystemAccess: boolean;
  errorProbability: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  conflictsWith: string[];
}

interface DiagnosticResult {
  status: 'scanning' | 'analyzing' | 'complete' | 'error';
  progress: number;
  culprits: ExtensionInfo[];
  fixes: Fix[];
  cleanConsoleScore: number;
}

interface Fix {
  type: 'chrome-flag' | 'extension-disable' | 'profile-setting' | 'environment-config';
  title: string;
  description: string;
  command?: string;
  priority: 'immediate' | 'recommended' | 'optional';
  estimatedTime: string;
  applied: boolean;
}

const ChromeEcosystemDetective: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult>({
    status: 'complete',
    progress: 0,
    culprits: [],
    fixes: [],
    cleanConsoleScore: 0
  });

  // Mock Chrome extension data - In real implementation, this would scan actual Chrome extensions
  const mockExtensions: ExtensionInfo[] = [
    {
      id: 'gighmmpiobklfepjocnamgkkbiglidom',
      name: 'AdBlock',
      version: '5.17.0',
      enabled: true,
      permissions: ['storage', 'tabs', 'webNavigation'],
      filesystemAccess: true,
      errorProbability: 'high',
      description: 'Known to cause filesystem errors with React dev servers',
      conflictsWith: ['React DevTools', 'Vite HMR']
    },
    {
      id: 'fmkadmapgofadopljbjfkapdkoienihi',
      name: 'React Developer Tools',
      version: '4.28.5',
      enabled: true,
      permissions: ['storage', 'tabs'],
      filesystemAccess: false,
      errorProbability: 'low',
      description: 'Generally safe for development',
      conflictsWith: []
    },
    {
      id: 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
      name: 'Phantom Wallet',
      version: '22.17.15',
      enabled: true,
      permissions: ['storage', 'activeTab', 'scripting'],
      filesystemAccess: true,
      errorProbability: 'critical',
      description: 'Crypto wallet causing heavy filesystem write operations',
      conflictsWith: ['Any development server']
    }
  ];

  const mockFixes: Fix[] = [
    {
      type: 'chrome-flag',
      title: 'Disable Extension File Access Check',
      description: 'Launch Chrome with --disable-extensions-file-access-check flag',
      command: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --disable-extensions-file-access-check',
      priority: 'immediate',
      estimatedTime: '30 seconds',
      applied: false
    },
    {
      type: 'extension-disable',
      title: 'Disable Phantom Wallet During Development',
      description: 'Temporarily disable crypto wallet to eliminate filesystem conflicts',
      priority: 'immediate',
      estimatedTime: '15 seconds',
      applied: false
    },
    {
      type: 'profile-setting',
      title: 'Create Development Profile',
      description: 'Set up a dedicated Chrome profile with minimal extensions for clean development',
      priority: 'recommended',
      estimatedTime: '5 minutes',
      applied: false
    },
    {
      type: 'environment-config',
      title: 'Configure Vite for Extension Compatibility',
      description: 'Update vite.config.ts with extension-safe settings',
      command: 'npm run chrome-detective:configure-vite',
      priority: 'recommended',
      estimatedTime: '2 minutes',
      applied: false
    }
  ];

  const startDiagnostic = async () => {
    setIsScanning(true);
    setDiagnostic({
      status: 'scanning',
      progress: 0,
      culprits: [],
      fixes: [],
      cleanConsoleScore: 0
    });

    // Simulate scanning process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDiagnostic(prev => ({
        ...prev,
        progress: i,
        status: i < 50 ? 'scanning' : i < 90 ? 'analyzing' : 'complete'
      }));
    }

    // Set final results
    setDiagnostic({
      status: 'complete',
      progress: 100,
      culprits: mockExtensions.filter(ext => ext.errorProbability === 'high' || ext.errorProbability === 'critical'),
      fixes: mockFixes,
      cleanConsoleScore: 25 // Poor score due to extension conflicts
    });

    setIsScanning(false);
  };

  const applyFix = (fixIndex: number) => {
    setDiagnostic(prev => ({
      ...prev,
      fixes: prev.fixes.map((fix, index) =>
        index === fixIndex ? { ...fix, applied: true } : fix
      ),
      cleanConsoleScore: Math.min(100, prev.cleanConsoleScore + 25)
    }));
  };

  const getErrorProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (diagnostic.status) {
      case 'scanning':
        return <Search className="h-4 w-4 animate-spin" />;
      case 'analyzing':
        return <Target className="h-4 w-4 animate-pulse" />;
      case 'complete':
        return diagnostic.culprits.length > 0 ?
          <AlertTriangle className="h-4 w-4 text-orange-500" /> :
          <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Chrome className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Chrome className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Chrome Ecosystem Detective</h1>
          <p className="text-gray-600">Diagnose and eliminate Chrome extension filesystem errors</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            System Diagnostic
          </CardTitle>
          <CardDescription>
            Scanning for Chrome extensions causing filesystem conflicts with React/Vite development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostic.status !== 'complete' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{diagnostic.progress}%</span>
              </div>
              <Progress value={diagnostic.progress} className="w-full" />
              <p className="text-sm text-gray-600 capitalize">
                {diagnostic.status === 'scanning' && 'Scanning Chrome extensions...'}
                {diagnostic.status === 'analyzing' && 'Analyzing filesystem conflicts...'}
              </p>
            </div>
          )}

          {diagnostic.status === 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{diagnostic.cleanConsoleScore}%</div>
                  <div className="text-sm text-gray-600">Console Cleanliness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{diagnostic.culprits.length}</div>
                  <div className="text-sm text-gray-600">Problematic Extensions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{diagnostic.fixes.length}</div>
                  <div className="text-sm text-gray-600">Available Fixes</div>
                </div>
              </div>

              {diagnostic.cleanConsoleScore < 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Development Environment Issues Detected</AlertTitle>
                  <AlertDescription>
                    Chrome extensions are causing filesystem errors that pollute your development console.
                    Apply the recommended fixes below for a clean development experience.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={startDiagnostic}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Run Diagnostic'}
            </Button>
            {diagnostic.status === 'complete' && diagnostic.culprits.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  diagnostic.fixes.forEach((_, index) => applyFix(index));
                }}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Apply All Fixes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {diagnostic.status === 'complete' && (
        <Tabs defaultValue="culprits" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="culprits">Problematic Extensions</TabsTrigger>
            <TabsTrigger value="fixes">Recommended Fixes</TabsTrigger>
            <TabsTrigger value="all-extensions">All Extensions</TabsTrigger>
          </TabsList>

          <TabsContent value="culprits" className="space-y-4">
            {diagnostic.culprits.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="text-lg font-semibold">No Critical Issues Found</h3>
                    <p className="text-gray-600">Your Chrome extensions appear to be development-friendly!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              diagnostic.culprits.map((extension) => (
                <Card key={extension.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileX className="h-5 w-5 text-red-500" />
                        {extension.name}
                      </CardTitle>
                      <Badge variant={getErrorProbabilityColor(extension.errorProbability)}>
                        {extension.errorProbability} risk
                      </Badge>
                    </div>
                    <CardDescription>{extension.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Version:</span>
                        <span>{extension.version}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Filesystem Access:</span>
                        <Badge variant={extension.filesystemAccess ? 'destructive' : 'default'}>
                          {extension.filesystemAccess ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {extension.conflictsWith.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Conflicts with:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extension.conflictsWith.map((conflict, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {conflict}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="fixes" className="space-y-4">
            {diagnostic.fixes.map((fix, index) => (
              <Card key={index} className={fix.applied ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {fix.applied ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Settings className="h-5 w-5" />
                      )}
                      {fix.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        fix.priority === 'immediate' ? 'destructive' :
                        fix.priority === 'recommended' ? 'secondary' : 'outline'
                      }>
                        {fix.priority}
                      </Badge>
                      <span className="text-sm text-gray-600">{fix.estimatedTime}</span>
                    </div>
                  </div>
                  <CardDescription>{fix.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {fix.command && (
                    <div className="bg-gray-100 p-3 rounded-md font-mono text-sm mb-3">
                      {fix.command}
                    </div>
                  )}
                  <Button
                    onClick={() => applyFix(index)}
                    disabled={fix.applied}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {fix.applied ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Apply Fix
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all-extensions" className="space-y-4">
            {mockExtensions.map((extension) => (
              <Card key={extension.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {extension.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={extension.enabled ? 'default' : 'secondary'}>
                        {extension.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Badge variant={getErrorProbabilityColor(extension.errorProbability)}>
                        {extension.errorProbability} risk
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{extension.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Version:</span> {extension.version}
                    </div>
                    <div>
                      <span className="font-medium">Filesystem Access:</span>
                      <Badge variant={extension.filesystemAccess ? 'destructive' : 'default'} className="ml-2">
                        {extension.filesystemAccess ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  {extension.permissions.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Permissions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extension.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ChromeEcosystemDetective;