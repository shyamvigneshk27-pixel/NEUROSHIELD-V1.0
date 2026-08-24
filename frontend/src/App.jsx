import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import AnalysisView from './components/AnalysisView';
import PatientRecordsView from './components/PatientRecordsView';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import AdminView from './components/AdminView';
import ReportSummaryView from './components/ReportSummaryView';
import ModelMetricsView from './components/ModelMetricsView';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Analysis');

  // ML States
  const [signalData, setSignalData] = useState(null);
  const [spectrogram, setSpectrogram] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginSessions, setLoginSessions] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Persistence check
  useEffect(() => {
    const saved = localStorage.getItem('neuro_user');
    if (saved) setCurrentUser(JSON.parse(saved));

    const sessions = localStorage.getItem('neuro_sessions');
    if (sessions) setLoginSessions(JSON.parse(sessions));

    const history = localStorage.getItem('neuro_history');
    if (history) setAnalysisHistory(JSON.parse(history));
  }, []);

  // Push a new record into persistent history
  const pushHistory = (record) => {
    setAnalysisHistory(prev => {
      const updated = [record, ...prev].slice(0, 50);
      localStorage.setItem('neuro_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('neuro_user', JSON.stringify(user));

    const newSession = {
      id: Date.now(),
      user: user.name,
      role: user.role,
      loginTime: user.loginTime || new Date().toLocaleString(),
      status: 'Active',
      ip: '127.0.0.1',
    };

    const updatedSessions = [newSession, ...loginSessions.slice(0, 19)];
    setLoginSessions(updatedSessions);
    localStorage.setItem('neuro_sessions', JSON.stringify(updatedSessions));
    setActiveTab(user.role === 'admin' ? 'System Admin' : 'Analysis');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('neuro_user');
  };

  const handleCsvUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze/csv', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Server error');

      setSignalData(data.raw_signal);
      setRiskScore(data.prediction.risk_score);
      setAnalysisResult(data.prediction);

      pushHistory({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        inputType: 'csv',
        filename: file.name,
        user: currentUser?.name || 'Unknown',
        prediction: data.prediction,
        aiSummary: '',
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert(error.message || 'Failed to analyze CSV. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    setSignalData(null);

    const reader = new FileReader();
    reader.onloadend = () => setSpectrogram(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze/image', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || 'Server failed to analyze image');

      setRiskScore(data.prediction.risk_score);
      setAnalysisResult(data.prediction);

      const signal = data.raw_signal || data.prediction.raw_signal;
      if (signal && Array.isArray(signal) && signal.length > 0) setSignalData(signal);

      pushHistory({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        inputType: 'image',
        filename: file.name,
        user: currentUser?.name || 'Unknown',
        prediction: data.prediction,
        aiSummary: '',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert(error.message || 'Failed to analyze Image.');
    } finally {
      setLoading(false);
    }
  };

  // Called by ReportSummaryView when Gemini summary becomes available
  const handleSummaryReady = (summary) => {
    setAnalysisHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], aiSummary: summary };
      localStorage.setItem('neuro_history', JSON.stringify(updated));
      return updated;
    });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Analysis':
        return (
          <AnalysisView
            signalData={signalData}
            spectrogram={spectrogram}
            riskScore={riskScore}
            analysisResult={analysisResult}
            loading={loading}
            handleCsvUpload={handleCsvUpload}
            handleImageUpload={handleImageUpload}
          />
        );
      case 'Patient Records':
        return <PatientRecordsView />;
      case 'Report Summary':
        return (
          <ReportSummaryView
            signalData={signalData}
            spectrogram={spectrogram}
            riskScore={riskScore}
            analysisResult={analysisResult}
            loading={loading}
            onSummaryReady={handleSummaryReady}
          />
        );
      case 'Model Metrics':
        return <ModelMetricsView />;
      case 'System Admin':
        return <AdminView sessions={loginSessions} analysisHistory={analysisHistory} />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <AnalysisView />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={currentUser}
      onLogout={handleLogout}
    >
      {renderActiveView()}
    </DashboardLayout>
  );
}

export default App;
