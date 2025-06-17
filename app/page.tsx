'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to RFQ Central</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          A platform where buyers create RFQ templates and sellers respond with price quotes and availability.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/signup')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
        <button
          onClick={() => router.push('/login')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition"
        >
          Log In
        </button>
      </div>

      <footer className="mt-12 text-sm text-gray-400">
        © {new Date().getFullYear()} RFQ Central. All rights reserved.
      </footer>
    </main>
  );
}
