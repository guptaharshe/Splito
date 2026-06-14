import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Settlements from './pages/Settlements';
import Import from './pages/Import';
import ImportReview from './pages/ImportReview';
import ImportReport from './pages/ImportReport';
import GroupsList from './pages/GroupsList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/groups" element={
            <ProtectedRoute>
              <GroupsList />
            </ProtectedRoute>
          } />

          <Route path="/import" element={
            <ProtectedRoute>
              <Import />
            </ProtectedRoute>
          } />
          
          <Route path="/import/:batch_id/review" element={
            <ProtectedRoute>
              <ImportReview />
            </ProtectedRoute>
          } />
          
          <Route path="/import/:batch_id/report" element={
            <ProtectedRoute>
              <ImportReport />
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
    </AuthProvider>
  );
}

export default App;
