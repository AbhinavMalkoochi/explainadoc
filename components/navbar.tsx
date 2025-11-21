"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { NavLinks } from "./nav-links";

export function Navbar() {
  const tubelightRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tubelightRef.current && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const x = e.clientX - navRect.left;
        tubelightRef.current.style.left = `${x}px`;
      }
    };

    const nav = navRef.current;
    if (nav) {
      nav.addEventListener("mousemove", handleMouseMove);
      return () => nav.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <nav ref={navRef} className="relative h-16 flex items-center px-4 overflow-hidden">
      <div
        ref={tubelightRef}
        className="tubelight absolute top-0 -translate-x-1/2 h-1 w-20 bg-blue-500 blur-[16px] pointer-events-none"
      />
      <div className="max-w-7xl mx-auto w-full flex items-center">
        <Link href="/" className="text-xl absolute left-8">
          Logo
        </Link>
        <div className="mx-auto">
          <NavLinks />
        </div>
      </div>
    </nav>
  );
}
