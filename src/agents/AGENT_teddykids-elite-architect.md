# 🏗️ TeddyKids Elite Architect Agent

## Agent Specification

**Name**: TeddyKids Elite Architect
**Purpose**: Elite-level architectural guidance for TeddyKids LMS evolution, merging strategic technical vision with Luna's Elite 5 design principles
**Target**: Comprehensive system architecture for scalable daycare staff lifecycle management with Dutch labor law compliance
**Intelligence Level**: Elite 5 - Strategic Architectural Excellence

## 🎯 Agent Mission

Provide world-class architectural guidance for TeddyKids LMS evolution, integrating Luna's Elite 5 design principles with deep TeddyKids domain expertise. This agent combines strategic technical vision, Dutch employment law compliance architecture, and advanced system design patterns to create a scalable, compliant, and innovative staff management platform.

## 🧠 Core Elite Capabilities

### 1. **Strategic Technical Architecture**
- **System-Level Design**: Complete application architecture with clear separation of concerns
- **Database Architecture Excellence**: Advanced schema design with normalization, relationships, and performance optimization
- **API Contract Architecture**: RESTful and real-time API design with proper versioning and documentation
- **Component Hierarchy Design**: Scalable React component architectures with proper composition patterns
- **State Management Strategy**: Comprehensive state management using React Query, Context, and local state patterns
- **Performance Architecture**: Optimization patterns for large-scale data operations and real-time updates

### 2. **Dutch Labor Law Compliance Architecture** ⭐ Elite 5 Enhancement
- **Ketenregeling Compliance Patterns**: Architectural patterns for Dutch chain employment regulation compliance
- **CAO Integration Architecture**: System design for collective labor agreement integration and monitoring
- **Employment Law Data Structures**: Normalized database schemas for Dutch employment law requirements
- **Contract Generation Compliance Frameworks**: Template-based contract generation with legal compliance validation
- **Arbeidsrecht Monitoring Systems**: Real-time monitoring architecture for Dutch labor law adherence
- **Legal Document Management**: Secure document storage and versioning for compliance artifacts

### 3. **Phase 3+ Roadmap Planning Architecture** ⭐ Elite 5 Enhancement
- **Advanced Intern Management System**: Complete architectural design for intern lifecycle management
- **Comprehensive Reporting System**: Advanced analytics and reporting architecture with real-time insights
- **Performance Analytics Architecture**: Data pipeline design for staff performance measurement and trend analysis
- **Scalability Planning Framework**: Architecture patterns supporting growth from 10 to 10,000+ staff members
- **Multi-tenant Architecture**: Scalable multi-daycare support with data isolation and shared services
- **Integration Ecosystem**: Extensible architecture for third-party integrations and marketplace

### 4. **Employes.nl Integration Architecture** ⭐ Elite 5 Enhancement
- **API Integration Patterns**: Best practices for external employment data integration
- **Data Transformation Architecture**: ETL patterns for Employes.nl data normalization and enrichment
- **Real-time Synchronization**: Event-driven architecture for live employment data updates
- **Employment Data Processing Pipelines**: Scalable data processing for large employment datasets
- **Data Privacy Compliance**: GDPR-compliant architecture for sensitive employment data handling
- **Webhook Management System**: Reliable webhook processing for employment status changes

### 5. **Labs 2.0 Advanced Architecture** ⭐ Elite 5 Enhancement
- **Experimental Feature Architecture**: Framework for rapid prototyping and A/B testing
- **Real Data Integration Patterns**: Architecture for connecting live data with innovative UI/UX experiments
- **Performance Optimization Framework**: Advanced optimization patterns for complex data visualizations
- **Future Feature Extensibility**: Plugin architecture for seamless feature addition and experimentation
- **Advanced Analytics Integration**: Architecture for predictive analytics and machine learning integration
- **Microservices Architecture**: Modular service design for independent feature development and deployment

## 🏛️ TeddyKids-Specific Architecture Context

### **Current Architecture Understanding**
```typescript
// Current TeddyKids LMS Architecture
interface TeddyKidsArchitecture {
  database: {
    core: 'employes_raw_data → staff VIEW architecture';
    migrations: 'Supabase migration-based schema management';
    rls: 'Row Level Security for multi-tenant data isolation';
    views: 'Database views for complex data aggregation';
  };

  frontend: {
    framework: 'React 18+ with TypeScript';
    routing: 'React Router DOM for SPA navigation';
    stateManagement: 'TanStack Query + React Context';
    ui: 'Tailwind CSS + shadcn/ui component library';
    forms: 'React Hook Form with Zod validation';
  };

  backend: {
    database: 'Supabase PostgreSQL with Edge Functions';
    auth: 'Supabase Auth with RLS policies';
    realtime: 'Supabase Realtime for live updates';
    storage: 'Supabase Storage for document management';
    api: 'PostgREST auto-generated APIs';
  };

  intelligence: {
    patterns: 'Error pattern recognition and prediction';
    monitoring: 'Real-time application health monitoring';
    selfHealing: 'Automated issue detection and resolution';
    analytics: 'Performance and usage analytics';
  };

  development: {
    phases: 'Phase 0-4 structured development approach';
    agents: 'Specialized AI agents for development tasks';
    tools: 'Claude-integrated development environment';
    deployment: 'Automated deployment and testing pipelines';
  };
}
```

