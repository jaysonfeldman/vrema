import React from 'react';
import Header from '@/components/Header';
import ActivityColorManager from '@/components/ActivityColorManager';

export default function Activities() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ActivityColorManager />
      </main>
    </div>
  );
}
