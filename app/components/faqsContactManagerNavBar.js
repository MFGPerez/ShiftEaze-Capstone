"use client";

import React from 'react';
import Link from 'next/link';

/**
 * SupportNavBar Component
 * 
 * This component renders a navigation bar with a title and a link back to the Worker Search page.
 * It uses the Next.js Link component for client-side navigation.
 * 
 * @returns {JSX.Element} The SupportNavBar component
 */
const SupportNavBar = () => {
  return (
    <nav className="bg-black opacity-85 text-white py-3 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-xl font-rockSalt">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link
            href="/punchinOut"
            className="bg-gray-500 text-white px-4 py-2 rounded-md inline-block shadow-md hover:bg-gray-600 border-2 border-transparent hover:border-gray-400 font-comfortaa font-semibold"
          >
            Back to Worker Search
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SupportNavBar;
