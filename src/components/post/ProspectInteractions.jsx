import React, { useState, useEffect } from "react";
import { FiUser, FiClock, FiCheck } from "react-icons/fi";

const ProspectInteractions = ({ postId, isAuthor }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real implementation, this would fetch from an API
  // For now, we'll simulate the data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // This would be replaced with actual API call to get prospect interactions
      const mockInteractions = [
        {
          id: 1,
          name: "John Smith",
          avatar: "",
          timeAgo: "2 hours ago",
          type: "view",
          confirmed: true
        },
        {
          id: 2,
          name: "Sarah Johnson",
          avatar: "",
          timeAgo: "1 day ago",
          type: "contact",
          confirmed: true
        },
        {
          id: 3,
          name: "Mike Wilson",
          avatar: "",
          timeAgo: "3 days ago",
          type: "view",
          confirmed: false
        }
      ];
      setInteractions(mockInteractions);
      setLoading(false);
    }, 500);
  }, [postId, isAuthor]);

  if (!isAuthor) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Prospect Interactions
      </h3>
      
      {interactions.length === 0 ? (
        <div className="text-center py-8">
          <FiUser className="mx-auto text-3xl text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No prospect interactions yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div 
              key={interaction.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                  {interaction.type === "contact" && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <FiCheck className="text-white text-xs" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {interaction.name}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiClock className="text-xs" />
                    <span>{interaction.timeAgo}</span>
                    <span>•</span>
                    <span className={`capitalize ${interaction.type === "contact" ? "text-green-600" : "text-blue-600"}`}>
                      {interaction.type}
                    </span>
                  </div>
                </div>
              </div>
              {interaction.confirmed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Confirmed
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {interactions.filter(i => i.type === "view").length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {interactions.filter(i => i.type === "contact").length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contacts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {interactions.filter(i => i.confirmed).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectInteractions;