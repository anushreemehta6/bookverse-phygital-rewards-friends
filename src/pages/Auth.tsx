import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Book, Wallet, Bug } from 'lucide-react';

const Auth = () => {
  // Separate state for signin and signup forms
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: '',
    error: '',
    loading: false
  });
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    username: '',
    error: '',
    loading: false,
    success: ''
  });
  
  const [activeTab, setActiveTab] = useState('signin');
  const [showDebug, setShowDebug] = useState(false);
  const { signUp, signIn, user, testConnection } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSignupForm(prev => ({ ...prev, loading: true, error: '' }));

    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.username);
    
    if (error) {
      setSignupForm(prev => ({ ...prev, error: error.message, loading: false, success: '' }));
    } else {
      // Success - show success message and keep form for reference
      setSignupForm(prev => ({ 
        ...prev, 
        loading: false, 
        error: '',
        success: 'Account created successfully! Please check your email for a verification link before signing in.'
      }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSigninForm(prev => ({ ...prev, loading: true, error: '' }));

    const { error } = await signIn(signinForm.email, signinForm.password);
    
    if (error) {
      setSigninForm(prev => ({ ...prev, error: error.message, loading: false }));
    } else {
      // Success - clear form
      setSigninForm({
        email: '',
        password: '',
        error: '',
        loading: false
      });
    }
  };

  // Clear errors when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSigninForm(prev => ({ ...prev, error: '' }));
    setSignupForm(prev => ({ ...prev, error: '', success: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">BookVerse</span>
          </div>
          <p className="text-muted-foreground">Join the community where books meet NFTs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to BookVerse</CardTitle>
            <CardDescription className="text-center">
              Connect your wallet and start earning NFT rewards for reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signinForm.email}
                      onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={signinForm.loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signinForm.password}
                      onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={signinForm.loading}
                    />
                  </div>
                  {signinForm.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{signinForm.error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={signinForm.loading}>
                    <Wallet className="w-4 h-4 mr-2" />
                    {signinForm.loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                      minLength={3}
                      disabled={signupForm.loading}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={signupForm.loading}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                      disabled={signupForm.loading}
                      placeholder="Enter your password (min 6 characters)"
                    />
                  </div>
                  {signupForm.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{signupForm.error}</AlertDescription>
                    </Alert>
                  )}
                  {signupForm.success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{signupForm.success}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={signupForm.loading}>
                    <Wallet className="w-4 h-4 mr-2" />
                    {signupForm.loading ? 'Creating Account...' : 'Join BookVerse'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4" />
                Debug Panel
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showDebug && (
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Common Issues:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>If signup works but signin fails: Check your email for a verification link</li>
                  <li>If getting "Invalid credentials": User might not exist or email not verified</li>
                  <li>Try creating a new account first, then check email before signing in</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  className="w-full"
                >
                  Test Supabase Connection
                </Button>
                <p className="text-xs text-muted-foreground">
                  Check browser console (F12) for detailed logs and errors
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;