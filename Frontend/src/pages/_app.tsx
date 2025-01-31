import '../styles/globals.css';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gradient min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-left text-3xl font-bold text-gray-800 py-6">Search Engine</h1>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;