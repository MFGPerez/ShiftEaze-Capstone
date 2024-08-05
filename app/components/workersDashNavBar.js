"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth } from "firebase/auth";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * WorkersDashNavBar Component
 * 
 * This component renders the navigation bar for the worker's dashboard in the ShiftEaze application.
 * It includes navigation links to the calendar and contact manager sections.
 * It also displays the user's profile picture if available.
 * 
 * @returns {JSX.Element} The WorkersDashNavBar component
 */
const WorkersDashNavBar = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [profilePic, setProfilePic] = useState("");

  /**
   * Fetches the user's profile picture from Firestore.
   */
  useEffect(() => {
    const fetchUserProfilePic = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfilePic(userData.photoURL);
        }
      }
    };

    fetchUserProfilePic();
  }, [auth, db]);

  return (
    <nav className="bg-black opacity-95 text-white py-4 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-2xl font-rockSalt mr-auto">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link href="/calendar?view=worker" className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
          <Link href="/contactManager" className="hover:text-blue-400 text-lg font-comfortaa">Contact Manager</Link>
          <Link href="/requestLeave" className="hover:text-blue-400 text-lg font-comfortaa">Request Leave</Link>
          {profilePic && (
            <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default WorkersDashNavBar;
