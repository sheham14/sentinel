import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1416]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[#888] mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[13px] font-medium text-[#00E5C3] mb-1">Panion</p>
          <h1 className="text-[26px] font-semibold text-[#111] dark:text-[#e0e0e0] mb-1">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-[#aaa]">Last updated: May 13, 2026</p>
        </div>

        {/* Who we are */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Who we are
        </h2>
        <p className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed">
          Panion is a grocery price intelligence app operated by Sheham Mohammed.
          We help users in St. John&apos;s, Newfoundland find the best grocery prices
          at local stores. You can reach us at{" "}
          <a
            href="mailto:privacy@panion.dev"
            className="text-[#00b89e] underline underline-offset-2"
          >
            privacy@panion.dev
          </a>{" "}
          for any privacy-related questions.
        </p>

        {/* What we collect */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          What we collect
        </h2>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Account information:
            </span>{" "}
            your name and email address via Google Sign-In
          </li>
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Preferences:
            </span>{" "}
            dietary restrictions, allergies, preferred stores, notification
            settings
          </li>
          <li>Grocery lists and pantry items you create</li>
          <li>Price reports you submit</li>
          <li>
            Clove conversations, including your messages and the responses
            generated
          </li>
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Usage data:
            </span>{" "}
            which features you use and when, to improve the app
          </li>
        </ul>

        {/* What we don't collect */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          What we don&apos;t collect
        </h2>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>Your precise location</li>
          <li>
            Any data from third-party apps or services beyond what you provide
            directly
          </li>
        </ul>

        {/* How we use your data */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          How we use your data
        </h2>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            To provide the app&apos;s core features: price comparisons, grocery
            lists, pantry tracking
          </li>
          <li>
            To personalise Clove responses with your pantry, preferred stores,
            dietary restrictions, and budget
          </li>
          <li>
            To send price drop alerts for products you watch (if enabled)
          </li>
        </ul>

        {/* Third parties */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Third parties we share data with
        </h2>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Anthropic:
            </span>{" "}
            your Clove messages are sent to Anthropic&apos;s API to generate
            responses.{" "}
            <a
              href="https://www.anthropic.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b89e]"
            >
              anthropic.com/privacy
            </a>
          </li>
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Vercel:
            </span>{" "}
            our hosting provider. Your data passes through Vercel&apos;s
            infrastructure.{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b89e]"
            >
              vercel.com/legal/privacy-policy
            </a>
          </li>
          <li>
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Google:
            </span>{" "}
            authentication via Google Sign-In.{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b89e]"
            >
              policies.google.com/privacy
            </a>
          </li>
        </ul>
        <p className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed mt-3">
          We do not sell your data. We do not share your data with advertisers.
        </p>

        {/* How long */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          How long we keep your data
        </h2>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            Active account data is kept for as long as your account exists
          </li>
          <li>
            If you request deletion, your account is anonymised within 30 days
          </li>
          <li>
            Clove conversations are kept indefinitely until you delete them
          </li>
          <li>Price reports are kept to improve data accuracy</li>
        </ul>

        {/* PIPEDA */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Your rights under PIPEDA
        </h2>
        <p className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed mb-2">
          As a Canadian user you have the right to:
        </p>
        <ul className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            Access the data we hold about you. Use the{" "}
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Export my data
            </span>{" "}
            option in Profile Settings
          </li>
          <li>
            Correct inaccurate data, updated directly in Profile Settings
          </li>
          <li>
            Request deletion of your account and data. Use{" "}
            <span className="font-medium text-[#333] dark:text-[#ccc]">
              Delete account
            </span>{" "}
            in Profile Settings
          </li>
          <li>Withdraw consent at any time by deleting your account</li>
        </ul>

        {/* Cookies */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Cookies
        </h2>
        <p className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed">
          We use session cookies for authentication only. We do not use tracking
          or advertising cookies. We do not use third-party analytics.
        </p>

        {/* Changes */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Changes to this policy
        </h2>
        <p className="text-[14px] text-[#555] dark:text-[#aaa] leading-relaxed">
          We may update this policy as the app evolves. Significant changes will
          be communicated via email. The date at the top of this page always
          reflects the latest version.
        </p>

        {/* Contact */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0] mt-8 mb-2">
          Contact
        </h2>
        <a
          href="mailto:privacy@panion.dev"
          className="text-[14px] text-[#00b89e]"
        >
          privacy@panion.dev
        </a>
      </div>
    </div>
  );
}