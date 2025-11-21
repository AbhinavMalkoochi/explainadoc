"use client";

import Link from "next/link";

export function NavLinks() {
  return (
    <div className="flex gap-8">
      <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
        Home
      </Link>
      <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
        About
      </Link>
      <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
        Projects
      </Link>
      <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
        Contact
      </Link>
      <Link
        href="https://convex.link/nextchatdemo"
        className="text-gray-600 hover:text-gray-900 transition-colors">
        Convex
      </Link>
      <Link
        href="https://github.com/waynesutton/nextjsaichatconvextemplate"
        className="text-gray-600 hover:text-gray-900 transition-colors">
        Repo
      </Link>
    </div>
  );
}
