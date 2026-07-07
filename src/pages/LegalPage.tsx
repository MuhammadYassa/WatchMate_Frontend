import { PageContainer } from '../components/layout/PageContainer'
import { Card } from '../components/ui/Card'

interface LegalPageProps {
  title: string
  intro: string
}

/**
 * Placeholder legal page for /terms and /privacy. The header and route are
 * final; the body copy is a stand-in to be replaced with reviewed legal text
 * before launch.
 */
export function LegalPage({ intro, title }: LegalPageProps) {
  return (
    <PageContainer className="relative isolate overflow-hidden pt-8 md:pt-12">
      <article className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Legal
          </p>
          <h1 className="break-words font-display text-[length:clamp(2.2rem,10vw,3rem)] leading-[1.02] tracking-[-0.03em] text-white md:text-6xl">
            {title}
          </h1>
        </header>
        <Card className="space-y-5 p-6 md:p-8">
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{intro}</p>
          <p className="rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-[color:var(--color-text-tertiary)]">
            1. Agreement to Terms

            By creating an account or using Watchmate ("Watchmate," "we," "us"), you agree to these Terms. If you don't agree, don't use the service. We may update these Terms from time to time; if we make material changes, we'll let you know (e.g. by email or in-app notice) before they take effect.

            2. What Watchmate Is

            Watchmate is a service for tracking what you watch. It lets you:


            Mark movies and shows as watching, completed, on hold, dropped, or planned
            Track progress through a show episode by episode
            Build watchlists and mark favorites
            Write reviews and ratings
            View a personal dashboard of your activity and stats
            Follow other users and see their activity (social graph)


            Movie and show information (titles, artwork, cast, episode data, etc.) is sourced from The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB. We don't guarantee that catalog data is complete, accurate, or up to date, since it comes from a third party.

            3. Accounts


            You must be at least [13/16] years old to use Watchmate, or the age of digital consent in your country if higher.
            You're responsible for the activity on your account and for keeping your login credentials secure.
            Provide accurate information when you register, and keep it up to date.
            You may not share an account, impersonate someone else, or create an account for anyone other than yourself.
            We can suspend or terminate accounts that violate these Terms (see Section 8).


            4. Your Content

            "Your Content" means anything you add to Watchmate: reviews, ratings, list titles and descriptions, profile info, and similar.


            You own your content. Posting it on Watchmate doesn't transfer ownership to us.
            You grant us a license to use it. By posting, you give Watchmate a non-exclusive, worldwide, royalty-free license to host, store, display, and distribute Your Content as needed to operate and promote the service (for example, showing your review to other users, or featuring it in the app).
            You're responsible for what you post. Don't post anything that's illegal, infringes someone else's rights, is harassing or hateful, or that you don't have the right to share (e.g. copyrighted text lifted from elsewhere).
            We can remove content that violates these Terms or our content guidelines, though we're not obligated to monitor everything posted.


            5. Acceptable Use

            When using Watchmate, don't:


            Scrape, bulk-download, or reverse-engineer the service or its data beyond what's allowed by our API terms (if we offer an API)
            Use bots, scripts, or automation to create accounts, inflate ratings, or manipulate rankings
            Attempt to access another user's account or data without authorization
            Interfere with or disrupt the service (e.g. overloading servers, injecting malicious code)
            Use Watchmate to harass, stalk, or abuse other users
            Upload viruses or attempt to breach our security


            We reserve the right to suspend access for anyone who violates these rules.

            6. Social Features

            Watchmate includes social features like following other users and seeing their watch activity. Depending on your privacy settings, your activity (what you're watching, your ratings, your lists) may be visible to people who follow you or to the public. Review your privacy settings if you'd prefer to keep some or all of this private.

            7. Third-Party Data and Services

            Watchmate relies on TMDB for catalog and discovery data, and may use other third-party services (e.g. for hosting, analytics, or authentication). We aren't responsible for the accuracy, availability, or content of third-party data or services, and your use of any linked third-party site is at your own risk and subject to that provider's terms.

            8. Suspension and Termination


            You can delete your account at any time from your account settings.
            We may suspend or terminate your account if you violate these Terms, if required by law, or if we discontinue the service.
            Upon termination, your right to use Watchmate ends immediately. We may retain some data as required by law or as described in our Privacy Policy.


            9. Intellectual Property

            The Watchmate name, logo, design, and software are owned by Muhammad Yassa and protected by intellectual property laws. Movie/show metadata and artwork remain the property of their respective rights holders and TMDB contributors. Nothing in these Terms grants you rights to our branding except as needed to use the service normally.

            10. Disclaimers

            Watchmate is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We don't guarantee the service will be uninterrupted, error-free, or that catalog data (sourced from TMDB) will always be accurate or complete.

            11. Limitation of Liability

            To the maximum extent permitted by law, Muhammad Yassa will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, arising from your use of Watchmate. Our total liability for any claim relating to the service is limited to the amount you paid us in the [12 months] before the claim arose, or [$100] if you haven't paid us anything.

            (Some jurisdictions don't allow these limitations, so parts of this section may not apply to you.)

            12. Changes to the Service

            We may add, change, or remove features at any time, and may discontinue Watchmate entirely. We'll try to give reasonable notice of major changes that affect you, but we're not obligated to keep any specific feature available indefinitely.

            13. Governing Law and Disputes

            These Terms are governed by the laws of NY/USA, without regard to conflict-of-law principles. Any disputes will be resolved in the courts of NY/USA, unless otherwise required by applicable consumer protection law. (Consider whether you want an arbitration clause here — that's a decision to make with a lawyer, not a default to copy blindly.)

            14. Contact

            Questions about these Terms? Reach out at noreply.watchmate@gmail.com
          </p>
        </Card>
      </article>
    </PageContainer>
  )
}

export function TermsPage() {
  return (
    <LegalPage
      intro="These terms will describe your agreement with WatchMate: your account, acceptable use, the content you create (reviews, watchlists, profile details), and how the service may change over time."
      title="Terms of Service"
    />
  )
}

export function PrivacyPage() {
  return (
    <LegalPage
      intro="This policy will describe what data WatchMate stores (your account details, watch history, favourites, watchlists, and reviews), how it is used to run the service, and the choices you have over it."
      title="Privacy Policy"
    />
  )
}
