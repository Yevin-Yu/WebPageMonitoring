import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}


