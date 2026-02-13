import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: February 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Introduction</h2>
            <p>
              LeaseLenses ("we," "us," or "our") operates the LeaseLenses platform, an AI-powered
              lease document analysis service. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials provided through Google OAuth.</p>
            <p><strong>Uploaded Documents:</strong> We process the lease documents you upload for AI analysis. Documents are stored temporarily for analysis purposes and to enable features like PDF preview and source tracing.</p>
            <p><strong>Payment Information:</strong> When you purchase credits or subscriptions, payment is processed securely through Stripe. We do not store your full credit card number on our servers.</p>
            <p><strong>Usage Data:</strong> We automatically collect information about how you interact with our service, including pages visited, features used, and analysis history.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our AI lease analysis service</li>
              <li>To process your uploaded documents and generate analysis reports</li>
              <li>To process payments and manage your subscription</li>
              <li>To communicate with you about your account and service updates</li>
              <li>To improve our service and develop new features</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate our platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google OAuth:</strong> For secure user authentication. Google may collect information as described in their privacy policy.</li>
              <li><strong>Stripe:</strong> For payment processing. Stripe handles your payment information in accordance with their privacy policy and PCI compliance standards.</li>
              <li><strong>Google Gemini AI:</strong> For document analysis and data extraction. Uploaded document content is sent to Google's Gemini API for processing. Google's data usage policies apply to this processing.</li>
              <li><strong>Supabase:</strong> For data storage and authentication infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and authentication state.
              We may also use analytics cookies to understand how our service is used.
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              encryption in transit (TLS/SSL), secure authentication, and access controls.
              However, no method of electronic transmission or storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active.
              Uploaded documents and analysis results are retained to provide ongoing access
              to your reports. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request portability of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Children's Privacy</h2>
            <p>
              Our service is not intended for individuals under the age of 18. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at:{" "}
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
