import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Mail, FileText, CheckCircle } from "lucide-react";

interface EmailCaptureProps {
  resourceTitle: string;
  resourceDescription: string;
  downloadUrl: string;
  triggerVariant?: "button" | "link";
}

export function EmailCaptureForm({ 
  resourceTitle, 
  resourceDescription,
  downloadUrl,
  triggerVariant = "button"
}: EmailCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - in production, this would save the email to your mailing list
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Download the file
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${resourceTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Success! Your download should start shortly.", {
        description: "Check your email for the resource and more landlord tips!"
      });

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setEmail("");
      }, 2000);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "button" ? (
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download Free PDF
          </Button>
        ) : (
          <button className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1">
            <Download className="h-3 w-3" />
            Download Free PDF
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {resourceTitle}
              </DialogTitle>
              <DialogDescription>
                {resourceDescription}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send you the PDF and occasional landlord tips. Unsubscribe anytime.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  📧 <strong>What you'll get:</strong>
                </p>
                <ul className="text-sm text-blue-900 mt-2 space-y-1 ml-4">
                  <li>• Instant PDF download</li>
                  <li>• Weekly landlord tips & guides</li>
                  <li>• State-specific law updates</li>
                  <li>• Exclusive templates & resources</li>
                </ul>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Get Free PDF
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Download Starting!</h3>
            <p className="text-muted-foreground">
              Check your email for the resource and more tips.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Pre-configured components for common resources
export function LeaseChecklistDownload() {
  return (
    <EmailCaptureForm
      resourceTitle="Lease Review Checklist"
      resourceDescription="A comprehensive 25-point checklist to review any lease agreement. Never miss critical clauses again!"
      downloadUrl="/downloads/lease-review-checklist.pdf"
    />
  );
}

export function StateComplianceGuideDownload() {
  return (
    <EmailCaptureForm
      resourceTitle="State-by-State Compliance Guide"
      resourceDescription="Security deposits, notice periods, and required disclosures for all 50 states."
      downloadUrl="/downloads/state-compliance-guide.pdf"
    />
  );
}

export function LeaseTemplateDownload() {
  return (
    <EmailCaptureForm
      resourceTitle="Free Lease Template"
      resourceDescription="A professionally drafted residential lease template that you can customize for your property."
      downloadUrl="/downloads/residential-lease-template.pdf"
    />
  );
}
