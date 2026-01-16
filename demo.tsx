import React, { useState, useEffect } from 'react';
import { Mic, Send, MapPin, TrendingUp, Users, AlertCircle, CheckCircle, BarChart3, Phone, MessageSquare, Volume2, Brain, Cloud, Zap } from 'lucide-react';

const CivicPulseAI = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userContext, setUserContext] = useState({
    name: 'Sarah Johnson',
    district: 'Downtown Kingston',
    preferences: ['Infrastructure', 'Public Safety'],
    previousReports: 3
  });

  // Simulated real-time civic issues data
  const [civicIssues, setCivicIssues] = useState([
    { id: 1, type: 'Pothole', location: 'Princess St & Division', status: 'In Progress', urgency: 'high', reports: 12, trend: 'up' },
    { id: 2, type: 'Snow Removal', location: 'University District', status: 'Pending', urgency: 'medium', reports: 8, trend: 'stable' },
    { id: 3, type: 'Streetlight Out', location: 'King St W', status: 'Resolved', urgency: 'low', reports: 3, trend: 'down' },
    { id: 4, type: 'Park Maintenance', location: 'Breakwater Park', status: 'Pending', urgency: 'medium', reports: 5, trend: 'up' },
    { id: 5, type: 'Traffic Signal', location: 'Bath Rd', status: 'In Progress', urgency: 'high', reports: 15, trend: 'up' }
  ]);

  const [analytics, setAnalytics] = useState({
    totalReports: 847,
    resolvedThisWeek: 42,
    avgResponseTime: '2.3 days',
    citizenSatisfaction: 87,
    activeIssues: 156
  });

  // Simulated AI chat responses
  const aiResponses = {
    greeting: "Hello! I'm CivicPulse AI, your voice-enabled civic assistant. I can help you report issues, check on existing reports, or provide information about city services. What can I help you with today?",
    reportPothole: "I understand you want to report a pothole. Using your location, I've identified you're in the Downtown Kingston area. Could you provide the specific street or intersection?",
    checkStatus: "Based on your previous reports and location history stored in Backboard.io, I see you reported a pothole on Princess Street 3 days ago. The city has marked it 'In Progress' with an estimated repair time of 5-7 days.",
    voiceConfirm: "I've transcribed your voice message using ElevenLabs AI. You reported: 'Large pothole on Division Street near the university causing traffic issues.' Should I submit this to the city?",
    contextual: "Based on your profile, you're interested in Infrastructure issues. I notice there are 3 similar reports in your district this week. Would you like to see them?",
    prediction: "AI analysis predicts this issue will be resolved within 48 hours based on current city response patterns and resource allocation."
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, { type: 'user', text: inputMessage }]);
    setIsProcessing(true);
    
    setTimeout(() => {
      const response = inputMessage.toLowerCase().includes('pothole') 
        ? aiResponses.reportPothole 
        : inputMessage.toLowerCase().includes('status')
        ? aiResponses.checkStatus
        : aiResponses.contextual;
      
      setMessages(prev => [...prev, { type: 'ai', text: response }]);
      setIsProcessing(false);
    }, 1500);
    
    setInputMessage('');
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setMessages(prev => [...prev, 
          { type: 'user', text: '🎤 "There\'s a large pothole on Division Street near the university"' },
          { type: 'ai', text: aiResponses.voiceConfirm }
        ]);
        setIsListening(false);
      }, 3000);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CivicPulse AI
                </h1>
                <p className="text-xs text-gray-600">Kingston Civic Engagement Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{userContext.district}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {userContext.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Technology Stack Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>AWS Cloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>ElevenLabs Voice AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Backboard.io Context</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
          {['dashboard', 'chat', 'issues', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Reports', value: analytics.totalReports, icon: MessageSquare, color: 'blue' },
                { label: 'Resolved This Week', value: analytics.resolvedThisWeek, icon: CheckCircle, color: 'green' },
                { label: 'Avg Response Time', value: analytics.avgResponseTime, icon: TrendingUp, color: 'yellow' },
                { label: 'Satisfaction Rate', value: `${analytics.citizenSatisfaction}%`, icon: Users, color: 'purple' },
                { label: 'Active Issues', value: analytics.activeIssues, icon: AlertCircle, color: 'red' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Personalized Insights */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">AI-Powered Insights for {userContext.name}</h3>
                  <p className="text-white/90 text-sm mb-3">
                    Based on your location and preferences, we've identified 3 infrastructure issues in your district requiring attention. 
                    Your previous reports have helped resolve {userContext.previousReports} issues this month.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all text-sm font-medium">
                      View Recommendations
                    </button>
                    <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-all text-sm font-medium">
                      Report New Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Issues Map */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Issues in Your District
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {civicIssues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{issue.type}</h4>
                        <p className="text-sm text-gray-600">{issue.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(issue.status)}`} />
                        <span className="text-sm text-gray-700">{issue.status}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{issue.reports} reports</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Chat View */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Voice & Text AI Assistant
              </h3>
              <p className="text-sm text-gray-600 mt-1">Powered by ElevenLabs & Backboard.io contextual memory</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4" />
                  <p className="text-center">Start a conversation or use voice input to report civic issues</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-3 rounded-xl transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message or use voice input..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issues View */}
        {activeTab === 'issues' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">All Civic Issues - Real-time Tracking</h3>
            <div className="space-y-3">
              {civicIssues.map((issue) => (
                <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{issue.type}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(issue.urgency)}`}>
                          {issue.urgency.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(issue.status)}`} />
                          <span className="text-sm text-gray-600">{issue.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {issue.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{issue.reports}</p>
                      </div>
                      <TrendingUp className={`w-6 h-6 ${issue.trend === 'up' ? 'text-red-500' : issue.trend === 'down' ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Predictive Analytics Dashboard
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">Response Time Prediction</h4>
                  <p className="text-sm text-gray-600 mt-1">AI predicts 23% faster resolution for infrastructure issues this quarter based on resource allocation patterns</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">Seasonal Trends</h4>
                  <p className="text-sm text-gray-600 mt-1">Winter snow removal requests expected to peak in 14 days. Recommended 15% resource increase</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">Citizen Engagement</h4>
                  <p className="text-sm text-gray-600 mt-1">Voice-enabled reporting increased participation by 34% in the Downtown Kingston district</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">Resource Optimization</h4>
                  <p className="text-sm text-gray-600 mt-1">AWS-powered analytics identified 12 redundant work orders, saving an estimated 18 staff-hours</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">Impact Metrics</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">847</p>
                  <p className="text-sm opacity-90">Issues Reported</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">634</p>
                  <p className="text-sm opacity-90">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">87%</p>
                  <p className="text-sm opacity-90">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm opacity-75">KingHacks 2026 - Built for Kingston's Future</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs opacity-60">
            <span>AWS Lambda + S3</span>
            <span>•</span>
            <span>ElevenLabs Voice API</span>
            <span>•</span>
            <span>Backboard.io Memory</span>
            <span>•</span>
            <span>React + TailwindCSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CivicPulseAI;