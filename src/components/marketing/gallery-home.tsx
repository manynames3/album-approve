import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { WorkflowPreview } from "@/components/marketing/workflow-preview";
import { ScrollcraftRuntime } from "@/components/marketing/scrollcraft-runtime";
import { RevisionComparison } from "@/components/marketing/revision-comparison";
import styles from "@/components/marketing/gallery-landing.module.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400" });
const chapters = [
  ["Draft", "draft"],
  ["Feedback", "feedback"],
  ["Revision", "revision"],
  ["Approval", "approval"],
] as const;

export default function GalleryHome() {
  return (
    <ScrollcraftRuntime className={styles.root}>
      <Link href="#gallery" prefetch={false} className={styles.skip}>
        Skip to album story
      </Link>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.wordmark}
          aria-label="Album Approve home"
        >
          Album Approve
        </Link>
        <nav aria-label="Album story" className={styles.index}>
          {chapters.map(([label, id]) => (
            <Link key={id} href={`#${id}`} prefetch={false}>
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <Link href="#access" prefetch={false}>
            Pricing
          </Link>
          <Link href="/sign-in" className={styles.login}>
            Log in
          </Link>
          <Link
            href="/proof/demo-proof-token"
            prefetch={false}
            className={styles.primary}
          >
            View demo proof <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </header>
      <main id="gallery" tabIndex={-1}>
        <section id="draft" className={styles.hero} data-sc-act="flow">
          <div className={styles.heroCopy}>
            <p className={styles.audience}>Album proofing for photographers</p>
            <h1 className={display.className}>Album Approve</h1>
            <p className={styles.heroLead}>
              Your photographs. Their feedback. A clear approval.
            </p>
            <Link
              href="/proof/demo-proof-token"
              prefetch={false}
              className={styles.textLink}
            >
              View demo proof <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
          <div className={styles.albumShelf}>
            <div
              className={styles.backSpread}
              data-sc-parallax="-0.35"
              aria-hidden
            >
              <Image
                src="/demo/maya-liam/portraits.webp"
                alt=""
                width={1774}
                height={887}
                unoptimized
                loading="lazy"
              />
            </div>
            <figure className={styles.heroAlbum} data-sc-parallax="0.45">
              <div data-sc-tilt="2" className={styles.albumObject}>
                <Image
                  src="/demo/maya-liam/opening.webp"
                  alt="Maya and Liam's fictional wedding album, opening spread with photographs and wedding title"
                  width={1774}
                  height={887}
                  unoptimized
                  priority
                />
              </div>
              <figcaption>
                <span>Album draft</span>
                <span>Maya &amp; Liam / Four exported spreads</span>
              </figcaption>
            </figure>
          </div>
        </section>
        <section
          className={styles.introNote}
          aria-label="About the sample workflow"
        >
          <p>
            Keep designing in your own tools. Upload JPG or PNG spreads, share a
            proof link, and keep each note with its spread.
          </p>
          <p>
            Illustrative sequence. Fictional photographs and real app captures.
            Revisions are uploaded designs, not automatic edits.
          </p>
        </section>
        <section
          id="feedback"
          className={`${styles.chapter} ${styles.feedback}`}
          data-sc-act="flow"
        >
          <div className={styles.chapterHeading}>
            <h2 className={display.className}>A note with a place.</h2>
            <p>
              Clients review the album through one link and pin a comment
              directly to the spread. No client account required.
            </p>
          </div>
          <figure className={styles.uiCapture} data-sc-in>
            <Image
              src="/product/gallery/feedback.webp"
              alt="Actual client proof with a pinned request to replace the ceremony spread with portraits"
              width={1440}
              height={1000}
              unoptimized
              loading="lazy"
            />
            <figcaption>
              <span>Client feedback</span>
              <span>Spread 2 / Comment saved</span>
            </figcaption>
          </figure>
          <blockquote className={styles.note}>
            <span className={styles.pin} aria-label="Comment 1">
              1
            </span>
            <p>&ldquo;Please use the portraits spread here.&rdquo;</p>
            <span>Fictional sample request</span>
          </blockquote>
          <figure className={styles.commentDetail}>
            <Image
              src="/product/gallery/comment-detail.webp"
              alt="Unaltered detail from the actual comment panel: Please use the portraits spread here"
              width={320}
              height={260}
              unoptimized
              loading="lazy"
            />
            <figcaption>Detail from the same client proof</figcaption>
          </figure>
        </section>
        <section
          id="revision"
          className={`${styles.chapter} ${styles.revision}`}
          data-sc-act="flow"
        >
          <div className={styles.chapterHeading}>
            <h2 className={display.className}>That note. This revision.</h2>
            <p>
              The studio replaces the requested spread with a new exported file.
              Its comments stay attached to the same spread.
            </p>
          </div>
          <RevisionComparison />
          <div className={styles.revisionCaption}>
            <span>Spread 2 / Ceremony to portraits</span>
            <span>Illustrative draft-to-replacement comparison</span>
          </div>
          <details className={styles.captureDetails}>
            <summary>
              See the replacement in the real studio workspace{" "}
              <ExternalLink size={16} aria-hidden />
            </summary>
            <Image
              src="/product/gallery/replacement.webp"
              alt="Actual studio workspace showing Replacement saved and the updated portraits image for spread 2"
              width={1440}
              height={1000}
              unoptimized
              loading="lazy"
            />
          </details>
          <p className={styles.smallCopy}>
            Design changes happen in your album software. Album Approve handles
            review, uploaded replacements, and comment resolution.
          </p>
        </section>
        <section
          id="approval"
          className={`${styles.chapter} ${styles.approval}`}
          data-sc-act="flow"
        >
          <div className={styles.chapterHeading}>
            <h2 className={display.className}>An explicit decision.</h2>
            <p>
              After the note is resolved, the client confirms which album
              version they approve. The decision is recorded with that version.
            </p>
          </div>
          <figure className={styles.uiCapture}>
            <Image
              src="/product/gallery/approval.webp"
              alt="Actual client proof after confirming approval of version 1, with the recorded approval message"
              width={1440}
              height={1000}
              unoptimized
              loading="lazy"
            />
            <figcaption>
              <span>
                <Check size={16} aria-hidden /> Client decision recorded
              </span>
              <span>Version 1 / Sample workflow</span>
            </figcaption>
          </figure>
          <div className={styles.decisionLinks}>
            <Link
              href="/proof/demo-proof-token"
              prefetch={false}
              className={styles.primary}
            >
              View demo proof <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#workflow" prefetch={false} className={styles.textLink}>
              Watch the actual workflow <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>
        <section
          id="workflow"
          className={`${styles.chapter} ${styles.videoSection}`}
          data-sc-act="flow"
        >
          <div className={styles.chapterHeading}>
            <h2 className={display.className}>Watch the review happen.</h2>
            <p>
              A short desktop recording of uploading spreads, saving a pinned
              note, and confirming approval.
            </p>
          </div>
          <details className={styles.videoDetails}>
            <summary>Play the 24-second desktop walkthrough</summary>
            <WorkflowPreview />
            <a
              href="/product/workflow-demo-desktop.mp4"
              className={styles.textLink}
            >
              Open the video directly <ExternalLink size={16} aria-hidden />
            </a>
          </details>
        </section>
        <section
          id="access"
          className={`${styles.chapter} ${styles.plans}`}
          data-sc-act="flow"
        >
          <div className={styles.chapterHeading}>
            <h2 className={display.className}>Find your studio&apos;s fit.</h2>
            <p>
              Planned monthly plans, from a single album to regular studio
              proofing. Explore the workflow before a configured rollout.
            </p>
          </div>
          <PricingPlans />
          <p className={styles.smallCopy}>
            Plan buttons open the studio preview, not a paid checkout.{" "}
            <Link href="/pricing">View plan details</Link>.
          </p>
        </section>
        <section
          id="trust"
          className={`${styles.chapter} ${styles.trust}`}
          data-sc-act="flow"
        >
          <h2 className={display.className}>Know what you are sharing.</h2>
          <div className={styles.trustCopy}>
            <p>
              Uploaded spreads use signed asset routes. Guest proof links
              support optional passwords. The sample photographs and this
              gallery are public.
            </p>
            <p>
              <strong>This hosted preview is non-durable.</strong> Uploads,
              notes, and approvals can disappear when its memory resets. Use
              fictional files here. Production identity and durable storage
              still need implementation.
            </p>
          </div>
          <div className={styles.faq}>
            <details>
              <summary>Does this design albums or order prints?</summary>
              <p>
                No. It reviews exported designs, collects feedback, and records
                decisions. Design and print ordering stay in your existing
                tools.
              </p>
            </details>
            <details>
              <summary>Can I upload a PDF?</summary>
              <p>
                PDF import exists, but it currently creates page placeholders
                rather than rendering your design. Use JPG or PNG exports to
                review actual spreads.
              </p>
            </details>
            <details>
              <summary>Why not send a PDF by email?</summary>
              <p>
                You can. A proof link keeps notes next to the reviewed spread,
                allows replacements, and records the client&apos;s decision
                against an album version.
              </p>
            </details>
          </div>
        </section>
        <section className={styles.close} data-sc-act="flow">
          <h2 className={display.className}>Give the album its next step.</h2>
          <Link
            href="/proof/demo-proof-token"
            prefetch={false}
            className={styles.primary}
          >
            View demo proof <ArrowRight size={16} aria-hidden />
          </Link>
          <p>No client account required to explore the sample proof.</p>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>Album Approve</span>
        <span>&copy;2026 SUPREME AI VENTURES LLC</span>
        <Link href="/sign-in">Studio login</Link>
      </footer>
    </ScrollcraftRuntime>
  );
}
