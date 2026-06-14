import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Settlements from './pages/Settlements';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/groups/:id" element={
          <ProtectedRoute>
            <GroupDetail />
          </ProtectedRoute>
        } />

        <Route path="/groups/:id/expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } />

        <Route path="/groups/:id/expenses/new" element={
          <ProtectedRoute>
            <AddExpense />
          </ProtectedRoute>
        } />

        <Route path="/groups/:id/settlements" element={
          <ProtectedRoute>
            <Settlements />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
