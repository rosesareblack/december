// Project audit and quality analysis service

export interface AuditResult {
  score: number; // 0-100
  timestamp: string;
  checks: AuditCheck[];
  improvements: Improvement[];
  warnings: Warning[];
  errors: Error[];
  suggestions: Suggestion[];
}

export interface AuditCheck {
  id: string;
  category: 'security' | 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'code-quality';
  name: string;
  status: 'pass' | 'warn' | 'fail';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
  autoFixAvailable: boolean;
}

export interface Improvement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  benefits: string[];
  implementation: string;
}

export interface Warning {
  id: string;
  type: 'security' | 'performance' | 'compatibility' | 'deprecated';
  message: string;
  file?: string;
  line?: number;
  recommendation: string;
}

export interface Suggestion {
  id: string;
  category: 'feature' | 'optimization' | 'refactoring' | 'testing';
  title: string;
  description: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProjectAnalysis {
  projectType: 'nextjs' | 'react' | 'node' | 'python' | 'static';
  framework: string;
  dependencies: DependencyInfo[];
  fileCount: number;
  totalSize: number;
  complexity: 'simple' | 'medium' | 'complex';
  hasTests: boolean;
  hasDocumentation: boolean;
  hasCI: boolean;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
  outdated: boolean;
  vulnerabilities: number;
}

// Analyze project and generate audit report
export async function auditProject(projectId: string): Promise<AuditResult> {
  const { listFiles } = await import('./fileSystem');
  const files = await listFiles(projectId);
  
  const checks: AuditCheck[] = [];
  const improvements: Improvement[] = [];
  const warnings: Warning[] = [];
  const suggestions: Suggestion[] = [];
  
  // Run various audit checks
  checks.push(...await checkSecurity(files));
  checks.push(...await checkPerformance(files));
  checks.push(...await checkAccessibility(files));
  checks.push(...await checkBestPractices(files));
  checks.push(...await checkCodeQuality(files));
  
  // Generate improvements
  improvements.push(...await suggestImprovements(files));
  
  // Detect warnings
  warnings.push(...await detectWarnings(files));
  
  // Generate suggestions
  suggestions.push(...await generateSuggestions(files, checks));
  
  // Calculate overall score
  const score = calculateScore(checks);
  
  return {
    score,
    timestamp: new Date().toISOString(),
    checks,
    improvements,
    warnings,
    errors: [],
    suggestions,
  };
}

// Security checks
async function checkSecurity(files: Array<{ path: string; content: string }>): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  
  // Check for .env files committed
  const hasEnvFile = files.some(f => f.path === '.env' || f.path === '.env.local');
  checks.push({
    id: 'sec-001',
    category: 'security',
    name: 'Environment Variables',
    status: hasEnvFile ? 'warn' : 'pass',
    description: hasEnvFile 
      ? 'Environment files detected - ensure they are in .gitignore'
      : 'No sensitive environment files found',
    impact: 'critical',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key["\s:=]+[a-zA-Z0-9]{20,}/i,
    /secret["\s:=]+[a-zA-Z0-9]{20,}/i,
    /password["\s:=]+[^"'\s]{8,}/i,
  ];
  
  let hasHardcodedSecrets = false;
  for (const file of files) {
    if (secretPatterns.some(pattern => pattern.test(file.content))) {
      hasHardcodedSecrets = true;
      break;
    }
  }
  
  checks.push({
    id: 'sec-002',
    category: 'security',
    name: 'Hardcoded Secrets',
    status: hasHardcodedSecrets ? 'fail' : 'pass',
    description: hasHardcodedSecrets
      ? 'Potential hardcoded secrets found in code'
      : 'No hardcoded secrets detected',
    impact: 'critical',
    fixable: true,
    autoFixAvailable: false,
  });
  
  // Check for HTTPS enforcement
  const hasHttpsCheck = files.some(f => 
    f.content.includes('https://') && 
    (f.content.includes('next.config') || f.content.includes('security'))
  );
  
  checks.push({
    id: 'sec-003',
    category: 'security',
    name: 'HTTPS Configuration',
    status: hasHttpsCheck ? 'pass' : 'warn',
    description: hasHttpsCheck
      ? 'HTTPS configuration found'
      : 'Consider adding HTTPS enforcement',
    impact: 'high',
    fixable: true,
    autoFixAvailable: true,
  });
  
  return checks;
}

// Performance checks
async function checkPerformance(files: Array<{ path: string; content: string }>): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  
  // Check for image optimization
  const hasImages = files.some(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.path));
  const usesNextImage = files.some(f => 
    f.content.includes('next/image') || f.content.includes('<Image')
  );
  
  checks.push({
    id: 'perf-001',
    category: 'performance',
    name: 'Image Optimization',
    status: hasImages && !usesNextImage ? 'warn' : 'pass',
    description: hasImages && !usesNextImage
      ? 'Images found but not using Next.js Image component'
      : 'Image optimization looks good',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for code splitting
  const hasDynamicImports = files.some(f => 
    f.content.includes('dynamic(') || f.content.includes('import(')
  );
  
  checks.push({
    id: 'perf-002',
    category: 'performance',
    name: 'Code Splitting',
    status: hasDynamicImports ? 'pass' : 'warn',
    description: hasDynamicImports
      ? 'Dynamic imports detected for code splitting'
      : 'Consider using dynamic imports for better performance',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for unnecessary dependencies
  const packageJson = files.find(f => f.path === 'package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      const depCount = Object.keys(pkg.dependencies || {}).length;
      
      checks.push({
        id: 'perf-003',
        category: 'performance',
        name: 'Bundle Size',
        status: depCount > 50 ? 'warn' : 'pass',
        description: depCount > 50
          ? `Large number of dependencies (${depCount}) may impact bundle size`
          : 'Dependency count looks reasonable',
        impact: 'medium',
        fixable: true,
        autoFixAvailable: false,
      });
    } catch (e) {
      // Invalid JSON
    }
  }
  
  return checks;
}

// Accessibility checks
async function checkAccessibility(files: Array<{ path: string; content: string }>): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  
  // Check for alt text on images
  const hasImgWithoutAlt = files.some(f => 
    f.content.includes('<img') && !f.content.match(/<img[^>]*alt=/i)
  );
  
  checks.push({
    id: 'a11y-001',
    category: 'accessibility',
    name: 'Image Alt Text',
    status: hasImgWithoutAlt ? 'warn' : 'pass',
    description: hasImgWithoutAlt
      ? 'Some images may be missing alt text'
      : 'Image alt text looks good',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: false,
  });
  
  // Check for semantic HTML
  const usesSemanticHtml = files.some(f => 
    f.content.includes('<nav') || 
    f.content.includes('<main') || 
    f.content.includes('<header')
  );
  
  checks.push({
    id: 'a11y-002',
    category: 'accessibility',
    name: 'Semantic HTML',
    status: usesSemanticHtml ? 'pass' : 'warn',
    description: usesSemanticHtml
      ? 'Semantic HTML elements detected'
      : 'Consider using semantic HTML elements',
    impact: 'low',
    fixable: true,
    autoFixAvailable: false,
  });
  
  return checks;
}

// Best practices checks
async function checkBestPractices(files: Array<{ path: string; content: string }>): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  
  // Check for README
  const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md');
  checks.push({
    id: 'bp-001',
    category: 'best-practices',
    name: 'Documentation',
    status: hasReadme ? 'pass' : 'warn',
    description: hasReadme
      ? 'README.md found'
      : 'Add README.md with project documentation',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for .gitignore
  const hasGitignore = files.some(f => f.path === '.gitignore');
  checks.push({
    id: 'bp-002',
    category: 'best-practices',
    name: 'Git Configuration',
    status: hasGitignore ? 'pass' : 'warn',
    description: hasGitignore
      ? '.gitignore file found'
      : 'Add .gitignore to exclude unnecessary files',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for TypeScript
  const usesTypeScript = files.some(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
  checks.push({
    id: 'bp-003',
    category: 'best-practices',
    name: 'Type Safety',
    status: usesTypeScript ? 'pass' : 'warn',
    description: usesTypeScript
      ? 'TypeScript detected'
      : 'Consider using TypeScript for better type safety',
    impact: 'low',
    fixable: false,
    autoFixAvailable: false,
  });
  
  return checks;
}

// Code quality checks
async function checkCodeQuality(files: Array<{ path: string; content: string }>): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];
  
  // Check for console.log statements
  const hasConsoleLogs = files.some(f => 
    f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.js') || f.path.endsWith('.jsx')
  ) && files.some(f => f.content.includes('console.log'));
  
  checks.push({
    id: 'cq-001',
    category: 'code-quality',
    name: 'Debug Statements',
    status: hasConsoleLogs ? 'warn' : 'pass',
    description: hasConsoleLogs
      ? 'Debug console.log statements found - remove before production'
      : 'No debug statements detected',
    impact: 'low',
    fixable: true,
    autoFixAvailable: true,
  });
  
  // Check for error handling
  const hasTryCatch = files.some(f => f.content.includes('try') && f.content.includes('catch'));
  checks.push({
    id: 'cq-002',
    category: 'code-quality',
    name: 'Error Handling',
    status: hasTryCatch ? 'pass' : 'warn',
    description: hasTryCatch
      ? 'Error handling detected'
      : 'Consider adding error handling with try-catch blocks',
    impact: 'medium',
    fixable: true,
    autoFixAvailable: false,
  });
  
  return checks;
}

// Generate improvement suggestions
async function suggestImprovements(files: Array<{ path: string; content: string }>): Promise<Improvement[]> {
  const improvements: Improvement[] = [];
  
  // Suggest testing
  const hasTests = files.some(f => 
    f.path.includes('.test.') || f.path.includes('.spec.') || f.path.includes('__tests__')
  );
  
  if (!hasTests) {
    improvements.push({
      id: 'imp-001',
      title: 'Add Unit Tests',
      description: 'Implement unit tests to ensure code reliability and catch bugs early',
      category: 'testing',
      priority: 'high',
      estimatedEffort: '2-4 hours',
      benefits: [
        'Catch bugs before deployment',
        'Easier refactoring',
        'Better code documentation',
        'Improved code quality',
      ],
      implementation: 'Install Jest and React Testing Library, create test files alongside components',
    });
  }
  
  // Suggest CI/CD
  const hasCI = files.some(f => 
    f.path.includes('.github/workflows') || f.path.includes('.gitlab-ci') || f.path.includes('.circleci')
  );
  
  if (!hasCI) {
    improvements.push({
      id: 'imp-002',
      title: 'Set Up CI/CD Pipeline',
      description: 'Automate testing, building, and deployment with continuous integration',
      category: 'deployment',
      priority: 'medium',
      estimatedEffort: '1-2 hours',
      benefits: [
        'Automated testing on every commit',
        'Consistent build process',
        'Faster deployment',
        'Reduced human error',
      ],
      implementation: 'Create GitHub Actions workflow for automated testing and deployment',
    });
  }
  
  // Suggest performance monitoring
  improvements.push({
    id: 'imp-003',
    title: 'Add Performance Monitoring',
    description: 'Track application performance and user experience metrics',
    category: 'monitoring',
    priority: 'medium',
    estimatedEffort: '1-2 hours',
    benefits: [
      'Identify performance bottlenecks',
      'Track real user metrics',
      'Improve user experience',
      'Data-driven optimization',
    ],
    implementation: 'Integrate Vercel Analytics or Google Analytics for performance tracking',
  });
  
  return improvements;
}

// Detect potential warnings
async function detectWarnings(files: Array<{ path: string; content: string }>): Promise<Warning[]> {
  const warnings: Warning[] = [];
  
  // Check for deprecated patterns
  const deprecatedPatterns = [
    { pattern: /componentWillMount/g, message: 'componentWillMount is deprecated, use useEffect instead' },
    { pattern: /componentWillReceiveProps/g, message: 'componentWillReceiveProps is deprecated' },
    { pattern: /UNSAFE_/g, message: 'UNSAFE_ lifecycle methods should be avoided' },
  ];
  
  for (const file of files) {
    for (const { pattern, message } of deprecatedPatterns) {
      if (pattern.test(file.content)) {
        warnings.push({
          id: `warn-${Date.now()}`,
          type: 'deprecated',
          message,
          file: file.path,
          recommendation: 'Update to modern React patterns',
        });
      }
    }
  }
  
  return warnings;
}

// Generate contextual suggestions
async function generateSuggestions(
  files: Array<{ path: string; content: string }>,
  checks: AuditCheck[]
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  
  // Analyze project type
  const isNextJs = files.some(f => f.path.includes('next.config'));
  const hasAPI = files.some(f => f.path.includes('/api/'));
  
  if (isNextJs && !hasAPI) {
    suggestions.push({
      id: 'sug-001',
      category: 'feature',
      title: 'Add API Routes',
      description: 'Take advantage of Next.js API routes for backend functionality',
      impact: 'Simplify architecture by keeping frontend and backend together',
      difficulty: 'easy',
    });
  }
  
  // Suggest authentication if not present
  const hasAuth = files.some(f => 
    f.content.includes('auth') || 
    f.content.includes('login') || 
    f.content.includes('session')
  );
  
  if (!hasAuth) {
    suggestions.push({
      id: 'sug-002',
      category: 'feature',
      title: 'Add User Authentication',
      description: 'Implement user authentication for secure access control',
      impact: 'Enable user-specific features and data protection',
      difficulty: 'medium',
    });
  }
  
  return suggestions;
}

// Calculate overall score
function calculateScore(checks: AuditCheck[]): number {
  if (checks.length === 0) return 100;
  
  const weights = {
    pass: 100,
    warn: 70,
    fail: 0,
  };
  
  const totalWeight = checks.reduce((sum, check) => {
    return sum + weights[check.status];
  }, 0);
  
  return Math.round(totalWeight / checks.length);
}

// Analyze project structure and type
export async function analyzeProject(projectId: string): Promise<ProjectAnalysis> {
  const { listFiles } = await import('./fileSystem');
  const files = await listFiles(projectId);
  
  // Detect project type
  let projectType: ProjectAnalysis['projectType'] = 'static';
  let framework = 'Unknown';
  
  const hasNextConfig = files.some(f => f.path.includes('next.config'));
  const hasReact = files.some(f => 
    f.content.includes('react') || f.content.includes('React')
  );
  
  if (hasNextConfig) {
    projectType = 'nextjs';
    framework = 'Next.js';
  } else if (hasReact) {
    projectType = 'react';
    framework = 'React';
  }
  
  // Analyze dependencies
  const packageJson = files.find(f => f.path === 'package.json');
  const dependencies: DependencyInfo[] = [];
  
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      Object.entries(deps).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
          type: pkg.dependencies?.[name] ? 'production' : 'development',
          outdated: false,
          vulnerabilities: 0,
        });
      });
    } catch (e) {
      // Invalid JSON
    }
  }
  
  // Calculate metrics
  const fileCount = files.length;
  const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
  
  const complexity: ProjectAnalysis['complexity'] = 
    fileCount > 50 ? 'complex' : fileCount > 20 ? 'medium' : 'simple';
  
  const hasTests = files.some(f => 
    f.path.includes('.test.') || f.path.includes('.spec.')
  );
  
  const hasDocumentation = files.some(f => 
    f.path.toLowerCase().includes('readme')
  );
  
  const hasCI = files.some(f => 
    f.path.includes('.github/workflows') || 
    f.path.includes('.gitlab-ci')
  );
  
  return {
    projectType,
    framework,
    dependencies,
    fileCount,
    totalSize,
    complexity,
    hasTests,
    hasDocumentation,
    hasCI,
  };
}
