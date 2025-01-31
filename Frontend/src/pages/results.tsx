import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface SearchResult {
  doc_no: number;
  score: number;
  link: string;
}

export default function Results() {
  const router = useRouter();
  // Get the ?query= parameter from the URL (/results?query=...)
  const queryParam =
    Array.isArray(router.query.query)
      ? router.query.query[0]
      : router.query.query || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queryParam) {
      // If there's no query, just clear results and stop loading
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch from your Next.js API: /api/search?query=...
    fetch(`/api/search?query=${encodeURIComponent(queryParam)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // data.results should be an array of { doc_no, score, link }
        setResults(data.results || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch results. Please try again later.');
        setIsLoading(false);
      });
  }, [queryParam]);

  // Simple function to generate a placeholder snippet if you don't store any
  const getSnippet = (result: SearchResult) => {
    return `This is a sample snippet for doc #${result.doc_no}, score: ${result.score.toFixed(
      4
    )}. Customize this snippet as needed.`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Search Results for: <span className="text-blue-600">"{queryParam}"</span>
      </h2>

      {isLoading ? (
        <p className="text-gray-600">Loading results...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-gray-600">No results found.</p>
      ) : (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="space-y-1">
              {/* TITLE (opens result.link in a new tab) */}
              <a
                href={result.link.startsWith('http') ? result.link : `https://${result.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl text-blue-800 hover:underline font-medium"
              >
                {result.link || `Document #${result.doc_no}`}
              </a>

              {/* GREEN URL LINE (optional, to mimic search engine style) */}
              {result.link && (
                <div className="text-green-600 text-sm break-all">
                  {result.link}
                </div>
              )}

              {/* SNIPPET (placeholder text) */}
              <p className="text-gray-700">{getSnippet(result)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
