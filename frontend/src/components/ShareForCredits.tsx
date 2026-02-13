import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share2, Twitter, Facebook, Linkedin, Link2, Gift } from "lucide-react";
import { apiCall } from "@/lib/api";

interface ShareForCreditsProps {
  variant?: "button" | "card";
  message?: string;
  url?: string;
}

export function ShareForCredits({ 
  variant = "button", 
  message = "Check out LeaseLenses - AI-powered lease agreement analysis! Get instant risk assessment and key term extraction.",
  url = "https://www.leaselenses.com"
}: ShareForCreditsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recordShareCredit = async (platform: string) => {
    try {
      setIsLoading(true);
      const response = await apiCall({
        url: "/api/v1/lease/record-share",
        method: "POST",
        data: { platform },
      });
      const data = response.data as {
        success: boolean;
        credits_awarded: number;
        share_credits_remaining: number;
        message?: string;
      };
      if (data.success) {
        toast.success("🎉 Thanks for sharing! You've earned 1 free credit!", {
          description: `You have ${data.share_credits_remaining} share credit(s) remaining.`,
        });
      } else {
        toast.info(data.message || "You've reached the maximum share credits.", {
          description: "You can still earn credits by inviting friends!",
        });
      }
    } catch {
      toast.error("Failed to record share credit. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleShare = async (platform: string) => {
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
          return;
        } catch {
          toast.error("Failed to copy link");
          return;
        }
    }

    if (shareUrl) {
      const popup = window.open(shareUrl, "_blank", "width=600,height=400");
      
      // Monitor popup close to confirm user interacted with the share dialog
      if (popup) {
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            recordShareCredit(platform);
          }
        }, 500);
        // Safety timeout: stop checking after 5 minutes
        setTimeout(() => clearInterval(checkPopup), 300000);
      } else {
        // Popup was blocked - still record credit since user intended to share
        recordShareCredit(platform);
      }
    }
  };

  if (variant === "card") {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Earn Free Credits</CardTitle>
          </div>
          <CardDescription>
            Share LeaseLenses on social media and get 1 free analysis credit! (up to 4 credits)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              disabled={isLoading}
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              disabled={isLoading}
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              disabled={isLoading}
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              onClick={() => handleShare("copy")}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Share on any platform to earn your credit! (max 4 from sharing)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share & Earn Credit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share & Earn Free Credit</DialogTitle>
          <DialogDescription>
            Share LeaseLenses on social media and get 1 free analysis credit! (up to 4 credits)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={isLoading}
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={isLoading}
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={isLoading}
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Share on LinkedIn
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleShare("copy")}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              💡 <strong>Pro tip:</strong> Earned credits never expire and can be used anytime! You can earn up to 4 credits from sharing.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
