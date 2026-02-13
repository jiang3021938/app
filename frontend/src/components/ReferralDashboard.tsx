import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Copy, Gift, TrendingUp } from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  creditsEarned: number;
  pendingReferrals: number;
}

export function ReferralDashboard() {
  // TODO: Backend Integration Required
  // In production, these stats should come from API endpoint (GET /api/referrals/stats)
  // The referral code should be unique per user and fetched from user profile
  const [stats] = useState<ReferralStats>({
    totalReferrals: 3,
    successfulReferrals: 2,
    creditsEarned: 4,
    pendingReferrals: 1,
  });

  // TODO: Backend Integration Required
  // Generate unique referral code per user from backend
  // Example API: GET /api/user/referral-code
  // This should be based on user ID, e.g., "LEASE-{userID}-{hash}"
  const referralCode = "LEASE-ABC123"; // Placeholder - replace with dynamic code
  const referralUrl = `https://www.leaselenses.com/register?ref=${referralCode}`;

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Referral link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            <CardTitle>Referral Program</CardTitle>
          </div>
          <CardDescription>
            Invite friends and both get 2 free analysis credits!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm font-medium mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <Input
                value={referralUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm font-medium mb-2">Your Referral Code</p>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-sm text-lg font-bold"
              />
              <Button onClick={copyReferralCode} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <p className="font-semibold text-purple-900">How it works:</p>
            </div>
            <ol className="text-sm text-purple-900 space-y-1 ml-7">
              <li>1. Share your referral link with friends</li>
              <li>2. They sign up and get 2 free credits</li>
              <li>3. You get 2 free credits per referral</li>
              <li>4. No limit on referrals!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl">{stats.totalReferrals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Keep sharing!</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Successful Referrals</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.successfulReferrals}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={stats.totalReferrals > 0 ? (stats.successfulReferrals / stats.totalReferrals) * 100 : 0} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Credits Earned</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {stats.creditsEarned}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>Ready to use</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Referrals</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {stats.pendingReferrals}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">
              Awaiting signup
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Track your referral progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Sample referral items - in production, this would come from an API */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">John D.</p>
                  <p className="text-sm text-muted-foreground">Signed up 2 days ago</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">+2 credits</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Sarah M.</p>
                  <p className="text-sm text-muted-foreground">Signed up 5 days ago</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">+2 credits</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Mike R.</p>
                  <p className="text-sm text-muted-foreground">Invited 1 week ago</p>
                </div>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
