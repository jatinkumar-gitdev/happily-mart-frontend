import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiClock, FiTrash2 } from "react-icons/fi";
import { postService } from "../../services/post.service";
import { useAuthStore } from "../../store/authStore";
import { useDebounce } from "../../hooks/useDebounce";

const SearchModal = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const debouncedSearch = useDebounce(searchQuery, 500);

  
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        setSearchHistory([]);
      }
    }
  }, []);

  // Save search history
  const saveToHistory = (query) => {
    if (!query.trim() || query.length < 2) return;

    const history = [...searchHistory];
    const index = history.indexOf(query);
    if (index > -1) {
      history.splice(index, 1);
    }
    history.unshift(query);
    const limitedHistory = history.slice(0, 10);
    setSearchHistory(limitedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(limitedHistory));
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: () => postService.searchPosts(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (query) => {
    if (query.trim().length >= 2) {
      saveToHistory(query);
      setSearchQuery(query);
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const removeHistoryItem = (query) => {
    const newHistory = searchHistory.filter((item) => item !== query);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handlePostClick = (postId) => {
    onClose();
    navigate(`/feed`);
    // Scroll to post or show in detail view
    setTimeout(() => {
      const element = document.getElementById(`post-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowHistory(e.target.value.length < 2);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                  handleSearch(searchQuery);
                }
              }}
              placeholder="Search posts, keywords..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="text-xl text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showHistory && searchHistory.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiClock />
                  Recent Searches
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.map((query, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  >
                    <button
                      onClick={() => handleHistoryClick(query)}
                      className="flex-1 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      {query}
                    </button>
                    <button
                      onClick={() => removeHistoryItem(query)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity"
                    >
                      <FiTrash2 className="text-xs text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debouncedSearch.length >= 2 && (
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Searching...
                  </p>
                </div>
              ) : searchResults?.posts?.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Search Results (
                    {searchResults.total || searchResults.posts.length})
                  </h3>
                  {searchResults.posts.map((post) => (
                    <button
                      key={post._id}
                      onClick={() => handlePostClick(post._id)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.requirement || post.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>By {post.author?.name || "Unknown"}</span>
                        <span>₹{post.unlockPrice || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "{debouncedSearch}"
                  </p>
                </div>
              )}
            </div>
          )}

          {searchQuery.length < 2 && !showHistory && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
