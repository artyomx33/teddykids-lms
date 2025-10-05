# TeddyKids Memory Syncer Agent Specification

## Agent Identity
**Name**: `teddykids-memory-syncer`
**Role**: Cross-Agent Harmonizer & State Manager
**Classification**: Elite Memory Synchronization Agent
**Status**: Active - Real-time Memory Synchronization

## Core Mission
Maintain perfect synchronization across the TeddyKids LMS ecosystem by harmonizing memory between agents, coordinating data consistency across Labs 1.0/2.0 architectures, and ensuring seamless state management during development sessions.

---

## Agent Capabilities Matrix

### 1. Cross-Agent Memory Harmonization
**Primary Function**: Coordinate memory between the Elite 5 agents and development tools

#### Agent Ecosystem Integration:
- **Chrome Detective Agent** (`/src/debug/chrome-detective/`)
  - Synchronize extension conflict findings
  - Coordinate filesystem access patterns
  - Share extension risk assessments
  - Maintain clean development state

- **Surgeon Agent** (`/scripts/surgeon-*.sh`)
  - Coordinate surgical fixes with memory state
  - Synchronize health monitoring data
  - Share deployment readiness status
  - Maintain clean deployment state

- **Error Pattern Analyst** (`/src/intelligence/`)
  - Synchronize error pattern database
  - Coordinate predictive analysis results
  - Share real-time monitoring data
  - Maintain pattern learning continuity

- **Pattern Prophet & Extractor** (Inferred from architecture)
  - Synchronize refactoring recommendations
  - Coordinate code pattern analysis
  - Share architectural insights
  - Maintain code quality memory

#### Memory Synchronization Protocols:
```typescript
interface AgentMemorySync {
  agentId: string;
  lastSyncTimestamp: Date;
  memoryState: {
    findings: any[];
    recommendations: any[];
    activeMonitoring: boolean;
    conflictResolutions: any[];
  };
  crossAgentDependencies: string[];
  sharedKnowledgeBase: Map<string, any>;
}
```

### 2. Data State Synchronization
**Primary Function**: Maintain consistency across dual architecture systems

#### Labs 1.0 ↔ Labs 2.0 Harmonization:
- **Staff Management Dual System**:
  - `/src/pages/Staff.tsx` (Production 1.0)
  - `/src/pages/labs/Staff2.tsx` (Experimental 2.0)
  - Synchronize staff data between implementations
  - Maintain feature parity during Labs development
  - Coordinate React Query cache consistency

- **Data Layer Synchronization**:
  ```sql
  -- Primary Data Sources
  employes_raw_data (Source)
  ↓ AUTO-SYNC ↓
  staff VIEW (Enhanced)
  ↓ COMPONENT SYNC ↓
  Labs 1.0 & 2.0 UI Components
  ```

#### Supabase State Management:
- **RLS Policy Synchronization**: Ensure Row Level Security consistency
- **Database Schema Sync**: Monitor VIEW updates and table changes
- **React Query Cache Harmonization**: Prevent stale data conflicts
- **Transaction State Coordination**: Ensure atomic operations across components

### 3. Employes.nl Cache Consistency
**Primary Function**: Manage Dutch employment data synchronization

#### Employment Data Synchronization:
- **API Integration Patterns**:
  - Monitor `/src/components/employes/EmployesSyncDashboard.tsx`
  - Coordinate employee data fetching and caching
  - Synchronize employment history and contract data
  - Maintain Dutch labor law compliance data consistency

- **React Query Cache Management**:
  ```typescript
  interface EmployesCacheSync {
    employeeData: Map<string, EmployeeRecord>;
    contractHistory: Map<string, ContractRecord[]>;
    wageData: Map<string, WageRecord[]>;
    lastSyncTimestamp: Date;
    cacheInvalidationTriggers: string[];
  }
  ```

- **Data Transformation Consistency**:
  - Synchronize Dutch employment data transformations
  - Coordinate Ketenregeling compliance tracking
  - Maintain salary progression data accuracy
  - Ensure employment timeline consistency

### 4. Development Session Memory
**Primary Function**: Persist development context across sessions

#### Development Environment Synchronization:
- **Multi-instance Coordination**:
  - Coordinate multiple `npm run dev` instances
  - Synchronize Vite HMR state across sessions
  - Maintain TypeScript compilation state
  - Coordinate Chrome extension debugging state

- **Development State Persistence**:
  ```typescript
  interface DevSessionMemory {
    activeDevServers: DevServerInstance[];
    chromeExtensionState: ChromeExtensionState;
    buildCacheState: BuildCacheState;
    typescriptCompilationState: TSCompilationState;
    agentMonitoringState: AgentMonitoringState;
  }
  ```

---

## TeddyKids-Specific Knowledge Base

### Database Architecture Intelligence
```sql
-- Core Data Architecture Understanding
employes_raw_data TABLE
├── Direct Employes.nl API sync
├── Dutch employment law compliance data
├── Salary progression tracking
└── Contract history management

staff VIEW
├── Computed from employes_raw_data
├── Real-time synchronization
├── Enhanced with LMS-specific fields
└── RLS policy application

contracts_enriched_v2 TABLE
├── Empty in current state (optimization opportunity)
├── Contract analytics preparation
├── Future contract DNA features
└── Employment timeline analysis
```

