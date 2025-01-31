import Head from 'next/head';
import SearchBar from '../components/SearchBar';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient">
      <Head>
        <title>Search Engine</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="text-center">
        {/* <h1 className="text-5xl font-bold text-gray-800 mb-4">Search Engine</h1> */}
        <p className="text-lg text-gray-600 mb-8">Find what you're looking for with ease.</p>
        <SearchBar />
      </div>
    </div>
  );
};

export default Home;