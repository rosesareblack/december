"use client";

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Code, 
  Rocket, 
  GitBranch,
  Settings,
  Activity,
  Download,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  FileText
} from 'lucide-react';
import { CompleteProjectDelivery, deliverProject, generateDeliveryReport } from '../../../lib/services/projectDelivery';
import { toast } from 'react-hot-toast';

interface DeploymentDashboardProps {
  projectId: string;
  onClose: () => void;
}

export const DeploymentDashboard = ({ projectId, onClose }: DeploymentDashboardProps) => {
  const [delivery, setDelivery] = useState<CompleteProjectDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deployment' | 'maintenance' | 'audit'>('overview');

  useEffect(() => {
    loadDeliveryData();
  }, [projectId]);

  const loadDeliveryData = async () => {
    setLoading(true);
    try {
      const data = await deliverProject(projectId);
      setDelivery(data);
    } catch (error) {
      console.error('Failed to load delivery data:', error);
      toast.error('Failed to analyze project');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    const actions: Record<string, () => void> = {
      'qa-001': () => window.open('https://vercel.com/new', '_blank'),
      'qa-002': () => toast('GitHub CLI required: Run "gh repo create"', { icon: '💻' }),
      'qa-003': () => toast('Creating GitHub Actions workflow...', { icon: '⚙️' }),
      'qa-004': () => toast('Analytics integration coming soon!', { icon: '📊' }),
      'qa-005': () => toast('Environment configuration...', { icon: '🔧' }),
    };

    const action = actions[actionId];
    if (action) {
      action();
    }
  };

  const downloadReport = () => {
    if (!delivery) return;
    
    const report = generateDeliveryReport(delivery);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-report-${projectId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded!');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 shadow-2xl max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Project</h3>
            <p className="text-gray-400">Running quality audit, generating deployment guide...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 shadow-2xl max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
            <p className="text-gray-400 mb-4">Unable to analyze project</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl border border-gray-700 border-b-0 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  🚀 Project Delivery Dashboard
                </h2>
                <p className="text-gray-400">
                  Complete analysis, deployment guidance, and maintenance plan
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Score Banner */}
            <div className="mt-6 flex items-center gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-bold ${
                    delivery.summary.score >= 90 ? 'text-green-400' :
                    delivery.summary.score >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {delivery.summary.score}
                  </div>
                  <div>
                    <div className="text-white font-semibold">Quality Score</div>
                    <div className="text-sm text-gray-400">
                      {delivery.summary.framework} • {delivery.summary.fileCount} files
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                delivery.readyForProduction 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {delivery.readyForProduction ? '✅ Production Ready' : '⚠️ Needs Review'}
              </div>

              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-900 border-x border-gray-700">
            <div className="flex gap-2 p-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'deployment', label: 'Deployment', icon: Rocket },
                { id: 'maintenance', label: 'Maintenance', icon: Settings },
                { id: 'audit', label: 'Quality Audit', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-800 text-white border border-gray-600'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-900 border border-gray-700 rounded-b-xl p-6">
            {activeTab === 'overview' && (
              <OverviewTab delivery={delivery} onQuickAction={handleQuickAction} />
            )}
            {activeTab === 'deployment' && (
              <DeploymentTab delivery={delivery} onQuickAction={handleQuickAction} />
            )}
            {activeTab === 'maintenance' && (
              <MaintenanceTab delivery={delivery} />
            )}
            {activeTab === 'audit' && (
              <AuditTab delivery={delivery} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ delivery, onQuickAction }: { 
  delivery: CompleteProjectDelivery;
  onQuickAction: (id: string) => void;
}) => (
  <div className="space-y-6">
    {/* Quick Actions */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {delivery.deploymentGuide.quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.id)}
            disabled={!action.enabled}
            className="p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {action.label}
            </div>
            <div className="text-sm text-gray-400 mt-1">{action.description}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Immediate Next Steps */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        Immediate Next Steps
      </h3>
      <div className="space-y-3">
        {delivery.nextSteps.immediate.map((step, index) => (
          <div
            key={step.id}
            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    step.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    step.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {step.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                <div className="text-xs text-gray-500">⏱️ {step.estimatedTime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations & Warnings */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {delivery.summary.recommendations.length > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {delivery.summary.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {delivery.summary.warnings.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings
          </h4>
          <ul className="space-y-2">
            {delivery.summary.warnings.map((warn, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                {warn}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// Deployment Tab
const DeploymentTab = ({ delivery, onQuickAction }: {
  delivery: CompleteProjectDelivery;
  onQuickAction: (id: string) => void;
}) => (
  <div className="space-y-6">
    {/* Recommended Platforms */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Recommended Platforms</h3>
      <div className="space-y-4">
        {delivery.deploymentGuide.recommendedPlatforms.slice(0, 3).map((platform, index) => (
          <div
            key={platform.id}
            className="p-5 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-semibold text-white">{platform.displayName}</h4>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{platform.reason}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    ⏱️ {platform.estimatedTime}
                  </span>
                  <span className="text-gray-500">
                    📊 {platform.difficulty}
                  </span>
                  <span className="text-gray-500">
                    💰 {platform.cost}
                  </span>
                </div>
              </div>
              {index === 0 && (
                <button
                  onClick={() => onQuickAction('qa-001')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  Deploy Now
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-semibold text-white mb-2">Features:</h5>
              <div className="flex flex-wrap gap-2">
                {platform.features.map(feature => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Git Workflow */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        Git Workflow
      </h3>
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="space-y-3">
          {delivery.deploymentGuide.gitWorkflow.commands.slice(0, 5).map((cmd, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{cmd.description}</p>
                <code className="block text-sm text-white bg-gray-900 px-3 py-2 rounded border border-gray-700 font-mono">
                  {cmd.command}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Maintenance Tab
const MaintenanceTab = ({ delivery }: { delivery: CompleteProjectDelivery }) => (
  <div className="space-y-6">
    {/* Daily Tasks */}
    <MaintenanceSection
      title="Daily Tasks"
      tasks={delivery.maintenancePlan.daily}
      color="blue"
    />
    
    {/* Weekly Tasks */}
    <MaintenanceSection
      title="Weekly Tasks"
      tasks={delivery.maintenancePlan.weekly.slice(0, 3)}
      color="green"
    />
    
    {/* Monthly Tasks */}
    <MaintenanceSection
      title="Monthly Tasks"
      tasks={delivery.maintenancePlan.monthly.slice(0, 3)}
      color="purple"
    />
  </div>
);

const MaintenanceSection = ({ title, tasks, color }: {
  title: string;
  tasks: any[];
  color: 'blue' | 'green' | 'purple';
}) => {
  const colorClasses = {
    blue: 'text-blue-400 border-blue-500/30',
    green: 'text-green-400 border-green-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${colorClasses[color]}`}>{title}</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{task.title}</h4>
              <span className="text-xs text-gray-500">{task.estimatedTime}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{task.description}</p>
            {task.checklist && task.checklist.length > 0 && (
              <ul className="space-y-1">
                {task.checklist.slice(0, 3).map((item: string, index: number) => (
                  <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Audit Tab
const AuditTab = ({ delivery }: { delivery: CompleteProjectDelivery }) => {
  const categorizedChecks = delivery.auditReport.checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {Object.entries(categorizedChecks).map(([category, checks]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
            {category.replace('-', ' ')}
          </h3>
          <div className="space-y-2">
            {checks.map(check => (
              <div
                key={check.id}
                className={`p-4 rounded-lg border ${
                  check.status === 'pass' ? 'bg-green-500/10 border-green-500/30' :
                  check.status === 'warn' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {check.status === 'pass' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : check.status === 'warn' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{check.name}</h4>
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                        {check.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{check.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
