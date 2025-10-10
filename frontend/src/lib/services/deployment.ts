// Intelligent deployment guidance generator

import { ProjectAnalysis } from './audit';

export interface DeploymentGuide {
  projectType: string;
  recommendedPlatforms: Platform[];
  gitWorkflow: GitInstructions;
  environmentSetup: EnvironmentInstructions;
  postDeployment: PostDeploymentTask[];
  quickActions: QuickAction[];
  troubleshooting: TroubleshootingGuide;
}

export interface Platform {
  id: string;
  name: 'vercel' | 'netlify' | 'railway' | 'render' | 'github-pages' | 'cloudflare-pages';
  displayName: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  cost: 'free' | 'freemium' | 'paid';
  bestFor: string[];
  steps: DeploymentStep[];
  estimatedTime: string;
  features: string[];
}

export interface DeploymentStep {
  number: number;
  title: string;
  description: string;
  commands?: string[];
  notes?: string[];
  links?: Array<{ text: string; url: string }>;
}

export interface GitInstructions {
  needsInit: boolean;
  suggestedCommitMessage: string;
  branchStrategy: string;
  gitignoreUpdates: string[];
  commands: GitCommand[];
  tips: string[];
}

export interface GitCommand {
  command: string;
  description: string;
  optional: boolean;
}

export interface EnvironmentInstructions {
  required: EnvVariable[];
  optional: EnvVariable[];
  setupSteps: string[];
  securityNotes: string[];
}

export interface EnvVariable {
  name: string;
  description: string;
  example: string;
  required: boolean;
  platform: string;
}

export interface PostDeploymentTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'monitoring' | 'configuration';
  completed: boolean;
  steps: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: 'deploy' | 'create-repo' | 'setup-ci' | 'add-analytics' | 'configure-env';
  url?: string;
  enabled: boolean;
}

export interface TroubleshootingGuide {
  commonIssues: TroubleshootingIssue[];
  faq: FAQ[];
  supportLinks: SupportLink[];
}

