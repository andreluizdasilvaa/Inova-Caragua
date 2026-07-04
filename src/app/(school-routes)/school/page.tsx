'use client';

import React, { useState } from 'react';
import { UserSession, Occurrence, Asset, mockOccurrences, mockAssets } from '@/mockData';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SchoolDashboardView } from '@/components/views/SchoolDashboardView';
import { signOut } from 'next-auth/react';

export default function SchoolPage() {
  // Simulated session (will be replaced with real session from next-auth)
  const [session] = useState<UserSession>({
    user: {
      name: 'Escola Municipal',
      email: 'escola@educacao.gov.br',
      id: 'usr-school-001',
      role: 'Unidade Escolar'
    }
  });

  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Fixed size with responsive toggling */}
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar 
          currentView="dashboard" 
          setView={(view) => {
            setSidebarOpen(false);
          }} 
          session={session} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main layout container offsetting the fixed sidebar (left-60) */}
      <div className="md:pl-60 min-h-screen flex flex-col">
        
        {/* Top Navbar */}
        <Header 
          session={session} 
          title="Dashboard Escolar" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable screen body */}
        <main className="flex-1 p-4 mt-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <SchoolDashboardView />
          </div>
        </main>

      </div>
    </div>
  );
}