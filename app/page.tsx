
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Trophy, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto mb-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Business Simulation Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced business simulation platform for strategic decision-making training. 
            Engage in realistic business scenarios, compete with teams, and develop critical business skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="card-hover">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Team-Based Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Collaborate with teammates in group challenges, experience individual decision-making, 
                and navigate mixed scenarios that mirror real business environments.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Competitive Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track your progress with real-time leaderboards, earn points for strategic decisions, 
                and compete with peers in both individual and team categories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Real-Time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get instant feedback on your decisions, analyze performance metrics, 
                and learn from detailed case studies that enhance business acumen.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Info */}
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-900">Try the Demo</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-700 mb-4">
              Experience the platform with our demo accounts:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Admin Access:</strong> admin@business-sim.com / admin123</p>
              <p><strong>Student Access:</strong> alice@example.com / student123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