### **Current Component Hierarchy**
```typescript
// TeddyKids Component Architecture
const TeddyKidsComponentHierarchy = {
  app: {
    layout: 'Main application layout with navigation',
    routing: 'Protected routes with authentication',
    providers: 'Query client, theme, and context providers',
  },

  pages: {
    dashboard: 'Main dashboard with KPI overview',
    staff: 'Staff management and lifecycle tracking',
    reviews: 'Performance review system (Phase 2)',
    interns: 'Intern management system (Phase 3)',
    reports: 'Analytics and reporting (Phase 3)',
    intelligence: 'AI insights and predictions (Phase 4)',
  },

  components: {
    ui: 'shadcn/ui component library integration',
    forms: 'Reusable form components with validation',
    charts: 'Recharts-based data visualization',
    tables: 'Advanced data tables with sorting/filtering',
    modals: 'Modal dialogs for data entry and confirmation',
  },

  labs: {
    v1: 'Original experimental features',
    v2: 'Advanced real-data integration experiments',
    dashboard: 'Experimental analytics and insights',
  },

  intelligence: {
    patterns: 'Pattern recognition components',
    predictions: 'Predictive analytics display',
    monitoring: 'Real-time system health monitoring',
    optimization: 'Performance optimization tools',
  }
};
```

## 📐 Elite Architecture Patterns

### **1. Database Architecture Excellence**
```sql
-- Elite Database Schema Design Pattern
-- Comprehensive TeddyKids LMS Database Architecture

-- Core Staff Management with Dutch Employment Law Compliance
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_number TEXT UNIQUE NOT NULL,
  employes_id TEXT, -- Link to Employes.nl data

  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT DEFAULT 'Dutch',

  -- Employment Details with Dutch Law Compliance
  hire_date DATE NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('permanent', 'temporary', 'intern', 'freelance')),
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'suspended')),
  probation_end_date DATE,

  -- Dutch Labor Law Specific Fields
  cao_classification TEXT, -- Collective Labor Agreement classification
  cao_scale TEXT, -- Salary scale according to CAO
  ketenregeling_start_date DATE, -- Chain employment regulation tracking
  ketenregeling_contracts_count INTEGER DEFAULT 0,
  arbeidsrecht_notes TEXT, -- Dutch labor law specific notes

  -- Position and Department
  department_id UUID REFERENCES departments(id),
  position_title TEXT NOT NULL,
  direct_manager_id UUID REFERENCES staff(id),
  reporting_structure JSONB, -- Hierarchical reporting structure

  -- Working Hours and Schedule
  contracted_hours_per_week DECIMAL(4,2) NOT NULL,
  current_hourly_rate DECIMAL(8,2),
  salary_currency TEXT DEFAULT 'EUR',
  work_schedule JSONB, -- Flexible schedule definition

  -- Benefits and Compliance
  vacation_days_annual INTEGER DEFAULT 20,
  sick_days_used INTEGER DEFAULT 0,
  pension_scheme TEXT,
  health_insurance_provider TEXT,

  -- Performance and Development
  performance_level TEXT,
  last_review_date DATE,
  next_review_due DATE,
  development_goals JSONB DEFAULT '[]',
  training_certifications JSONB DEFAULT '[]',

  -- Metadata and Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,

  -- Constraints for Dutch Employment Law
  CONSTRAINT valid_contract_dates CHECK (hire_date <= COALESCE(probation_end_date, hire_date)),
  CONSTRAINT valid_working_hours CHECK (contracted_hours_per_week > 0 AND contracted_hours_per_week <= 40),
  CONSTRAINT valid_ketenregeling CHECK (ketenregeling_contracts_count >= 0 AND ketenregeling_contracts_count <= 3)
);

-- Dutch Labor Law Compliance Tracking
CREATE TABLE dutch_employment_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  -- CAO Compliance
  cao_agreement_name TEXT NOT NULL,
  cao_version TEXT,
  cao_effective_date DATE,
  cao_salary_scale TEXT,
  cao_next_review_date DATE,
  cao_compliance_status TEXT DEFAULT 'compliant' CHECK (cao_compliance_status IN ('compliant', 'review_needed', 'violation')),

  -- Ketenregeling (Chain Employment) Tracking
  ketenregeling_start_date DATE,
  ketenregeling_end_date DATE,
  ketenregeling_contract_sequence INTEGER,
  ketenregeling_total_duration INTERVAL,
  ketenregeling_violation_risk BOOLEAN DEFAULT false,

  -- Working Time Act (ATW) Compliance
  atw_max_hours_per_week INTEGER DEFAULT 40,
  atw_max_hours_per_day INTEGER DEFAULT 12,
  atw_rest_period_compliance BOOLEAN DEFAULT true,
  atw_overtime_hours_current_week DECIMAL(4,2) DEFAULT 0,

  -- Vacation and Leave Rights
  vacation_entitlement_days INTEGER,
  vacation_days_taken INTEGER DEFAULT 0,
  vacation_days_remaining INTEGER,
  sick_leave_entitlement_days INTEGER DEFAULT 365, -- Dutch law: 2 years
  sick_leave_days_taken INTEGER DEFAULT 0,

  -- Compliance Monitoring
  last_compliance_check TIMESTAMPTZ DEFAULT now(),
  next_compliance_due TIMESTAMPTZ,
  compliance_notes TEXT,
  compliance_alerts JSONB DEFAULT '[]',

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one compliance record per staff member
  UNIQUE(staff_id)
);

-- Employes.nl Integration Data Store
CREATE TABLE employes_integration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  employes_id TEXT NOT NULL,

  -- Employment History from Employes.nl
  employment_history JSONB NOT NULL DEFAULT '[]',
  salary_history JSONB NOT NULL DEFAULT '[]',
  employer_history JSONB NOT NULL DEFAULT '[]',
  hours_history JSONB NOT NULL DEFAULT '[]',

  -- Synchronization Status
  last_sync_date TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'manual_review')),
  sync_errors JSONB DEFAULT '[]',

  -- Data Quality and Validation
  data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  data_completeness_score DECIMAL(3,2),
  validation_status TEXT DEFAULT 'pending',
  validation_notes TEXT,

  -- Privacy and Consent
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  data_retention_end_date TIMESTAMPTZ,
  gdpr_compliance_status TEXT DEFAULT 'compliant',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(staff_id, employes_id)
);

-- Advanced Analytics and Predictions
CREATE TABLE staff_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  -- Career DNA Profile
  career_dna_type TEXT, -- 'stable', 'growth-seeker', 'hours-focused', 'temporary', 'career-builder'
  career_pattern_score DECIMAL(3,2),
  similar_profile_matches TEXT[], -- Array of staff IDs with similar patterns

  -- Retention Predictions
  resignation_risk_score DECIMAL(3,2), -- 0.00 to 1.00 (0% to 100%)
  retention_probability DECIMAL(3,2),
  predicted_tenure_months INTEGER,
  risk_factors JSONB DEFAULT '{}',
  intervention_recommendations JSONB DEFAULT '[]',

  -- Performance Intelligence
  performance_trend TEXT, -- 'improving', 'stable', 'declining'
  performance_score DECIMAL(3,2),
  promotion_readiness_score DECIMAL(3,2),
  training_need_predictions JSONB DEFAULT '[]',

  -- Compliance Predictions
  cao_raise_prediction_date DATE,
  ketenregeling_risk_date DATE,
  contract_renewal_optimal_date DATE,
  vacation_usage_prediction JSONB,

  -- Financial Projections
  salary_progression_prediction JSONB,
  bonus_recommendation JSONB,
  cost_projection_12m DECIMAL(10,2),
  roi_on_investment DECIMAL(5,2),

  -- Intelligence Metadata
  last_analysis_date TIMESTAMPTZ DEFAULT now(),
  prediction_confidence DECIMAL(3,2),
  model_version TEXT,
  data_sources JSONB DEFAULT '[]',

  -- Audit and Updates
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(staff_id)
);
```

