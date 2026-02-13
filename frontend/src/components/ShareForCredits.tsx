import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share2, Twitter, Facebook, Linkedin, Link2, Gift } from "lucide-react";

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
          toast.success("Link copied to clipboard! Share it to earn 1 free credit.");
          return;
        } catch (err) {
          toast.error("Failed to copy link");
          return;
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      // Simulate credit reward - in production, this would call an API
      setTimeout(() => {
        toast.success("🎉 Thanks for sharing! You've earned 1 free credit!", {
          description: "Your credit will be added to your account shortly."
        });
        setIsOpen(false);
      }, 2000);
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
            Share LeaseLenses on social media and get 1 free analysis credit!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-[100px]"
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
            Share on any platform to earn your credit!
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
            Share LeaseLenses on social media and get 1 free analysis credit!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
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
              💡 <strong>Pro tip:</strong> Earned credits never expire and can be used anytime!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