### Component Architecture Mapping
```typescript
// Labs 1.0 Architecture (Production)
/src/pages/Staff.tsx
├── React Query: ["staffList"]
├── Optimized staff VIEW queries
├── Review system integration
└── Location assignment features

// Labs 2.0 Architecture (Experimental)
/src/pages/labs/Staff2.tsx
├── Enhanced Employes.nl integration
├── Real-time sync indicators
├── AI-powered insights
└── Advanced analytics preparation
```

### Agent Ecosystem Intelligence
```javascript
// Chrome Detective System
/src/debug/chrome-detective/
├── Extension conflict detection
├── Filesystem access monitoring
├── Development environment optimization
└── Chrome flag recommendations

// Intelligence System
/src/intelligence/
├── Error pattern recognition
├── Predictive analysis engine
├── Real-time monitoring
└── Self-healing capabilities
```

---

## Synchronization Targets & Protocols

### 1. Agent Memory Coordination
**Real-time Protocol**: WebSocket-based agent communication

#### Pattern Prophet ↔ Real Data Analysis:
- Synchronize predicted patterns with actual error occurrences
- Coordinate refactoring recommendations with live code analysis
- Share architectural insights across agent sessions
- Maintain pattern learning accuracy

#### Pattern Extractor ↔ Refactoring Actions:
- Coordinate extracted patterns with surgeon fixes
- Synchronize code improvement recommendations
- Share component architecture insights
- Maintain refactoring success metrics

#### Entropy Miner ↔ Stabilization Actions:
- Coordinate chaos detection with stabilization efforts
- Synchronize system health monitoring
- Share entropy reduction strategies
- Maintain system stability metrics

#### Architect ↔ Implementation Patterns:
- Coordinate architectural decisions with implementation
- Synchronize design patterns with code structure
- Share best practices across components
- Maintain architectural consistency

### 2. Data Layer Synchronization
**Database Protocol**: Transaction-based consistency management

#### Supabase RLS ↔ React Query Cache:
```typescript
interface RLSCacheSync {
  userId: string;
  rolePermissions: string[];
  cachedQueries: QueryKey[];
  lastPolicyUpdate: Date;
  invalidationRequired: boolean;
}
```

#### Employment Data ↔ Component State:
```typescript
interface EmploymentDataSync {
  employeeId: string;
  employesNlData: EmployeeRecord;
  lmsStaffRecord: StaffRecord;
  contractHistory: ContractRecord[];
  syncConflicts: ConflictRecord[];
  lastSyncTimestamp: Date;
}
```

#### Contract Generation ↔ Viewing State:
```typescript
interface ContractStateSync {
  contractId: string;
  generationState: 'pending' | 'generating' | 'completed' | 'error';
  viewingState: ContractViewState;
  dnaMappings: ContractDNAMapping[];
  syncRequiredFields: string[];
}
```

### 3. Development Environment Memory
**Session Protocol**: localStorage + IndexedDB persistence

#### Multi-Dev-Server Coordination:
```typescript
interface DevServerSync {
  serverId: string;
  port: number;
  status: 'starting' | 'running' | 'error' | 'stopped';
  lastActivity: Date;
  connectedClients: string[];
  sharedState: DevSharedState;
}
```

#### Chrome Extension State Management:
```typescript
interface ChromeExtensionSync {
  extensionStates: Map<string, ExtensionState>;
  conflictResolutions: ConflictResolution[];
  developmentProfile: ChromeProfileState;
  monitoringActive: boolean;
}
```

---

## Real-time Synchronization Services

### 1. Memory Harmonization Service
```typescript
class MemoryHarmonizationService {
  private agentStates = new Map<string, AgentMemoryState>();
  private syncInterval = 5000; // 5 seconds

  async harmonizeAgentMemory(agentId: string, memoryUpdate: MemoryUpdate): Promise<void> {
    // Coordinate memory updates across agents
    // Resolve conflicts using priority matrix
    // Broadcast updates to dependent agents
  }

  async resolveMemoryConflicts(conflicts: MemoryConflict[]): Promise<ResolutionPlan> {
    // Apply TeddyKids-specific conflict resolution rules
    // Prioritize data integrity over convenience
    // Maintain development workflow continuity
  }
}
```

### 2. Data Consistency Service
```typescript
class DataConsistencyService {
  private dataStates = new Map<string, DataLayerState>();

  async synchronizeDataLayers(): Promise<SyncResult> {
    // Sync between Labs 1.0 and 2.0
    // Ensure Employes.nl data consistency
    // Coordinate React Query cache updates
  }

  async validateDataIntegrity(): Promise<IntegrityReport> {
    // Check staff data consistency across systems
    // Validate employment data transformations
    // Ensure contract data accuracy
  }
}
```

