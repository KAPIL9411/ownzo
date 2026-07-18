import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Ownzo collects, uses, and protects your data',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Ownzo ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
          This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Information We Collect</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Account information (name, email, phone number)</li>
              <li>Profile information (photo, bio, location)</li>
              <li>Listing details (title, description, images, price)</li>
              <li>Messages and communications</li>
              <li>Transaction information</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Device information (IP address, browser type, device type)</li>
              <li>Usage data (pages viewed, time spent, clicks)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>To provide, maintain, and improve our services</li>
          <li>To create and manage your account</li>
          <li>To facilitate transactions between users</li>
          <li>To send you notifications and updates</li>
          <li>To prevent fraud and ensure platform security</li>
          <li>To analyze usage and improve user experience</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Information Sharing</h2>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell your personal information. We may share your information only in the following circumstances:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li><strong>With other users:</strong> Your profile and listings are visible to other users</li>
          <li><strong>With service providers:</strong> Firebase, Cloudinary, and email services</li>
          <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
          <li><strong>With your consent:</strong> When you explicitly agree to share</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement appropriate technical and organizational measures to protect your data, including encryption, 
          secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">6. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Export your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">7. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your personal data for as long as necessary to provide our services and comply with legal obligations. 
          When you delete your account, we will delete or anonymize your data within 30 days.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">8. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">9. Children's Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our services are intended for users 18 years and older. We do not knowingly collect data from children under 18.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">10. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this privacy policy from time to time. We will notify you of significant changes via email or platform notification.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">11. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about this privacy policy or our data practices, please contact us at:
        </p>
        <div className="bg-muted p-4 rounded-lg space-y-1">
          <p className="font-semibold">Ownzo Support</p>
          <p className="text-sm">Email: privacy@ownzo.in</p>
          <p className="text-sm">Address: [Your Address]</p>
        </div>
      </section>
    </div>
  )
}
