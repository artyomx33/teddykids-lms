# Database Schema Guardian - Usage Guide

## Quick Start

The Database Schema Guardian is a Cursor AI agent that helps you write better database migrations by:
- **Disabling RLS** (Row Level Security) for development
- Validating migration syntax and structure
- Detecting breaking changes
- Suggesting performance improvements
- Ensuring schema integrity

## When to Use

### ✅ Use Before:
- Creating a new migration file
- Running migrations on development database
- Committing migration files to git
- Deploying to staging/production
- Refactoring database schema

### ✅ Use After:
- Merging migration files from different branches
- Experiencing migration errors
- Database performance issues
- Application errors after schema changes

## How to Invoke in Cursor

### Method 1: Direct Invocation
1. Open your migration file in Cursor
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Type: `@database-schema-guardian analyze this migration`
4. Review the feedback and apply suggestions

### Method 2: Context Menu
1. Select the migration SQL code
2. Right-click → "Ask AI"
3. Type: `Run database schema guardian on this`

### Method 3: Chat Panel
1. Open Cursor's chat panel
2. Reference the agent: `@src/agents/database-schema-guardian.md`
3. Paste your migration code
4. Ask: `Analyze this migration and suggest improvements`

## Common Commands

### Full Analysis
```
@database-schema-guardian perform full analysis on this migration file
```

### RLS Check Only
```
Check for RLS policies and disable them (except Gmail tables)
```

### Performance Check
```
Analyze indexes and suggest performance improvements
```

### Breaking Changes Check
```
Detect any breaking changes in this migration
```

### Generate Rollback
```
Create a rollback migration for these changes
```

## Example Scenarios

### Scenario 1: New Table Creation
```sql
-- Your migration
CREATE TABLE employee_reviews (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  review_date DATE,
  score INTEGER
);

-- Agent will suggest:
-- 1. Add IF NOT EXISTS
-- 2. Use gen_random_uuid() for id
-- 3. Add index on foreign key
-- 4. Add timestamps
-- 5. Name the foreign key constraint
```

### Scenario 2: Found RLS Policy
```sql
-- Your migration
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_policy ON staff ...

-- Agent will suggest:
-- 1. DISABLE RLS instead
-- 2. Add comment explaining why
-- 3. Create separate production migration for RLS
```

### Scenario 3: Adding Constraints
```sql
-- Your migration
ALTER TABLE staff ADD CHECK (salary > 0);

-- Agent will suggest:
-- 1. Check existing data first
-- 2. Name the constraint
-- 3. Make it idempotent with IF NOT EXISTS
```

## Integration with Development Workflow

### Pre-Commit Hook (Optional)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for SQL migration files
for file in $(git diff --cached --name-only | grep -E '\.sql$'); do
  echo "Running DB Guardian on $file"
  # You can add automated checking here
done
```

### VS Code Task (Optional)
Add to `.vscode/tasks.json`:
```json
{
  "label": "DB Guardian Check",
  "type": "shell",
  "command": "echo 'Open migration file and run: @database-schema-guardian analyze'",
  "problemMatcher": []
}
```

### GitHub Actions Integration (Future)
```yaml
- name: DB Migration Check
  run: |
    # Future: automated migration validation
    echo "Checking migrations with DB Guardian"
```

## Understanding Agent Feedback

### Severity Levels

- 🔴 **CRITICAL**: Will break the application
  - Missing tables/columns referenced
  - Syntax errors
  - Circular dependencies

- 🟡 **WARNING**: Potential issues
  - Missing indexes on foreign keys
  - No rollback strategy
  - Breaking changes without migration path

- 🟢 **SUGGESTION**: Best practices
  - Naming conventions
  - Performance optimizations
  - Code organization

### RLS Specific Feedback

The agent has strong opinions about RLS:

```sql
-- ❌ AGENT WILL FLAG
ALTER TABLE any_table ENABLE ROW LEVEL SECURITY;

-- ✅ AGENT APPROVES
ALTER TABLE any_table DISABLE ROW LEVEL SECURITY;

-- ⚠️ EXCEPTIONS (Agent allows RLS)
ALTER TABLE gmail_messages ENABLE ROW LEVEL SECURITY; -- Multi-user requirement
```

## Best Practices

### 1. Always Make Migrations Idempotent
```sql
-- ✅ GOOD
CREATE TABLE IF NOT EXISTS ...
ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
DROP TABLE IF EXISTS ...

-- ❌ BAD
CREATE TABLE ...
ALTER TABLE ... ADD COLUMN ...
DROP TABLE ...
```

### 2. Name Your Constraints
```sql
-- ✅ GOOD
CONSTRAINT fk_reviews_staff FOREIGN KEY (staff_id) REFERENCES staff(id)

-- ❌ BAD
FOREIGN KEY (staff_id) REFERENCES staff(id)
```

### 3. Index Foreign Keys
```sql
-- ✅ GOOD
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);

-- ❌ BAD
-- No index on foreign key
```

### 4. Keep RLS Disabled During Development
```sql
-- Development migrations
ALTER TABLE x DISABLE ROW LEVEL SECURITY;

-- Production migration (separate file)
ALTER TABLE x ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...
```

## Troubleshooting

### Agent Not Responding
1. Make sure the agent file exists: `src/agents/database-schema-guardian.md`
2. Try referencing it explicitly: `@src/agents/database-schema-guardian.md`
3. Restart Cursor if needed

### False Positives
The agent might flag valid patterns. You can:
1. Add a comment explaining why it's intentional
2. Request a second opinion with context
3. Override with `-- Guardian: ignore`

### Performance
For large migrations (1000+ lines):
1. Split into smaller files
2. Analyze in chunks
3. Focus on specific sections

## Advanced Features

### Custom Rules
Add your own rules to the agent:
```sql
-- In your migration
-- @guardian-rule: check-table-prefix
-- All tables must start with 'teddykids_'
```

### Generate Production Migration
```
@database-schema-guardian generate production-ready version with RLS enabled
```

### Compare Schemas
```
@database-schema-guardian compare this migration with production schema
```

## Tips & Tricks

1. **Run Early and Often**: Check migrations as you write them
2. **Save Templates**: Keep agent-approved templates for common patterns
3. **Learn from Feedback**: The agent explains WHY, not just WHAT
4. **Production Checklist**: Use agent to generate production readiness checklist
5. **Team Standards**: Share agent feedback to establish team conventions

## Related Agents

- **Migration Validator**: Pre-deployment validation (coming soon)
- **Data Integrity Monitor**: Runtime data validation (coming soon)
- **Performance Watchdog**: Query performance analysis (coming soon)

## Support & Feedback

- Report issues in: `TODO_agents.md`
- Suggest improvements: Add comments to agent file
- Share success stories: Document in team wiki

---

*Last Updated: October 2025*  
*Agent Version: 1.0*  
*Development-First Philosophy* 🚀