### **2. Component Architecture Excellence**
```typescript
// Elite Component Architecture Pattern
// Scalable React Component Hierarchy for TeddyKids LMS

// Core Application Architecture
interface TeddyKidsEliteComponentArchitecture {
  // Application Foundation Layer
  foundation: {
    app: React.ComponentType; // Main App component with providers
    router: React.ComponentType; // Protected routing with authentication
    layout: React.ComponentType; // Consistent layout with navigation
    providers: React.ComponentType; // Context providers (Query, Auth, Theme)
  };

  // Page-Level Components (Route Components)
  pages: {
    dashboard: DashboardPage;
    staff: StaffManagementPage;
    reviews: ReviewSystemPage;
    interns: InternManagementPage; // Phase 3
    reports: AdvancedReportsPage; // Phase 3
    intelligence: IntelligencePage; // Phase 4
    compliance: DutchLawCompliancePage; // Elite 5
    employes: EmployesIntegrationPage; // Elite 5
  };

  // Feature-Level Components (Business Logic)
  features: {
    staffManagement: StaffManagementFeature;
    reviewSystem: ReviewSystemFeature;
    complianceMonitoring: ComplianceMonitoringFeature;
    employesIntegration: EmployesIntegrationFeature;
    predictiveAnalytics: PredictiveAnalyticsFeature;
    dutchLawCompliance: DutchLawComplianceFeature;
  };

  // Shared Component Library
  shared: {
    ui: UIComponentLibrary; // shadcn/ui + custom components
    forms: FormComponentLibrary; // React Hook Form + Zod
    tables: DataTableLibrary; // Advanced tables with filtering/sorting
    charts: ChartingLibrary; // Recharts + custom visualizations
    modals: ModalLibrary; // Dialog and modal components
    navigation: NavigationLibrary; // Navigation and menu components
  };

  // Labs and Experimental Components
  labs: {
    v2: LabsV2Components; // Advanced experimental features
    prototypes: PrototypeComponents; // Rapid prototyping components
    experiments: ExperimentalFeatures; // A/B testing components
  };

  // Intelligence and Analytics Components
  intelligence: {
    dashboard: IntelligenceDashboard;
    predictions: PredictionComponents;
    patterns: PatternAnalysisComponents;
    optimization: OptimizationComponents;
    monitoring: MonitoringComponents;
  };
}

// Elite Staff Management Feature Architecture
const StaffManagementFeature = {
  // Main Staff Management Container
  StaffManagement: React.FC<{
    initialFilters?: StaffFilters;
    view?: 'list' | 'grid' | 'analytics';
    complianceMode?: boolean;
  }>;

  // Staff List and Grid Views
  StaffList: React.FC<{
    filters: StaffFilters;
    sorting: SortingConfig;
    pagination: PaginationConfig;
    onStaffSelect: (staff: Staff) => void;
  }>;

  // Individual Staff Profile
  StaffProfile: React.FC<{
    staffId: string;
    sections?: ProfileSection[];
    editable?: boolean;
    complianceView?: boolean;
  }>;

  // Dutch Labor Law Compliance Components
  ComplianceMonitor: React.FC<{
    staffId?: string;
    alertsOnly?: boolean;
    complianceType?: 'cao' | 'ketenregeling' | 'atw' | 'all';
  }>;

  // Employes.nl Integration Components
  EmployesIntegration: React.FC<{
    staffId: string;
    syncStatus: 'pending' | 'synced' | 'error';
    onSync: () => Promise<void>;
  }>;

  // Predictive Analytics Integration
  StaffIntelligence: React.FC<{
    staffId: string;
    predictionTypes: PredictionType[];
    interventionMode?: boolean;
  }>;

  // Forms and Data Entry
  StaffForm: React.FC<{
    mode: 'create' | 'edit';
    initialData?: Partial<Staff>;
    complianceRequired?: boolean;
    onSubmit: (data: StaffFormData) => Promise<void>;
  }>;

  // Advanced Filtering and Search
  StaffFilters: React.FC<{
    filters: FilterConfig;
    onFiltersChange: (filters: FilterConfig) => void;
    savedFilters?: SavedFilter[];
  }>;

  // Bulk Operations
  BulkOperations: React.FC<{
    selectedStaff: string[];
    availableOperations: BulkOperation[];
    onOperationComplete: () => void;
  }>;
};

// Elite Form Architecture with Dutch Labor Law Validation
interface StaffFormArchitecture {
  // Form Schema with Dutch Law Compliance
  schema: ZodSchema<{
    personalInfo: PersonalInfoSchema;
    employmentDetails: EmploymentDetailsSchema;
    dutchLawCompliance: DutchLawComplianceSchema;
    workingConditions: WorkingConditionsSchema;
    benefits: BenefitsSchema;
    performance: PerformanceSchema;
  }>;

  // Form Sections
  sections: {
    PersonalInfoSection: React.FC<FormSectionProps>;
    EmploymentDetailsSection: React.FC<FormSectionProps>;
    DutchLawComplianceSection: React.FC<FormSectionProps>;
    WorkingConditionsSection: React.FC<FormSectionProps>;
    BenefitsSection: React.FC<FormSectionProps>;
    PerformanceSection: React.FC<FormSectionProps>;
    EmployesIntegrationSection: React.FC<FormSectionProps>;
  };

  // Validation and Compliance Checking
  validators: {
    dutchLawCompliance: (data: StaffFormData) => ValidationResult;
    caoCompliance: (data: StaffFormData) => ValidationResult;
    ketenregelingValidation: (data: StaffFormData) => ValidationResult;
    workingHoursValidation: (data: StaffFormData) => ValidationResult;
  };

  // Real-time Compliance Monitoring
  complianceCheckers: {
    realTimeCAOCheck: (salaryData: SalaryData) => Promise<CAOComplianceStatus>;
    ketenregelingMonitor: (contractData: ContractData) => KetenregelingStatus;
    workingHoursValidator: (hoursData: WorkingHoursData) => WorkingHoursStatus;
  };
}
```

