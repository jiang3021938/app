import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-800">LeaseLenses</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: February 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LeaseLenses ("the Service"), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Service Description</h2>
            <p>
              LeaseLenses provides an AI-powered lease document analysis platform. Our service
              uses artificial intelligence to extract key terms, identify potential risks, and
              generate compliance reports from residential and commercial lease agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Important Disclaimer — Not Legal Advice</h2>
            <p>
              <strong>
                LeaseLenses is an informational tool only and does not provide legal advice.
              </strong>{" "}
              The analysis, risk assessments, compliance checks, and any other outputs generated
              by our AI are for informational purposes only and should not be relied upon as a
              substitute for professional legal counsel. We strongly recommend consulting a
              qualified attorney for any legal questions or decisions related to your lease
              agreements.
            </p>
            <p>
              LeaseLenses makes no representations or warranties regarding the accuracy,
              completeness, or legal validity of any analysis provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must provide accurate and
              complete information when creating your account. You agree to notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must have the legal right to upload any documents you submit for analysis.</li>
              <li>You are responsible for ensuring uploaded documents do not contain malicious content.</li>
              <li>You agree not to use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>You agree not to attempt to reverse-engineer, decompile, or interfere with the Service.</li>
              <li>You must not share your account credentials with third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Payment Terms</h2>
            <p>
              LeaseLenses offers both one-time purchases and subscription plans. All payments are
              processed securely through Stripe.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>One-time purchases:</strong> Analysis credits are non-refundable once used. Unused credits do not expire.</li>
              <li><strong>Subscriptions:</strong> Monthly subscriptions renew automatically until cancelled. You may cancel at any time, and your access will continue until the end of the current billing period.</li>
              <li><strong>Refunds:</strong> Refund requests for unused credits may be considered on a case-by-case basis within 14 days of purchase.</li>
              <li><strong>Price changes:</strong> We reserve the right to modify pricing with reasonable notice to existing subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Intellectual Property</h2>
            <p>
              The Service, including its software, design, logos, and content, is owned by
              LeaseLenses and is protected by intellectual property laws. You retain ownership of
              all documents you upload. By using the Service, you grant us a limited license to
              process your documents solely for the purpose of providing our analysis service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, LeaseLenses shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but not
              limited to loss of profits, data, or business opportunities, arising out of or related
              to your use of the Service.
            </p>
            <p>
              Our total liability for any claims arising under these Terms shall not exceed the
              amount you paid to LeaseLenses in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time,
              with or without cause, and with or without notice. Upon termination, your right to
              use the Service ceases immediately. You may also delete your account at any time.
            </p>
            <p>
              Provisions that by their nature should survive termination (including disclaimers,
              limitations of liability, and intellectual property) shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">10. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at
              any time. We will make reasonable efforts to notify users of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States. Any disputes arising from these Terms shall be resolved through
              binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{" "}
              <a href="mailto:hotogems@gmail.com" className="text-blue-600 hover:underline">
                hotogems@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © 2026 LeaseLenses. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
