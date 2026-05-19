import React from "react";

/**
 * ATLAS WEALTH - OFFICIAL BRAND LOGO COMPONENT
 * 
 * This component enforces brand consistency across the entire application.
 * DO NOT create alternative logo components or modify this without approval.
 */

export const BRAND_CONFIG = {
  logo: {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988b26a58001c016eae4a52/4698840f2_AtlasWealthlogo.png",
  },
  name: "Atlas Wealth",
  colors: {
    primary: "#D4AF37",
  }
};

/**
 * BrandLogo Component
 * @param {string} variant - 'full' (default) or 'icon'
 * @param {number} height - Height in pixels (width auto-scales)
 * @param {string} className - Additional Tailwind classes
 */
export default function BrandLogo({ variant = "full", height = 36, className = "" }) {
  return (
    <img 
      src={BRAND_CONFIG.logo.url}
      alt={BRAND_CONFIG.name}
      className={`object-contain ${className}`}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
}

/**
 * Get logo URL for external use (PDFs, etc.)
 */
export function getLogoUrl() {
  return BRAND_CONFIG.logo.url;
}