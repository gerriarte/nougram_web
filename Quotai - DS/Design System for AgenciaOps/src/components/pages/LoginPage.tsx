import { useState } from 'react';
import { DollarSign, Loader } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white rounded-xl p-8"
        style={{ boxShadow: 'var(--elevation-8)' }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-500 mb-4">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-grey-900 mb-2">Welcome to Nougram</h1>
          <p className="text-grey-600">Sign in to manage your creative agency quotes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-50 border border-error-500 text-error-700">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-grey-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-grey-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-primary-500 hover:bg-primary-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center">
            <a href="#" className="text-primary-500 hover:text-primary-700">
              Forgot password?
            </a>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-info-50 rounded-lg">
          <p className="text-info-700 text-xs text-center">
            Demo: Enter any email and password to continue
          </p>
        </div>
      </div>
    </div>
  );
}
