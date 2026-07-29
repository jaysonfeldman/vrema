import { LegalPage } from '@/components/LegalPage';

const EFFECTIVE_DATE = '29 July 2026';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <section className="space-y-3">
        <p>
          This Privacy Policy explains how Jayson Feldman (“we”, “us”, or “our”) collects, uses,
          stores, and shares information when you use Vrema (the “Service”) at{' '}
          <a
            href="https://vrema.dev/"
            className="underline underline-offset-2 hover:text-neutral-950"
          >
            https://vrema.dev/
          </a>
          .
        </p>
        <p>
          Vrema helps you track time from Google Calendar. We designed the Service to process as
          little personal data as needed for that purpose.
        </p>
      </section>

      <section className="space-y-3">
        <h2>1. Who is responsible</h2>
        <p>
          The data controller for the Service is Jayson Feldman, located in the Netherlands.
        </p>
        <p>
          Privacy contact:{' '}
          <a
            href="mailto:jaysonfeldman@gmail.com"
            className="underline underline-offset-2 hover:text-neutral-950"
          >
            jaysonfeldman@gmail.com
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Information we collect</h2>
        <p>Depending on how you use Vrema, we may process the following categories of data:</p>

        <p>
          <strong>Google account information.</strong> When you sign in with Google, we receive your
          Google user ID, name, email address, and profile picture through Google’s userinfo API.
        </p>

        <p>
          <strong>Google Calendar data.</strong> With your consent, Vrema requests read-only access
          to your Google Calendar events
          (<code>https://www.googleapis.com/auth/calendar.events.readonly</code>). We may process
          event titles, start and end times, and related event metadata needed to calculate
          projects, activities, and hours.
          Vrema is intended to work with event titles that follow a project and activity format.
        </p>

        <p>
          <strong>Authentication tokens.</strong> An OAuth access token and related session details
          may be stored in your browser so you can stay signed in for a limited time.
        </p>

        <p>
          <strong>App preferences.</strong> We may store local preferences in your browser, such as
          theme settings, sidebar state, project filters, and display settings.
        </p>

        <p>
          <strong>Feedback.</strong> If you submit feedback, we receive the content you send,
          including the optional email address you provide, and any related metadata needed to
          deliver that message.
        </p>

        <p>
          <strong>Technical data.</strong> Our hosting provider may automatically process standard
          server logs such as IP address, browser type, and request timestamps when you visit the
          Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. Google API services and Limited Use</h2>
        <p>
          Vrema’s use and transfer of information received from Google APIs adhere to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="underline underline-offset-2 hover:text-neutral-950"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>In particular:</p>
        <ul>
          <li>
            We use Google user data only to provide and improve user-facing features of Vrema, such
            as signing you in and turning calendar events into time tracking insights.
          </li>
          <li>
            We do not sell Google user data.
          </li>
          <li>
            We do not use Google user data for serving advertisements.
          </li>
          <li>
            We do not allow humans to read Google user data unless you give us explicit permission
            (for example through a support request), it is necessary for security or legal
            compliance, or the data is aggregated and no longer identifiable.
          </li>
          <li>
            Google Calendar access is requested as read-only. Vrema does not create, edit, or delete
            calendar events through Google APIs.
          </li>
        </ul>
        <p>The Google scopes Vrema may request include:</p>
        <ul>
          <li>openid</li>
          <li>https://www.googleapis.com/auth/userinfo.profile</li>
          <li>https://www.googleapis.com/auth/userinfo.email</li>
          <li>https://www.googleapis.com/auth/calendar.events.readonly</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. How we use information</h2>
        <p>We use the information described above to:</p>
        <ul>
          <li>Authenticate you and maintain your session</li>
          <li>Display your projects, activities, and hours based on calendar events</li>
          <li>Sync and process calendar data needed for time tracking features</li>
          <li>Remember preferences you set in the Service</li>
          <li>Respond to feedback and support requests</li>
          <li>Operate, secure, and improve the Service</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>5. Where information is stored</h2>
        <p>
          <strong>In your browser.</strong> Your Google profile information and OAuth access token
          are stored locally in your browser (for example in localStorage). Calendar data used for
          timesheets may be held in browser memory while you use the Service. Preferences may also
          be stored locally on your device.
        </p>
        <p>
          <strong>On our servers and infrastructure.</strong> Feedback messages are processed
          through our email delivery provider so we can receive and reply to them. The Service is
          hosted on Vercel. We may also use Supabase to store application data related to the
          Service, which can include derived calendar event details such as titles, times, hours,
          activity types, and project-related metadata needed for time tracking features.
        </p>
        <p>
          We do not operate a separate mailing list based on your Google account. We only email you
          if you contact us or if it is necessary to operate the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Sharing of information</h2>
        <p>We share information only with processors and service providers that help us run Vrema:</p>
        <ul>
          <li>
            <strong>Google.</strong> Authentication, profile, and Calendar APIs.
          </li>
          <li>
            <strong>Vercel.</strong> Hosting and serverless API processing.
          </li>
          <li>
            <strong>Supabase.</strong> Database infrastructure for application data.
          </li>
          <li>
            <strong>Resend.</strong> Delivery of feedback and related transactional email.
          </li>
        </ul>
        <p>
          These providers process data on our instructions and only as needed to provide their
          services. We may also disclose information if required by law, to protect our rights or
          users, or in connection with a merger, acquisition, or similar transaction, where
          permitted.
        </p>
        <p>We do not sell your personal data.</p>
      </section>

      <section className="space-y-3">
        <h2>7. Cookies and similar technologies</h2>
        <p>
          Vrema uses a limited cookie to remember whether the sidebar is expanded or collapsed.
          Authentication and preferences are primarily stored using browser storage rather than
          tracking cookies. We do not use advertising cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. Data retention</h2>
        <p>
          Local browser data remains on your device until you sign out, clear site data, or your
          access token expires. Feedback emails are retained as long as needed to handle your
          request and keep ordinary business records. Data stored in Supabase is retained while
          needed to provide the Service, unless you ask us to delete it or we delete it as part of
          ordinary operations.
        </p>
      </section>

      <section className="space-y-3">
        <h2>9. Your rights</h2>
        <p>
          If you are in the European Economic Area, the United Kingdom, or another region with
          similar laws, you may have rights to access, correct, delete, restrict, or object to
          certain processing of your personal data, and to data portability where applicable.
        </p>
        <p>You can also:</p>
        <ul>
          <li>Sign out of Vrema to clear the local auth session stored by the Service</li>
          <li>
            Revoke Vrema’s access to your Google account at{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="underline underline-offset-2 hover:text-neutral-950"
              target="_blank"
              rel="noreferrer"
            >
              https://myaccount.google.com/permissions
            </a>
          </li>
          <li>
            Clear your browser storage and cookies for vrema.dev
          </li>
          <li>
            Contact us at jaysonfeldman@gmail.com to request access or deletion of data we control
          </li>
        </ul>
        <p>
          You may also lodge a complaint with your local supervisory authority. In the Netherlands,
          that is the Autoriteit Persoonsgegevens.
        </p>
      </section>

      <section className="space-y-3">
        <h2>10. Legal bases</h2>
        <p>Where GDPR applies, we process personal data on these bases:</p>
        <ul>
          <li>
            <strong>Consent</strong>, when you connect your Google account and grant calendar
            access
          </li>
          <li>
            <strong>Contract</strong>, to provide the Service you request
          </li>
          <li>
            <strong>Legitimate interests</strong>, to operate, secure, and improve Vrema in ways
            that do not override your rights
          </li>
          <li>
            <strong>Legal obligation</strong>, when we must retain or disclose information by law
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>11. International transfers</h2>
        <p>
          Our service providers may process data in countries outside the Netherlands, including
          the United States. Where required, we rely on appropriate safeguards offered by those
          providers, such as standard contractual clauses.
        </p>
      </section>

      <section className="space-y-3">
        <h2>12. Children’s privacy</h2>
        <p>
          Vrema is not directed to children under 16. We do not knowingly collect personal data from
          children under 16. If you believe a child has provided us personal data, contact us and we
          will take appropriate steps to delete it.
        </p>
      </section>

      <section className="space-y-3">
        <h2>13. Security</h2>
        <p>
          Security procedures are in place to protect the confidentiality, integrity, and
          availability of Google user data and other personal data we process. We use encryption
          and related controls to protect your information in transit and at rest where applicable.
        </p>
        <p>In particular, we protect sensitive Google user data with these mechanisms:</p>
        <ul>
          <li>
            <strong>Encryption in transit.</strong> The Service is served over HTTPS/TLS so data
            exchanged between your browser, Vrema, Google APIs, and our processors is encrypted in
            transit.
          </li>
          <li>
            <strong>Encryption at rest.</strong> Application data stored with our infrastructure
            providers (including Vercel and Supabase) is protected with those providers’ encryption
            at rest and access controls.
          </li>
          <li>
            <strong>OAuth token handling.</strong> Google OAuth access tokens are stored only in
            your browser (local storage) for the duration of your session and are not written to our
            own application servers for long-term retention. Tokens expire; signing out clears the
            local auth session.
          </li>
          <li>
            <strong>Least-privilege access.</strong> We request only the minimum Google scopes
            needed for time tracking, currently including read-only calendar events access
            (<code>https://www.googleapis.com/auth/calendar.events.readonly</code>). Vrema does not
            create, edit, or delete Google Calendar events.
          </li>
          <li>
            <strong>Limited use and no sale.</strong> Google user data is used only to provide and
            improve user-facing features of Vrema. We do not sell Google user data, do not use it
            for advertising, and do not transfer it to third parties except as needed to operate the
            Service through our listed processors.
          </li>
          <li>
            <strong>Access control.</strong> Access to systems that process user data is limited to
            what is needed to operate and secure the Service. We rely on our hosting and database
            providers’ authentication, network, and monitoring controls.
          </li>
          <li>
            <strong>User controls.</strong> You can revoke Vrema’s Google access at any time at{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="underline underline-offset-2 hover:text-neutral-950"
              target="_blank"
              rel="noreferrer"
            >
              https://myaccount.google.com/permissions
            </a>
            , sign out of Vrema, clear browser storage for vrema.dev, or contact us to request
            deletion of data we control.
          </li>
        </ul>
        <p>
          No method of transmission or storage is completely secure, and we cannot guarantee
          absolute security. If you believe your account or data has been compromised, contact us at
          jaysonfeldman@gmail.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2>14. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version on
          this page and revise the effective date. Continued use of the Service after changes become
          effective means you accept the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2>15. Contact</h2>
        <p>
          Questions about this Privacy Policy or your personal data can be sent to{' '}
          <a
            href="mailto:jaysonfeldman@gmail.com"
            className="underline underline-offset-2 hover:text-neutral-950"
          >
            jaysonfeldman@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
