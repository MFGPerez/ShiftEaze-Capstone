"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, getDocs, deleteDoc, where } from "firebase/firestore";
import { firebaseApp } from "utils/firebase";
import { FaTrashAlt } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const WorkerMsgDisplay = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("User not signed in");
          return;
        }
        const q = query(collection(db, "managers", user.uid, "supportMessages"));
        const querySnapshot = await getDocs(q);
        const messagesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: formatTimestamp(doc.data().timestamp.toDate()), // Format Firestore timestamp to date string
        }));
        setMessages(messagesList);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [auth, db]);

  const handleDelete = async (email) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not signed in");
        return;
      }

      const q = query(collection(db, "managers", user.uid, "supportMessages"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setMessages(messages.filter(message => message.email !== email));
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const formatTimestamp = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const handleView = (message) => {
    setSelectedMessage(message);
  };

  const handleClosePopup = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="w-full max-w-3xl"> {/* Extended width */}
      <div className="bg-gray-100 text-black text-center p-4 rounded-t-lg w-full">
        <h2 className="text-3xl font-comfortaa font-bold">Worker Messages</h2>
      </div>
      <div className="bg-black opacity-90 p-7 rounded-b-lg shadow-lg w-full" style={{ height: '27rem' }}> {/* Custom height */}
        {loading ? (
          <p className="text-white">Loading messages...</p>
        ) : (
          <div className="flex flex-col space-y-4 overflow-y-auto h-full">
            {messages.length === 0 ? (
              <p className="text-white text-center">You have no support messages at this time.</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className="relative bg-blue-100 py-3 px-6 rounded-lg shadow hover:bg-blue-300 transition-colors border-2 border-transparent hover:border-blue-600 cursor-pointer"
                  onClick={() => handleView(msg)}
                >
                  <h2 className="text-2xl font-comfortaa font-semibold text-blue-900 mb-1">{msg.name}</h2>
                  <p className="text-black font-nixie text-sm">{msg.message}</p>
                  <p className="text-black font-nixie text-sm">Time: {msg.time}</p>
                  <p className="text-black font-nixie text-sm">Email: {msg.email}</p>
                  <FaTrashAlt
                    className="absolute top-2 right-2 text-red-400 hover:text-red-700 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.email);
                    }}
                  />
                  {index < messages.length - 1 && <hr className="border-t border-black my-4" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4  text-red-400 hover:text-red-700"
            >
              <AiOutlineClose size={24} />
            </button>
            <div className="text-black">
              <h2 className="text-3xl font-comfortaa font-bold mb-4">{selectedMessage.name}</h2>
              <div className="mt-4">
                <p className="text-2xl font-nixie font-semibold mb-2">Message: {selectedMessage.message}</p>
              </div>
              <p className="text-xl font-comfortaa mb-1">Email: {selectedMessage.email}</p>
              <p className="text-xl font-comfortaa mb-1">Time: {selectedMessage.time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerMsgDisplay;