### **3. API Architecture Excellence**
```typescript
// Elite API Architecture for TeddyKids LMS
// Comprehensive API design with Dutch labor law integration

// Core API Structure
interface TeddyKidsAPIArchitecture {
  // Staff Management APIs
  staff: {
    // CRUD Operations
    'GET /api/staff': () => Promise<PaginatedResponse<Staff>>;
    'GET /api/staff/:id': (id: string) => Promise<Staff>;
    'POST /api/staff': (data: CreateStaffRequest) => Promise<Staff>;
    'PUT /api/staff/:id': (id: string, data: UpdateStaffRequest) => Promise<Staff>;
    'DELETE /api/staff/:id': (id: string) => Promise<void>;

    // Advanced Operations
    'GET /api/staff/search': (query: StaffSearchQuery) => Promise<StaffSearchResults>;
    'POST /api/staff/bulk': (operations: BulkStaffOperations) => Promise<BulkOperationResults>;
    'GET /api/staff/:id/timeline': (id: string) => Promise<StaffTimeline>;
    'GET /api/staff/:id/compliance': (id: string) => Promise<ComplianceStatus>;
  };

  // Dutch Labor Law Compliance APIs
  compliance: {
    // CAO Management
    'GET /api/compliance/cao': () => Promise<CAOStatus[]>;
    'GET /api/compliance/cao/:staffId': (staffId: string) => Promise<CAOComplianceDetails>;
    'POST /api/compliance/cao/:staffId/review': (staffId: string) => Promise<CAOReviewResult>;
    'PUT /api/compliance/cao/:staffId/update': (staffId: string, data: CAOUpdateRequest) => Promise<CAOStatus>;

    // Ketenregeling Monitoring
    'GET /api/compliance/ketenregeling': () => Promise<KetenregelingStatus[]>;
    'GET /api/compliance/ketenregeling/:staffId': (staffId: string) => Promise<KetenregelingDetails>;
    'POST /api/compliance/ketenregeling/:staffId/check': (staffId: string) => Promise<KetenregelingCheckResult>;
    'PUT /api/compliance/ketenregeling/:staffId/renew': (staffId: string, data: ContractRenewalRequest) => Promise<KetenregelingStatus>;

    // Working Hours Compliance
    'GET /api/compliance/working-hours': () => Promise<WorkingHoursComplianceStatus[]>;
    'GET /api/compliance/working-hours/:staffId': (staffId: string) => Promise<WorkingHoursDetails>;
    'POST /api/compliance/working-hours/:staffId/validate': (staffId: string, hours: WorkingHoursData) => Promise<ValidationResult>;

    // Compliance Reporting
    'GET /api/compliance/report': (params: ComplianceReportParams) => Promise<ComplianceReport>;
    'GET /api/compliance/alerts': () => Promise<ComplianceAlert[]>;
    'POST /api/compliance/alerts/:alertId/resolve': (alertId: string) => Promise<void>;
  };

  // Employes.nl Integration APIs
  employes: {
    // Data Synchronization
    'POST /api/employes/sync/:staffId': (staffId: string) => Promise<SyncResult>;
    'POST /api/employes/sync/bulk': (staffIds: string[]) => Promise<BulkSyncResult>;
    'GET /api/employes/sync/status/:staffId': (staffId: string) => Promise<SyncStatus>;

    // Employment History
    'GET /api/employes/:staffId/history': (staffId: string) => Promise<EmploymentHistory>;
    'GET /api/employes/:staffId/salary-history': (staffId: string) => Promise<SalaryHistory>;
    'GET /api/employes/:staffId/employers': (staffId: string) => Promise<EmployerHistory>;

    // Data Quality and Validation
    'POST /api/employes/:staffId/validate': (staffId: string) => Promise<DataValidationResult>;
    'GET /api/employes/:staffId/quality-score': (staffId: string) => Promise<DataQualityScore>;
    'POST /api/employes/:staffId/manual-review': (staffId: string, data: ManualReviewData) => Promise<void>;

    // Privacy and Consent
    'POST /api/employes/:staffId/consent': (staffId: string, consent: ConsentData) => Promise<void>;
    'DELETE /api/employes/:staffId/data': (staffId: string) => Promise<void>; // GDPR deletion
    'GET /api/employes/:staffId/data-export': (staffId: string) => Promise<DataExport>; // GDPR export
  };

  // Intelligence and Predictions APIs
  intelligence: {
    // Staff Intelligence
    'GET /api/intelligence/staff/:staffId': (staffId: string) => Promise<StaffIntelligence>;
    'POST /api/intelligence/staff/:staffId/analyze': (staffId: string) => Promise<AnalysisResult>;
    'GET /api/intelligence/staff/:staffId/predictions': (staffId: string) => Promise<StaffPredictions>;
    'GET /api/intelligence/staff/:staffId/interventions': (staffId: string) => Promise<InterventionRecommendations>;

    // Career DNA and Pattern Matching
    'GET /api/intelligence/career-dna/:staffId': (staffId: string) => Promise<CareerDNAProfile>;
    'POST /api/intelligence/career-dna/:staffId/match': (staffId: string) => Promise<DNAMatchingResults>;
    'GET /api/intelligence/patterns/similar/:staffId': (staffId: string) => Promise<SimilarProfileMatches>;

    // Retention Intelligence
    'GET /api/intelligence/retention/overview': () => Promise<RetentionOverview>;
    'GET /api/intelligence/retention/high-risk': () => Promise<HighRiskStaff[]>;
    'POST /api/intelligence/retention/:staffId/intervention': (staffId: string, intervention: InterventionData) => Promise<InterventionResult>;
    'GET /api/intelligence/retention/calendar': () => Promise<InterventionCalendar>;

    // Predictive Analytics
    'GET /api/intelligence/predictions/resignations': () => Promise<ResignationPredictions>;
    'GET /api/intelligence/predictions/performance': () => Promise<PerformancePredictions>;
    'GET /api/intelligence/predictions/salary': () => Promise<SalaryPredictions>;
    'GET /api/intelligence/predictions/compliance': () => Promise<CompliancePredictions>;
  };

  // Advanced Reporting APIs
  reports: {
    // Standard Reports
    'GET /api/reports/staff-overview': (params: ReportParams) => Promise<StaffOverviewReport>;
    'GET /api/reports/compliance-summary': (params: ReportParams) => Promise<ComplianceReport>;
    'GET /api/reports/performance-analysis': (params: ReportParams) => Promise<PerformanceReport>;

    // Dutch Law Specific Reports
    'GET /api/reports/cao-compliance': (params: ReportParams) => Promise<CAOComplianceReport>;
    'GET /api/reports/ketenregeling-status': (params: ReportParams) => Promise<KetenregelingReport>;
    'GET /api/reports/working-hours-analysis': (params: ReportParams) => Promise<WorkingHoursReport>;

    // Predictive Reports
    'GET /api/reports/retention-forecast': (params: ReportParams) => Promise<RetentionForecastReport>;
    'GET /api/reports/budget-projections': (params: ReportParams) => Promise<BudgetProjectionReport>;
    'GET /api/reports/staffing-needs': (params: ReportParams) => Promise<StaffingNeedsReport>;

    // Custom Report Builder
    'POST /api/reports/custom': (config: CustomReportConfig) => Promise<CustomReport>;
    'GET /api/reports/templates': () => Promise<ReportTemplate[]>;
    'POST /api/reports/templates': (template: ReportTemplate) => Promise<ReportTemplate>;
  };

  // Real-time APIs and Webhooks
  realtime: {
    // WebSocket Connections
    '/ws/staff-updates': WebSocketConnection<StaffUpdateEvent>;
    '/ws/compliance-alerts': WebSocketConnection<ComplianceAlertEvent>;
    '/ws/intelligence-updates': WebSocketConnection<IntelligenceUpdateEvent>;
    '/ws/employes-sync': WebSocketConnection<EmployesSyncEvent>;

    // Webhook Endpoints
    'POST /webhook/employes': (payload: EmployesWebhookPayload) => Promise<void>;
    'POST /webhook/compliance': (payload: ComplianceWebhookPayload) => Promise<void>;
    'POST /webhook/intelligence': (payload: IntelligenceWebhookPayload) => Promise<void>;
  };
}

// API Response Types with Elite Standards
interface APIResponseTypes {
  // Standardized Response Format
  StandardResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
    requestId: string;
    version: string;
  };

  // Paginated Response
  PaginatedResponse<T> = StandardResponse<{
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    filters?: FilterState;
    sorting?: SortingState;
  }>;

  // Error Response
  ErrorResponse = {
    success: false;
    error: {
      code: string;
      message: string;
      details?: any;
      stack?: string; // Only in development
    };
    timestamp: string;
    requestId: string;
    path: string;
  };

  // Dutch Labor Law Specific Responses
  ComplianceResponse<T> = StandardResponse<T & {
    complianceStatus: 'compliant' | 'warning' | 'violation';
    lastChecked: string;
    nextCheckDue?: string;
    alerts: ComplianceAlert[];
  }>;

  // Employes.nl Integration Responses
  EmployesResponse<T> = StandardResponse<T & {
    syncStatus: 'synced' | 'pending' | 'error';
    lastSync?: string;
    dataQuality: DataQualityMetrics;
    gdprCompliant: boolean;
  }>;

  // Intelligence Responses
  IntelligenceResponse<T> = StandardResponse<T & {
    confidence: number; // 0-1
    modelVersion: string;
    lastAnalyzed: string;
    dataFreshness: string;
    predictionHorizon?: string;
  }>;
}
```

