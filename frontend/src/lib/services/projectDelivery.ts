// Complete project delivery service - integrates audit, deployment, and maintenance

import { auditProject, analyzeProject, ProjectAnalysis, AuditResult } from './audit';
import { generateDeploymentGuide, DeploymentGuide, formatDeploymentGuide } from './deployment';
import { generateMaintenancePlan, MaintenancePlan, formatMaintenancePlan } from './maintenance';

export interface CompleteProjectDelivery {
  projectFiles: Array<{ path: string; content: string }>;
  analysis: ProjectAnalysis;
  auditReport: AuditResult;
  deploymentGuide: DeploymentGuide;
  maintenancePlan: MaintenancePlan;
  summary: ProjectSummary;
  nextSteps: NextSteps;
  readyForProduction: boolean;
}

export interface ProjectSummary {
  projectType: string;
  framework: string;
  score: number;
  complexity: string;
  fileCount: number;
  recommendations: string[];
  warnings: string[];
}

export interface NextSteps {
  immediate: ActionItem[];
  shortTerm: ActionItem[];
  longTerm: ActionItem[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: string;
  actionable: boolean;
  quickActionId?: string;
}

// Main function: Complete project analysis and delivery
export async function deliverProject(projectId: string): Promise<CompleteProjectDelivery> {
  console.log('🚀 Starting complete project delivery analysis...');
  
  // 1. Analyze project structure
  console.log('📊 Analyzing project structure...');
  const analysis = await analyzeProject(projectId);
  
  // 2. Run comprehensive audit
  console.log('🔍 Running quality audit...');
  const auditReport = await auditProject(projectId);
  
  // 3. Generate deployment guide
  console.log('📦 Generating deployment guide...');
  const deploymentGuide = await generateDeploymentGuide(projectId, analysis);
  
  // 4. Create maintenance plan
  console.log('🔧 Creating maintenance plan...');
  const maintenancePlan = await generateMaintenancePlan(projectId, analysis);
  
  // 5. Generate summary and next steps
  console.log('✨ Generating recommendations...');
  const summary = generateProjectSummary(analysis, auditReport);
  const nextSteps = generateNextSteps(analysis, auditReport, deploymentGuide);
  
  // 6. Get project files
  const { listFiles } = await import('./fileSystem');
  const projectFiles = await listFiles(projectId);
  
  // 7. Determine if ready for production
  const readyForProduction = determineProductionReadiness(auditReport);
  
  console.log('✅ Project delivery analysis complete!');
  
  return {
    projectFiles,
    analysis,
    auditReport,
    deploymentGuide,
    maintenancePlan,
    summary,
    nextSteps,
    readyForProduction,
  };
}

// Generate project summary
function generateProjectSummary(
  analysis: ProjectAnalysis,
  auditReport: AuditResult
): ProjectSummary {
  const recommendations: string[] = [];
  const warnings: string[] = [];
  
  // Add recommendations based on audit
  const criticalIssues = auditReport.checks.filter(
    c => c.status === 'fail' && c.impact === 'critical'
  );
  
  const highPriorityIssues = auditReport.checks.filter(
    c => c.status === 'fail' && c.impact === 'high'
  );
  
  if (criticalIssues.length > 0) {
    warnings.push(`${criticalIssues.length} critical security/quality issues found`);
    recommendations.push('Fix critical issues before deploying to production');
  }
  
  if (highPriorityIssues.length > 0) {
    warnings.push(`${highPriorityIssues.length} high-priority issues need attention`);
  }
  
  if (!analysis.hasTests) {
    recommendations.push('Add unit tests to improve reliability');
  }
  
  if (!analysis.hasCI) {
    recommendations.push('Set up CI/CD pipeline for automated testing');
  }
  
  if (!analysis.hasDocumentation) {
    recommendations.push('Add comprehensive README documentation');
  }
  
  if (auditReport.score >= 90) {
    recommendations.push('Project quality is excellent - ready for deployment!');
  } else if (auditReport.score >= 70) {
    recommendations.push('Project quality is good with room for improvement');
  } else {
    warnings.push('Project needs quality improvements before production');
  }
  
  return {
    projectType: analysis.projectType,
    framework: analysis.framework,
    score: auditReport.score,
    complexity: analysis.complexity,
    fileCount: analysis.fileCount,
    recommendations,
    warnings,
  };
}

// Generate contextual next steps
function generateNextSteps(
  analysis: ProjectAnalysis,
  auditReport: AuditResult,
  deploymentGuide: DeploymentGuide
): NextSteps {
  const immediate: ActionItem[] = [];
  const shortTerm: ActionItem[] = [];
  const longTerm: ActionItem[] = [];
  
  // Immediate actions (must do before deployment)
  const criticalChecks = auditReport.checks.filter(
    c => c.status === 'fail' && c.impact === 'critical'
  );
  
  criticalChecks.forEach(check => {
    immediate.push({
      id: `immediate-${check.id}`,
      title: `Fix: ${check.name}`,
      description: check.description,
      priority: 'critical',
      estimatedTime: '30 minutes',
      category: check.category,
      actionable: check.fixable,
    });
  });
  
  // Add deployment as immediate if no critical issues
  if (criticalChecks.length === 0) {
    immediate.push({
      id: 'immediate-deploy',
      title: 'Deploy to Production',
      description: `Deploy your ${analysis.framework} application to ${deploymentGuide.recommendedPlatforms[0]?.displayName || 'hosting platform'}`,
      priority: 'high',
      estimatedTime: '10-15 minutes',
      category: 'deployment',
      actionable: true,
      quickActionId: 'qa-001',
    });
    
    immediate.push({
      id: 'immediate-git',
      title: 'Initialize Git Repository',
      description: 'Set up version control and push to GitHub',
      priority: 'high',
      estimatedTime: '5 minutes',
      category: 'version-control',
      actionable: true,
      quickActionId: 'qa-002',
    });
  }
  
  // Configure environment variables
  if (deploymentGuide.environmentSetup.required.length > 0) {
    immediate.push({
      id: 'immediate-env',
      title: 'Configure Environment Variables',
      description: `Set up ${deploymentGuide.environmentSetup.required.length} required environment variables`,
      priority: 'high',
      estimatedTime: '10 minutes',
      category: 'configuration',
      actionable: true,
      quickActionId: 'qa-005',
    });
  }
  
  // Short-term actions (first week)
  if (!analysis.hasTests) {
    shortTerm.push({
      id: 'short-tests',
      title: 'Add Unit Tests',
      description: 'Implement unit tests for core functionality',
      priority: 'high',
      estimatedTime: '2-4 hours',
      category: 'testing',
      actionable: true,
    });
  }
  
  if (!analysis.hasCI) {
    shortTerm.push({
      id: 'short-ci',
      title: 'Set Up CI/CD Pipeline',
      description: 'Automate testing and deployment with GitHub Actions',
      priority: 'medium',
      estimatedTime: '1-2 hours',
      category: 'automation',
      actionable: true,
      quickActionId: 'qa-003',
    });
  }
  
  shortTerm.push({
    id: 'short-monitoring',
    title: 'Add Monitoring and Analytics',
    description: 'Set up error tracking and user analytics',
    priority: 'medium',
    estimatedTime: '1-2 hours',
    category: 'monitoring',
    actionable: true,
    quickActionId: 'qa-004',
  });
  
  // Add improvements from audit
  auditReport.improvements.slice(0, 3).forEach((improvement, index) => {
    shortTerm.push({
      id: `short-imp-${index}`,
      title: improvement.title,
      description: improvement.description,
      priority: improvement.priority === 'high' ? 'high' : 'medium',
      estimatedTime: improvement.estimatedEffort,
      category: improvement.category,
      actionable: true,
    });
  });
  
  // Long-term actions (first month)
  longTerm.push({
    id: 'long-perf',
    title: 'Performance Optimization',
    description: 'Optimize application performance and Core Web Vitals',
    priority: 'medium',
    estimatedTime: '4-8 hours',
    category: 'performance',
    actionable: true,
  });
  
  longTerm.push({
    id: 'long-security',
    title: 'Security Hardening',
    description: 'Implement comprehensive security measures and auditing',
    priority: 'high',
    estimatedTime: '4-6 hours',
    category: 'security',
    actionable: true,
  });
  
  if (analysis.complexity !== 'simple') {
    longTerm.push({
      id: 'long-scale',
      title: 'Scalability Planning',
      description: 'Plan for application scaling and growth',
      priority: 'medium',
      estimatedTime: '2-4 hours',
      category: 'architecture',
      actionable: true,
    });
  }
  
  longTerm.push({
    id: 'long-docs',
    title: 'Documentation Enhancement',
    description: 'Create comprehensive documentation for API and components',
    priority: 'low',
    estimatedTime: '3-5 hours',
    category: 'documentation',
    actionable: true,
  });
  
  return {
    immediate: immediate.slice(0, 5),
    shortTerm: shortTerm.slice(0, 5),
    longTerm: longTerm.slice(0, 5),
  };
}

// Determine if project is ready for production
function determineProductionReadiness(auditReport: AuditResult): boolean {
  // Check for critical failures
  const hasCriticalIssues = auditReport.checks.some(
    check => check.status === 'fail' && check.impact === 'critical'
  );
  
  if (hasCriticalIssues) {
    return false;
  }
  
  // Check overall score
  if (auditReport.score < 60) {
    return false;
  }
  
  // Check for errors
  if (auditReport.errors && auditReport.errors.length > 0) {
    return false;
  }
  
  return true;
}

// Generate complete delivery report
export function generateDeliveryReport(delivery: CompleteProjectDelivery): string {
  let report = `
╔══════════════════════════════════════════════════════════════════╗
║                    PROJECT DELIVERY REPORT                       ║
╚══════════════════════════════════════════════════════════════════╝

`;

  // Project Summary
  report += `\n📊 PROJECT SUMMARY\n`;
  report += `${'─'.repeat(66)}\n`;
  report += `Type:       ${delivery.summary.projectType.toUpperCase()}\n`;
  report += `Framework:  ${delivery.summary.framework}\n`;
  report += `Quality:    ${delivery.summary.score}/100 ${getScoreEmoji(delivery.summary.score)}\n`;
  report += `Files:      ${delivery.summary.fileCount}\n`;
  report += `Complexity: ${delivery.summary.complexity}\n`;
  report += `Status:     ${delivery.readyForProduction ? '✅ Ready for Production' : '⚠️  Needs Improvements'}\n\n`;

  // Recommendations
  if (delivery.summary.recommendations.length > 0) {
    report += `\n✨ RECOMMENDATIONS\n`;
    report += `${'─'.repeat(66)}\n`;
    delivery.summary.recommendations.forEach(rec => {
      report += `• ${rec}\n`;
    });
    report += '\n';
  }

  // Warnings
  if (delivery.summary.warnings.length > 0) {
    report += `\n⚠️  WARNINGS\n`;
    report += `${'─'.repeat(66)}\n`;
    delivery.summary.warnings.forEach(warn => {
      report += `• ${warn}\n`;
    });
    report += '\n';
  }

  // Next Steps
  report += `\n🎯 IMMEDIATE NEXT STEPS\n`;
  report += `${'─'.repeat(66)}\n`;
  delivery.nextSteps.immediate.forEach((step, index) => {
    report += `${index + 1}. ${step.title}\n`;
    report += `   ${step.description}\n`;
    report += `   ⏱️  ${step.estimatedTime} | Priority: ${step.priority.toUpperCase()}\n\n`;
  });

  // Deployment Guide Preview
  report += `\n🚀 DEPLOYMENT GUIDE\n`;
  report += `${'─'.repeat(66)}\n`;
  report += `Recommended Platform: ${delivery.deploymentGuide.recommendedPlatforms[0]?.displayName}\n`;
  report += `Estimated Time: ${delivery.deploymentGuide.recommendedPlatforms[0]?.estimatedTime}\n`;
  report += `Difficulty: ${delivery.deploymentGuide.recommendedPlatforms[0]?.difficulty}\n\n`;

  // Footer
  report += `\n${'═'.repeat(66)}\n`;
  report += `📚 Full guides available in the UI for:\n`;
  report += `   • Detailed deployment instructions\n`;
  report += `   • Maintenance schedules\n`;
  report += `   • Quality improvements\n`;
  report += `   • Troubleshooting guides\n`;
  report += `\n✨ Your project is ready to go live!\n`;

  return report;
}

// Helper function to get score emoji
function getScoreEmoji(score: number): string {
  if (score >= 90) return '🌟';
  if (score >= 80) return '✨';
  if (score >= 70) return '👍';
  if (score >= 60) return '⚠️';
  return '❌';
}

// Export all formatted guides
export async function exportAllGuides(projectId: string): Promise<{
  deploymentGuide: string;
  maintenancePlan: string;
  deliveryReport: string;
}> {
  const delivery = await deliverProject(projectId);
  
  return {
    deploymentGuide: formatDeploymentGuide(delivery.deploymentGuide),
    maintenancePlan: formatMaintenancePlan(delivery.maintenancePlan),
    deliveryReport: generateDeliveryReport(delivery),
  };
}
