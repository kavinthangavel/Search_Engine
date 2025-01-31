import { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/results?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-white shadow-lg rounded-lg w-full max-w-2xl">
      <form onSubmit={handleSearch} className="flex w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-all duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;