export interface TroubleshootingIssue {
  issue: string;
  symptoms: string[];
  solutions: string[];
  prevention: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface SupportLink {
  title: string;
  url: string;
  type: 'documentation' | 'community' | 'support';
}

// Generate comprehensive deployment guide
export async function generateDeploymentGuide(
  projectId: string,
  analysis: ProjectAnalysis
): Promise<DeploymentGuide> {
  const platforms = selectBestPlatforms(analysis);
  const gitWorkflow = generateGitWorkflow(projectId, analysis);
  const environmentSetup = generateEnvironmentSetup(analysis);
  const postDeployment = generatePostDeploymentTasks(analysis);
  const quickActions = generateQuickActions(analysis);
  const troubleshooting = generateTroubleshooting(analysis);

  return {
    projectType: analysis.projectType,
    recommendedPlatforms: platforms,
    gitWorkflow,
    environmentSetup,
    postDeployment,
    quickActions,
    troubleshooting,
  };
}

// Select best deployment platforms based on project analysis
function selectBestPlatforms(analysis: ProjectAnalysis): Platform[] {
  const platforms: Platform[] = [];

  if (analysis.projectType === 'nextjs') {
    // Vercel is best for Next.js
    platforms.push({
      id: 'vercel',
      name: 'vercel',
      displayName: 'Vercel',
      reason: 'Built by the creators of Next.js, optimized for the framework',
      difficulty: 'easy',
      cost: 'freemium',
      bestFor: ['Next.js', 'Static Sites', 'Serverless Functions'],
      estimatedTime: '5 minutes',
      features: [
        'Zero-config deployment',
        'Automatic HTTPS',
        'Global CDN',
        'Preview deployments',
        'Built-in analytics',
        'Edge Functions',
      ],
      steps: [
        {
          number: 1,
          title: 'Install Vercel CLI',
          description: 'Install the Vercel command-line tool',
          commands: ['npm install -g vercel'],
        },
        {
          number: 2,
          title: 'Deploy Your Project',
          description: 'Run the deploy command in your project directory',
          commands: ['vercel --prod'],
          notes: [
            'Follow the prompts to link your project',
            'Vercel will automatically detect Next.js configuration',
          ],
        },
        {
          number: 3,
          title: 'Configure Environment Variables',
          description: 'Add environment variables in Vercel dashboard',
          links: [{ text: 'Environment Variables Guide', url: 'https://vercel.com/docs/environment-variables' }],
        },
      ],
    });

    // Netlify as alternative
    platforms.push({
      id: 'netlify',
      name: 'netlify',
      displayName: 'Netlify',
      reason: 'Great alternative with excellent DX and features',
      difficulty: 'easy',
      cost: 'freemium',
      bestFor: ['Static Sites', 'JAMstack', 'Serverless Functions'],
      estimatedTime: '5-10 minutes',
      features: [
        'Continuous deployment',
        'Split testing',
        'Forms handling',
        'Identity management',
        'Edge Functions',
      ],
      steps: [
        {
          number: 1,
          title: 'Install Netlify CLI',
          description: 'Install the Netlify command-line tool',
          commands: ['npm install -g netlify-cli'],
        },
        {
          number: 2,
          title: 'Initialize and Deploy',
          description: 'Connect and deploy your site',
          commands: ['netlify init', 'netlify deploy --prod'],
        },
      ],
    });
  } else if (analysis.projectType === 'react') {
    // For React apps
    platforms.push({
      id: 'vercel',
      name: 'vercel',
      displayName: 'Vercel',
      reason: 'Excellent for React single-page applications',
      difficulty: 'easy',
      cost: 'freemium',
      bestFor: ['React', 'Vue', 'Angular', 'Static Sites'],
      estimatedTime: '5 minutes',
      features: ['Zero-config', 'Automatic HTTPS', 'Global CDN'],
      steps: [
        {
          number: 1,
          title: 'Install Vercel CLI',
          commands: ['npm install -g vercel'],
          description: 'Install Vercel globally',
        },
        {
          number: 2,
          title: 'Deploy',
          commands: ['vercel --prod'],
          description: 'Deploy your React app',
        },
      ],
    });

    platforms.push({
      id: 'github-pages',
      name: 'github-pages',
      displayName: 'GitHub Pages',
      reason: 'Free hosting for static sites with GitHub integration',
      difficulty: 'medium',
      cost: 'free',
      bestFor: ['Static Sites', 'Documentation', 'Personal Projects'],
      estimatedTime: '10-15 minutes',
      features: ['Free hosting', 'Custom domains', 'HTTPS support'],
      steps: [
        {
          number: 1,
          title: 'Install gh-pages',
          commands: ['npm install --save-dev gh-pages'],
          description: 'Add gh-pages package',
        },
        {
          number: 2,
          title: 'Add Deploy Script',
          description: 'Add deployment script to package.json',
          commands: ['"deploy": "npm run build && gh-pages -d build"'],
        },
        {
          number: 3,
          title: 'Deploy',
          commands: ['npm run deploy'],
          description: 'Build and deploy to GitHub Pages',
        },
      ],
    });
  }

  // Add Cloudflare Pages as modern alternative
  platforms.push({
    id: 'cloudflare-pages',
    name: 'cloudflare-pages',
    displayName: 'Cloudflare Pages',
    reason: 'Fast global deployment with Workers integration',
    difficulty: 'easy',
    cost: 'freemium',
    bestFor: ['Static Sites', 'Edge Computing', 'Global Apps'],
    estimatedTime: '5-10 minutes',
    features: [
      'Blazing fast CDN',
      'Unlimited bandwidth',
      'Workers integration',
      'Web Analytics',
    ],
    steps: [
      {
        number: 1,
        title: 'Connect Repository',
        description: 'Connect your GitHub/GitLab repository',
        links: [{ text: 'Cloudflare Pages', url: 'https://pages.cloudflare.com' }],
      },
      {
        number: 2,
        title: 'Configure Build',
        description: 'Set build command and output directory',
        notes: ['Build command: npm run build', 'Output directory: .next or build'],
      },
    ],
  });

  return platforms;
}

// Generate Git workflow instructions
function generateGitWorkflow(projectId: string, analysis: ProjectAnalysis): GitInstructions {
  const projectName = projectId.slice(0, 16);
  
  const commands: GitCommand[] = [
    {
      command: 'git init',
      description: 'Initialize Git repository',
      optional: false,
    },
    {
      command: 'git add .',
      description: 'Stage all files',
      optional: false,
    },
    {
      command: `git commit -m "✨ Initial commit: ${analysis.framework} ${analysis.projectType} project"`,
      description: 'Create initial commit with descriptive message',
      optional: false,
    },
    {
      command: 'git branch -M main',
      description: 'Rename branch to main',
      optional: true,
    },
    {
      command: `gh repo create ${projectName} --public --source=. --push`,
      description: 'Create GitHub repository and push (requires GitHub CLI)',
      optional: true,
    },
    {
      command: 'git remote add origin <repository-url>',
      description: 'Add remote repository (if not using gh CLI)',
      optional: true,
    },
    {
      command: 'git push -u origin main',
      description: 'Push to remote repository',
      optional: false,
    },
  ];

  const gitignoreUpdates = [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    '.DS_Store',
    '*.log',
    '.env*.local',
    '.vercel',
    '.netlify',
  ];

  const tips = [
    'Use meaningful commit messages following conventional commits',
    'Create .gitignore before first commit to avoid committing sensitive files',
    'Use branches for features: git checkout -b feature/new-feature',
    'Protect your main branch in GitHub settings',
    'Set up branch protection rules to require pull request reviews',
  ];

  return {
    needsInit: true,
    suggestedCommitMessage: `✨ Initial commit: ${analysis.framework} ${analysis.projectType} project\n\n- Set up project structure\n- Add core functionality\n- Configure build tools`,
    branchStrategy: 'main branch for production, feature branches for development',
    gitignoreUpdates,
    commands,
    tips,
  };
}

// Generate environment setup instructions
function generateEnvironmentSetup(analysis: ProjectAnalysis): EnvironmentInstructions {
  const required: EnvVariable[] = [];
  const optional: EnvVariable[] = [];

  // Detect what environment variables might be needed
  if (analysis.projectType === 'nextjs') {
    optional.push({
      name: 'NEXT_PUBLIC_API_URL',
      description: 'Base URL for your API endpoints',
      example: 'https://api.example.com',
      required: false,
      platform: 'all',
    });

    optional.push({
      name: 'DATABASE_URL',
      description: 'Database connection string (if using database)',
      example: 'postgresql://user:password@host:5432/db',
      required: false,
      platform: 'all',
    });
  }

  // Add AI API key if needed
  if (analysis.dependencies.some(d => d.name === 'openai')) {
    required.push({
      name: 'NEXT_PUBLIC_AI_API_KEY',
      description: 'API key for AI services',
      example: 'sk-...',
      required: true,
      platform: 'all',
    });
  }

  const setupSteps = [
    'Create .env.local file in your project root',
    'Copy .env.local.example if available',
    'Fill in all required environment variables',
    'Never commit .env.local to version control',
    'Add environment variables to your deployment platform',
  ];

  const securityNotes = [
    '🔒 Never commit API keys or secrets to Git',
    '🔒 Use NEXT_PUBLIC_ prefix only for client-safe variables',
    '🔒 Rotate keys if accidentally exposed',
    '🔒 Use platform-specific secret management when possible',
    '🔒 Implement rate limiting for API endpoints',
  ];

  return {
    required,
    optional,
    setupSteps,
    securityNotes,
  };
}

// Generate post-deployment tasks
function generatePostDeploymentTasks(analysis: ProjectAnalysis): PostDeploymentTask[] {
  const tasks: PostDeploymentTask[] = [
    {
      id: 'pd-001',
      title: 'Verify Deployment',
      description: 'Check that your application is running correctly',
      priority: 'critical',
      category: 'configuration',
      completed: false,
      steps: [
        'Visit your deployed URL',
        'Test main functionality',
        'Check console for errors',
        'Verify API endpoints work',
      ],
    },
    {
      id: 'pd-002',
      title: 'Configure Custom Domain',
      description: 'Set up your custom domain name',
      priority: 'high',
      category: 'configuration',
      completed: false,
      steps: [
        'Purchase domain from registrar',
        'Add domain in platform settings',
        'Update DNS records',
        'Wait for DNS propagation (up to 48 hours)',
        'Verify HTTPS certificate',
      ],
    },
    {
      id: 'pd-003',
      title: 'Set Up Monitoring',
      description: 'Add error tracking and performance monitoring',
      priority: 'high',
      category: 'monitoring',
      completed: false,
      steps: [
        'Sign up for error tracking (Sentry, LogRocket)',
        'Install monitoring SDK',
        'Configure error reporting',
        'Set up alerts for critical errors',
        'Add uptime monitoring',
      ],
    },
    {
      id: 'pd-004',
      title: 'Enable Analytics',
      description: 'Track user behavior and application usage',
      priority: 'medium',
      category: 'monitoring',
      completed: false,
      steps: [
        'Choose analytics provider (Google Analytics, Plausible)',
        'Add tracking code',
        'Configure event tracking',
        'Set up conversion goals',
        'Verify data collection',
      ],
    },
    {
      id: 'pd-005',
      title: 'Security Hardening',
      description: 'Implement security best practices',
      priority: 'critical',
      category: 'security',
      completed: false,
      steps: [
        'Enable HTTPS (should be automatic)',
        'Add security headers',
        'Configure CORS properly',
        'Implement rate limiting',
        'Enable DDoS protection',
        'Set up Web Application Firewall (WAF)',
      ],
    },
    {
      id: 'pd-006',
      title: 'Performance Optimization',
      description: 'Optimize application performance',
      priority: 'medium',
      category: 'performance',
      completed: false,
      steps: [
        'Run Lighthouse audit',
        'Optimize images and assets',
        'Enable CDN for static assets',
        'Configure caching headers',
        'Minimize JavaScript bundle size',
      ],
    },
  ];

  return tasks;
}

// Generate quick action buttons
function generateQuickActions(analysis: ProjectAnalysis): QuickAction[] {
  const actions: QuickAction[] = [
    {
      id: 'qa-001',
      label: 'Deploy to Vercel',
      description: 'One-click deployment to Vercel',
      icon: '🚀',
      action: 'deploy',
      url: 'https://vercel.com/new',
      enabled: true,
    },
    {
      id: 'qa-002',
      label: 'Create GitHub Repo',
      description: 'Initialize Git and create GitHub repository',
      icon: '📦',
      action: 'create-repo',
      enabled: true,
    },
    {
      id: 'qa-003',
      label: 'Setup CI/CD',
      description: 'Add GitHub Actions workflow',
      icon: '⚙️',
      action: 'setup-ci',
      enabled: !analysis.hasCI,
    },
    {
      id: 'qa-004',
      label: 'Add Analytics',
      description: 'Integrate analytics tracking',
      icon: '📊',
      action: 'add-analytics',
      enabled: true,
    },
    {
      id: 'qa-005',
      label: 'Configure Environment',
      description: 'Set up environment variables',
      icon: '🔧',
      action: 'configure-env',
      enabled: true,
    },
  ];

  return actions;
}

// Generate troubleshooting guide
function generateTroubleshooting(analysis: ProjectAnalysis): TroubleshootingGuide {
  const commonIssues: TroubleshootingIssue[] = [
    {
      issue: 'Build Fails on Deployment',
      symptoms: [
        'Deployment fails during build step',
        'Missing dependencies error',
        'TypeScript compilation errors',
      ],
      solutions: [
        'Check that all dependencies are in package.json',
        'Verify Node.js version matches local development',
        'Run npm install locally to test build',
        'Check for environment variable issues',
        'Review build logs for specific errors',
      ],
      prevention: 'Test builds locally before deploying: npm run build',
    },
    {
      issue: 'Environment Variables Not Working',
      symptoms: [
        'API calls fail in production',
        'Configuration values are undefined',
        'Features work locally but not in production',
      ],
      solutions: [
        'Verify all env variables are set in platform dashboard',
        'Check variable names match exactly (case-sensitive)',
        'Ensure NEXT_PUBLIC_ prefix for client-side variables',
        'Redeploy after adding environment variables',
        'Check that .env.local is not committed to Git',
      ],
      prevention: 'Document all required environment variables in README',
    },
    {
      issue: 'Page Not Found (404) Errors',
      symptoms: [
        '404 errors on deployed site',
        'Routes work locally but not in production',
        'Direct URL access fails',
      ],
      solutions: [
        'Check routing configuration',
        'Verify all pages are in correct directory',
        'For SPAs, configure rewrites/redirects',
        'Check build output includes all pages',
        'Verify static export configuration if using',
      ],
      prevention: 'Test all routes before deployment',
    },
  ];

  const faq: FAQ[] = [
    {
      question: 'How long does deployment take?',
      answer: 'Typically 1-5 minutes for most platforms. First deployment may take longer as it sets up infrastructure.',
      category: 'deployment',
    },
    {
      question: 'Can I preview changes before deploying to production?',
      answer: 'Yes! Most platforms (Vercel, Netlify) automatically create preview deployments for pull requests.',
      category: 'deployment',
    },
    {
      question: 'How do I rollback a deployment?',
      answer: 'Most platforms keep previous deployments. You can instantly rollback from the dashboard or redeploy a previous commit.',
      category: 'deployment',
    },
    {
      question: 'What about database migrations?',
      answer: 'Run migrations before deployment using CI/CD pipelines or platform-specific deployment hooks.',
      category: 'database',
    },
  ];

  const supportLinks: SupportLink[] = [
    {
      title: 'Vercel Documentation',
      url: 'https://vercel.com/docs',
      type: 'documentation',
    },
    {
      title: 'Next.js Deployment Guide',
      url: 'https://nextjs.org/docs/deployment',
      type: 'documentation',
    },
    {
      title: 'Netlify Support',
      url: 'https://docs.netlify.com',
      type: 'documentation',
    },
    {
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      type: 'community',
    },
  ];

  return {
    commonIssues,
    faq,
    supportLinks,
  };
}

// Generate formatted deployment instructions text
export function formatDeploymentGuide(guide: DeploymentGuide): string {
  let output = `
┌─────────────────────────────────────────────────────────────────┐
│  🚀 Your ${guide.projectType.toUpperCase()} Project is Ready for Deployment!  │
└─────────────────────────────────────────────────────────────────┘

`;

  // Recommended platforms
  output += `\n📋 RECOMMENDED DEPLOYMENT PLATFORMS\n\n`;
  guide.recommendedPlatforms.slice(0, 2).forEach((platform, index) => {
    output += `${index + 1}️⃣  ${platform.displayName} (${platform.difficulty} • ${platform.cost})\n`;
    output += `   ${platform.reason}\n`;
    output += `   ⏱️  Estimated time: ${platform.estimatedTime}\n\n`;
  });

  // Git workflow
  output += `\n📦 GIT WORKFLOW\n\n`;
  guide.gitWorkflow.commands.forEach((cmd, index) => {
    if (!cmd.optional || index < 4) {
      output += `${index + 1}. ${cmd.description}\n`;
      output += `   $ ${cmd.command}\n\n`;
    }
  });

  // Environment variables
  if (guide.environmentSetup.required.length > 0) {
    output += `\n🔧 REQUIRED ENVIRONMENT VARIABLES\n\n`;
    guide.environmentSetup.required.forEach(env => {
      output += `   ${env.name}=${env.example}\n`;
      output += `   → ${env.description}\n\n`;
    });
  }

  // Quick actions
  output += `\n⚡ QUICK ACTIONS\n\n`;
  guide.quickActions.slice(0, 5).forEach(action => {
    output += `${action.icon} ${action.label}\n`;
  });

  output += `\n✨ Your project is ready to go live!\n`;

  return output;
}