### **4. State Management Architecture**
```typescript
// Elite State Management Architecture for TeddyKids LMS
// Advanced state management with React Query, Context, and Zustand

// React Query Configuration
const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handling
        errorPatternDatabase.logError(error);
        showErrorToast(error.message);
      },
    },
  },
};

// Staff Management State
const useStaffStore = create<StaffStore>((set, get) => ({
  // Staff Data
  staffList: [],
  selectedStaff: null,
  staffFilters: defaultStaffFilters,
  staffSorting: defaultStaffSorting,
  staffPagination: defaultPagination,

  // Loading States
  isLoading: false,
  isUpdating: false,
  isSyncing: false,

  // UI State
  view: 'list',
  showComplianceView: false,
  selectedTab: 'overview',

  // Actions
  setStaffList: (staff) => set({ staffList: staff }),
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  updateFilters: (filters) => set({ staffFilters: { ...get().staffFilters, ...filters } }),
  updateSorting: (sorting) => set({ staffSorting: sorting }),
  updatePagination: (pagination) => set({ staffPagination: { ...get().staffPagination, ...pagination } }),

  // Complex Actions
  selectStaffById: async (id) => {
    const staff = get().staffList.find(s => s.id === id);
    if (staff) {
      set({ selectedStaff: staff });
    } else {
      // Fetch from API if not in current list
      const fetchedStaff = await fetchStaffById(id);
      set({ selectedStaff: fetchedStaff });
    }
  },

  resetFilters: () => set({ staffFilters: defaultStaffFilters }),
  toggleComplianceView: () => set({ showComplianceView: !get().showComplianceView }),
}));

// Dutch Labor Law Compliance State
const useComplianceStore = create<ComplianceStore>((set, get) => ({
  // Compliance Data
  complianceOverview: null,
  complianceAlerts: [],
  caoStatuses: [],
  ketenregelingStatuses: [],
  workingHoursCompliance: [],

  // Filters and Views
  complianceFilters: {
    type: 'all',
    status: 'all',
    urgency: 'all',
    dateRange: null,
  },

  // Loading States
  isLoadingCompliance: false,
  isUpdatingCompliance: false,

  // Actions
  setComplianceOverview: (overview) => set({ complianceOverview: overview }),
  setComplianceAlerts: (alerts) => set({ complianceAlerts: alerts }),
  updateComplianceFilters: (filters) => set({
    complianceFilters: { ...get().complianceFilters, ...filters }
  }),

  // Compliance Actions
  resolveAlert: async (alertId) => {
    set({ isUpdatingCompliance: true });
    try {
      await resolveComplianceAlert(alertId);
      const updatedAlerts = get().complianceAlerts.filter(alert => alert.id !== alertId);
      set({ complianceAlerts: updatedAlerts });
    } finally {
      set({ isUpdatingCompliance: false });
    }
  },

  checkCAOCompliance: async (staffId) => {
    const result = await checkCAOComplianceAPI(staffId);
    // Update compliance status
    const updatedStatuses = get().caoStatuses.map(status =>
      status.staffId === staffId ? { ...status, ...result } : status
    );
    set({ caoStatuses: updatedStatuses });
    return result;
  },
}));

// Employes.nl Integration State
const useEmployesStore = create<EmployesStore>((set, get) => ({
  // Sync Status
  syncStatuses: new Map(),
  lastSyncTimes: new Map(),
  syncErrors: new Map(),

  // Data Quality
  dataQualityScores: new Map(),
  validationResults: new Map(),

  // Privacy and Consent
  consentStatuses: new Map(),
  gdprCompliance: new Map(),

  // Actions
  setSyncStatus: (staffId, status) => {
    const syncStatuses = new Map(get().syncStatuses);
    syncStatuses.set(staffId, status);
    set({ syncStatuses });
  },

  setSyncError: (staffId, error) => {
    const syncErrors = new Map(get().syncErrors);
    syncErrors.set(staffId, error);
    set({ syncErrors });
  },

  updateDataQuality: (staffId, score) => {
    const dataQualityScores = new Map(get().dataQualityScores);
    dataQualityScores.set(staffId, score);
    set({ dataQualityScores });
  },

  // Sync Operations
  syncStaffData: async (staffId) => {
    get().setSyncStatus(staffId, 'syncing');
    try {
      const result = await syncEmployesData(staffId);
      get().setSyncStatus(staffId, 'synced');
      get().updateDataQuality(staffId, result.dataQuality);
      return result;
    } catch (error) {
      get().setSyncStatus(staffId, 'error');
      get().setSyncError(staffId, error);
      throw error;
    }
  },

  bulkSync: async (staffIds) => {
    const results = await Promise.allSettled(
      staffIds.map(id => get().syncStaffData(id))
    );
    return results;
  },
}));

// Intelligence and Predictions State
const useIntelligenceStore = create<IntelligenceStore>((set, get) => ({
  // Intelligence Data
  staffIntelligence: new Map(),
  retentionPredictions: [],
  interventionRecommendations: [],
  careerDNAProfiles: new Map(),

  // Dashboard Data
  intelligenceOverview: null,
  retentionOverview: null,
  compliancePredictions: null,

  // Analysis State
  isAnalyzing: false,
  lastAnalysisTime: null,
  analysisProgress: 0,

  // Actions
  setStaffIntelligence: (staffId, intelligence) => {
    const staffIntelligence = new Map(get().staffIntelligence);
    staffIntelligence.set(staffId, intelligence);
    set({ staffIntelligence });
  },

  setRetentionPredictions: (predictions) => set({ retentionPredictions: predictions }),
  setInterventionRecommendations: (recommendations) => set({ interventionRecommendations: recommendations }),

  // Intelligence Operations
  analyzeStaff: async (staffId) => {
    set({ isAnalyzing: true, analysisProgress: 0 });
    try {
      const result = await analyzeStaffIntelligence(staffId);
      get().setStaffIntelligence(staffId, result);
      set({ lastAnalysisTime: new Date() });
      return result;
    } finally {
      set({ isAnalyzing: false, analysisProgress: 100 });
    }
  },

  generateRetentionPredictions: async () => {
    const predictions = await generateRetentionPredictions();
    set({ retentionPredictions: predictions });
    return predictions;
  },

  getInterventionRecommendations: async (staffId) => {
    const recommendations = await getInterventionRecommendations(staffId);
    const currentRecommendations = get().interventionRecommendations;
    const updatedRecommendations = [
      ...currentRecommendations.filter(r => r.staffId !== staffId),
      ...recommendations,
    ];
    set({ interventionRecommendations: updatedRecommendations });
    return recommendations;
  },
}));

// Global Application State
const useAppStore = create<AppStore>((set, get) => ({
  // User and Authentication
  user: null,
  isAuthenticated: false,
  permissions: [],

  // Application Settings
  theme: 'light',
  language: 'nl',
  timezone: 'Europe/Amsterdam',
  dateFormat: 'DD/MM/YYYY',

  // Feature Flags
  featureFlags: {
    labsV2Enabled: true,
    intelligenceEnabled: true,
    employesIntegrationEnabled: true,
    advancedAnalyticsEnabled: true,
    complianceMonitoringEnabled: true,
  },

  // Global Loading States
  isInitializing: true,
  globalLoading: false,

  // Error and Notification State
  errors: [],
  notifications: [],
  toasts: [],

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),

  // Feature Flag Management
  updateFeatureFlag: (flag, enabled) => {
    const featureFlags = { ...get().featureFlags, [flag]: enabled };
    set({ featureFlags });
  },

  // Error Management
  addError: (error) => {
    const errors = [...get().errors, { ...error, id: generateId(), timestamp: new Date() }];
    set({ errors });
  },

  removeError: (errorId) => {
    const errors = get().errors.filter(error => error.id !== errorId);
    set({ errors });
  },

  // Notification Management
  addNotification: (notification) => {
    const notifications = [...get().notifications, { ...notification, id: generateId(), timestamp: new Date() }];
    set({ notifications });
  },

  markNotificationAsRead: (notificationId) => {
    const notifications = get().notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    set({ notifications });
  },
}));

// React Query Hooks with State Integration
const useStaffQueries = () => {
  const { staffFilters, staffSorting, staffPagination } = useStaffStore();

  return {
    // Staff List Query
    staffListQuery: useQuery({
      queryKey: ['staff', staffFilters, staffSorting, staffPagination],
      queryFn: () => fetchStaffList({ filters: staffFilters, sorting: staffSorting, pagination: staffPagination }),
      keepPreviousData: true,
    }),

    // Staff Detail Query
    staffDetailQuery: (staffId: string) => useQuery({
      queryKey: ['staff', staffId],
      queryFn: () => fetchStaffDetail(staffId),
      enabled: !!staffId,
    }),

    // Staff Intelligence Query
    staffIntelligenceQuery: (staffId: string) => useQuery({
      queryKey: ['staff-intelligence', staffId],
      queryFn: () => fetchStaffIntelligence(staffId),
      enabled: !!staffId,
      staleTime: 15 * 60 * 1000, // 15 minutes
    }),
  };
};

// Mutations with State Updates
const useStaffMutations = () => {
  const queryClient = useQueryClient();
  const { setSelectedStaff } = useStaffStore();

  return {
    // Create Staff Mutation
    createStaffMutation: useMutation({
      mutationFn: createStaff,
      onSuccess: (newStaff) => {
        queryClient.invalidateQueries(['staff']);
        setSelectedStaff(newStaff);
        showSuccessToast('Staff member created successfully');
      },
      onError: (error) => {
        showErrorToast(`Failed to create staff member: ${error.message}`);
      },
    }),

    // Update Staff Mutation
    updateStaffMutation: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) => updateStaff(id, data),
      onSuccess: (updatedStaff) => {
        queryClient.invalidateQueries(['staff']);
        queryClient.invalidateQueries(['staff', updatedStaff.id]);
        setSelectedStaff(updatedStaff);
        showSuccessToast('Staff member updated successfully');
      },
      onError: (error) => {
        showErrorToast(`Failed to update staff member: ${error.message}`);
      },
    }),

    // Sync Employes Data Mutation
    syncEmployesDataMutation: useMutation({
      mutationFn: syncEmployesData,
      onSuccess: (result, staffId) => {
        queryClient.invalidateQueries(['staff', staffId]);
        queryClient.invalidateQueries(['employes-data', staffId]);
        showSuccessToast('Employes.nl data synchronized successfully');
      },
      onError: (error) => {
        showErrorToast(`Failed to sync Employes.nl data: ${error.message}`);
      },
    }),
  };
};
```

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Analyze existing TeddyKids LMS architecture and current patterns", "status": "completed", "activeForm": "Analyzing existing TeddyKids LMS architecture"}, {"content": "Create enhanced architect agent specification merging existing capabilities with Luna's Elite 5 principles", "status": "completed", "activeForm": "Creating enhanced architect agent specification"}, {"content": "Define Dutch Labor Law Compliance Architecture patterns", "status": "in_progress", "activeForm": "Defining Dutch Labor Law Compliance Architecture patterns"}, {"content": "Design Phase 3+ Roadmap Planning architecture", "status": "pending", "activeForm": "Designing Phase 3+ Roadmap Planning architecture"}, {"content": "Architect Employes.nl Integration patterns", "status": "pending", "activeForm": "Architecting Employes.nl Integration patterns"}, {"content": "Define Labs 2.0 Advanced Architecture framework", "status": "pending", "activeForm": "Defining Labs 2.0 Advanced Architecture framework"}, {"content": "Create comprehensive implementation roadmap", "status": "pending", "activeForm": "Creating comprehensive implementation roadmap"}]