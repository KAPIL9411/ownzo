import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Ownzo',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using Ownzo, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
          If you do not agree with any of these terms, you are prohibited from using this platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 18 years old to use Ownzo. By using our platform, you represent and warrant that you meet this requirement.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. User Accounts</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You are responsible for all activities that occur under your account</li>
          <li>You must provide accurate and complete information</li>
          <li>You must notify us immediately of any unauthorized use of your account</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
        <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Post false, misleading, or fraudulent listings</li>
          <li>Sell prohibited, illegal, or counterfeit items</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Use automated systems (bots, scrapers) without permission</li>
          <li>Circumvent security features or access control measures</li>
          <li>Interfere with the proper functioning of the platform</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. Listings and Transactions</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>You are solely responsible for the accuracy of your listings</li>
          <li>You must honor the terms you set in your listings</li>
          <li>Transactions are conducted directly between users</li>
          <li>Ownzo is not a party to any transaction and does not guarantee items or payments</li>
          <li>You are responsible for any applicable taxes</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">6. Content Ownership and License</h2>
        <p className="text-muted-foreground leading-relaxed">
          You retain ownership of content you post. However, by posting content on Ownzo, you grant us a worldwide, 
          non-exclusive, royalty-free license to use, reproduce, modify, and display your content for the purpose of 
          operating and promoting our services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">7. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Ownzo platform, including its design, features, and content, is protected by copyright, trademark, and other 
          intellectual property laws. You may not copy, modify, or distribute our content without permission.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">8. Disclaimer of Warranties</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ownzo is provided "as is" without warranties of any kind. We do not guarantee that the platform will be 
          error-free, secure, or uninterrupted. We disclaim all warranties, express or implied, including warranties 
          of merchantability and fitness for a particular purpose.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">9. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          To the maximum extent permitted by law, Ownzo shall not be liable for any indirect, incidental, special, 
          consequential, or punitive damages arising from your use of the platform. Our total liability shall not 
          exceed the amount you paid to us in the past 12 months (if any).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">10. Indemnification</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree to indemnify and hold Ownzo harmless from any claims, damages, or expenses arising from your 
          use of the platform, your violation of these terms, or your violation of any rights of another.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">11. Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your access to Ownzo at any time, with or without notice, 
          for any reason, including violation of these terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">12. Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may modify these terms at any time. We will notify you of significant changes. Your continued use of 
          the platform after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">13. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These terms shall be governed by the laws of India. Any disputes shall be resolved in the courts of [Your City].
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">14. Contact Information</h2>
        <div className="bg-muted p-4 rounded-lg space-y-1">
          <p className="font-semibold">Ownzo Support</p>
          <p className="text-sm">Email: legal@ownzo.in</p>
          <p className="text-sm">Address: [Your Address]</p>
        </div>
      </section>
    </div>
  )
}