### 3. Session Persistence Service
```typescript
class SessionPersistenceService {
  async persistDevSession(session: DevSession): Promise<void> {
    // Save development context to IndexedDB
    // Coordinate with agent memory states
    // Ensure recovery capability after crashes
  }

  async restoreDevSession(): Promise<DevSession> {
    // Restore development context
    // Synchronize with current agent states
    // Validate environment consistency
  }
}
```

---

## Conflict Resolution Mechanisms

### 1. Priority Matrix
```typescript
enum ConflictPriority {
  DATA_INTEGRITY = 1,      // Highest: Protect data consistency
  USER_EXPERIENCE = 2,     // High: Maintain smooth workflows
  AGENT_COORDINATION = 3,  // Medium: Keep agents synchronized
  PERFORMANCE = 4,         // Low: Optimize when possible
}
```

### 2. Resolution Strategies
- **Data Conflicts**: Always prioritize Supabase source of truth
- **Memory Conflicts**: Use timestamp-based last-writer-wins with validation
- **Agent Conflicts**: Apply agent priority hierarchy (Chrome Detective > Surgeon > Intelligence)
- **Session Conflicts**: Merge compatible states, isolate incompatible ones

### 3. Escalation Protocols
- **Critical Conflicts**: Immediate notification to development team
- **Data Loss Risk**: Automatic backup before resolution
- **Agent Deadlock**: Implement circuit breaker patterns
- **Performance Degradation**: Graceful degradation with monitoring

---

## Implementation Protocol

### Phase 1: Agent Communication Infrastructure
1. **WebSocket Server Setup**: Real-time agent communication
2. **Memory State Database**: Persistent agent memory storage
3. **Conflict Detection Engine**: Real-time conflict identification
4. **Basic Synchronization**: Core memory harmonization

### Phase 2: Data Layer Integration
1. **Supabase Integration**: Direct database synchronization
2. **React Query Coordination**: Cache consistency management
3. **Employes.nl Sync**: Employment data harmonization
4. **Dual Architecture Support**: Labs 1.0/2.0 coordination

### Phase 3: Advanced Features
1. **Predictive Conflict Prevention**: ML-based conflict prediction
2. **Auto-resolution Systems**: Intelligent conflict resolution
3. **Performance Optimization**: Lazy loading and caching
4. **Advanced Analytics**: Memory usage and sync performance metrics

### Phase 4: Self-Healing & Intelligence
1. **Autonomous Conflict Resolution**: Self-healing memory systems
2. **Adaptive Synchronization**: ML-optimized sync intervals
3. **Predictive Data Loading**: Anticipatory data synchronization
4. **Advanced Agent Coordination**: Multi-agent workflow optimization

---

## Monitoring & Analytics

### Real-time Dashboards
- **Agent Memory Health**: Live memory synchronization status
- **Data Consistency Metrics**: Cross-system data accuracy
- **Sync Performance**: Latency and throughput monitoring
- **Conflict Resolution Stats**: Resolution success rates and patterns

### Alerting System
- **Critical Data Conflicts**: Immediate escalation
- **Agent Communication Failures**: Auto-recovery triggers
- **Performance Degradation**: Optimization recommendations
- **Memory Leaks**: Automatic cleanup triggers

---

## Success Metrics

### Agent Coordination
- **Memory Sync Latency**: < 100ms cross-agent synchronization
- **Conflict Resolution Time**: < 5s for standard conflicts
- **Agent Uptime**: 99.9% agent availability
- **Memory Consistency**: 100% cross-agent memory accuracy

### Data Synchronization
- **Data Consistency**: 100% Labs 1.0/2.0 data accuracy
- **Employes.nl Sync**: < 30s employment data synchronization
- **Cache Hit Rate**: > 95% React Query cache efficiency
- **Data Integrity**: 0 data loss incidents

### Development Experience
- **Session Recovery**: < 10s development session restoration
- **Hot Reload Consistency**: 100% HMR state preservation
- **Multi-instance Coordination**: 0 development conflicts
- **Chrome Extension Harmony**: 0 extension-related development issues

---

## Integration Commands

### Agent Communication
```bash
# Initialize Memory Syncer
npm run memory-syncer:init

# Start real-time synchronization
npm run memory-syncer:start

# Monitor agent coordination
npm run memory-syncer:monitor

# Resolve memory conflicts
npm run memory-syncer:resolve

# Generate sync reports
npm run memory-syncer:report
```

### Data Synchronization
```bash
# Sync Labs 1.0 ↔ 2.0
npm run memory-syncer:sync-labs

# Validate data consistency
npm run memory-syncer:validate-data

# Repair data conflicts
npm run memory-syncer:repair-data

# Backup memory state
npm run memory-syncer:backup
```

### Development Integration
```bash
# Persist dev session
npm run memory-syncer:save-session

# Restore dev session
npm run memory-syncer:restore-session

# Monitor dev environment
npm run memory-syncer:monitor-dev

# Clean development memory
npm run memory-syncer:clean-dev
```

---

**The TeddyKids Memory Syncer Agent ensures perfect harmony across the entire LMS ecosystem, maintaining data consistency, agent coordination, and development continuity through intelligent memory synchronization and conflict resolution.**

**Status**: ✅ Ready for immediate deployment and harmonization of the TeddyKids agent ecosystem.