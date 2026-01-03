import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout({ children }) {
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

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
