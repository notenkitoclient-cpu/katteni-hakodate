'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <label className="text-zinc-500 text-xs tracking-widest uppercase">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white transition-colors"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="w-full border border-zinc-700 text-zinc-400 py-3 font-mono text-xs tracking-widest uppercase hover:border-zinc-400 hover:text-white transition-colors bg-transparent"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
