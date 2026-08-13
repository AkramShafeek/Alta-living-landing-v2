"use client";

import { cn } from "@/lib/utils";

interface PropertyCardProps {
  src: string;
  alt: string;
  title: string;
  location: string;
  price: string;
  features: string[];
  className?: string;
}

export function PropertyCard({
  src,
  alt,
  title,
  location,
  price,
  features,
  className,
}: PropertyCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-100 transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-2",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

        {/* Feature badges */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full border border-white/20"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {location}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-neutral-900">{price}</p>
            <p className="text-xs text-neutral-500">per month</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
          <div className="flex -space-x-2" aria-label="Verified property">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8H2zm16 0v8h-8a8 8 0 018-8z" />
              </svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
          <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}