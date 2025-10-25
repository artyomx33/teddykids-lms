# 🎯 Technical Debt - Quick Reference Checklist

## 🔴 CRITICAL (DO FIRST - Blocks Features)

### Database Work
- [ ] **staff_document_compliance** table
  - File: `src/components/dashboard/AppiesInsight.tsx:77`
  - Impact: Document compliance widget shows no data
  - Time: 2 hours
  
- [ ] **staff.is_intern** column
  - Files: `src/components/analytics/PredictiveInsights.tsx:46`, `src/components/dashboard/InternWatchWidget.tsx:17`
  - Impact: Blocks intern tracking and Phase 4
  - Time: 2 hours
  
- [ ] **contracts_enriched_v2** data verification
  - Impact: 22 files may have stale/empty data
  - Time: 1 hour

**Critical Total**: ~5 hours

---

## 🟠 HIGH (Do Next - Fix Data Quality)

### Mock Data Removal
- [ ] AppiesInsight.tsx (line 97) → Real query
- [ ] InternWatchWidget.tsx (line 19) → Real query  
- [ ] PredictiveInsights.tsx (line 49) → Real query
- [ ] Insights.tsx (lines 28, 40, 51-52) → Real queries
- [ ] StaffActionCards.tsx (line 78) → Real query

**Pattern**: Replace `return []` or mock objects with actual Supabase queries

**High Total**: ~4 hours

---

## 🟡 MEDIUM (Nice to Have - Features)

### Feature Completion TODOs
- [ ] AI Insights: `src/hooks/talent/useAiInsights.ts:123`
- [ ] Email Integration: `src/lib/api/hiring.ts:513`
- [ ] Wage Calculation: `src/pages/StaffProfile.tsx:168`
- [ ] Gamification: `src/pages/labs/Gamification.tsx:642`
- [ ] Contract DNA: `src/pages/labs/ContractDNA.tsx:109`

**Logger Cleanup** (Choose one):
- [ ] Option A: Delete all `// logger.debug... TODO` comments (23 instances)
- [ ] Option B: Restore logger module properly
- [ ] Option C: Replace with `console.debug` wrapped in `if (DEBUG)`

**Medium Total**: ~6 hours

---

## 🟢 LOW (Ongoing - Code Quality)

### Refactoring & Cleanup
- [ ] ReviewForm.tsx (917 lines) - Add error boundaries
- [ ] Archive TalentAcquisition backup files
- [ ] Remove "Silently" handled pattern comments
- [ ] Implement keyboard navigation (NavigationContainer.tsx)

**Low Total**: ~8 hours

---

## 📋 Files at a Glance

### CRITICAL (2 files, 3 issues)
```
AppiesInsight.tsx         ← staff_document_compliance + logger TODOs
InternWatchWidget.tsx     ← staff.is_intern
PredictiveInsights.tsx    ← staff.is_intern + logger TODO
```

### HIGH (5 files)
```
AppiesInsight.tsx         ← Mock data
InternWatchWidget.tsx     ← Mock data
Insights.tsx              ← Mock staff + opportunities
StaffActionCards.tsx      ← Mock document compliance
PredictiveInsights.tsx    ← Mock intern data
```

### MEDIUM (7 files)
```
useAiInsights.ts          ← AI endpoint TODO
hiring.ts                 ← Email integration TODO
StaffProfile.tsx          ← Wage calculation TODO
Gamification.tsx          ← Power-up logic TODO
ContractDNA.tsx           ← Satisfaction TODO
CaoService.ts             ← Alternative matches TODO
AppiesInsight.tsx         ← 6x logger TODOs
```

### LOW (10+ files)
```
ReviewForm.tsx            ← 917 lines, needs refactor
NavigationContainer.tsx   ← Keyboard nav TODOs
Various .tsx files        ← Logger comment cleanup
TalentAcquisition backups ← Archive candidates
```

---

## ⚡ Quick Actions

### 5-Minute Wins
```bash
# Count total TODOs
grep -r "TODO\|FIXME" src/ | wc -l

# Find all mock data
grep -r "mockData\|mock\[Data\]" src/ | head -20

# Find "Silently" patterns
grep -r "Silently" src/

# List all files with TODOs
grep -r "TODO" src/ | cut -d: -f1 | sort -u
```

### Database Diagnostics
```sql
-- Check staff_document_compliance exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'staff_document_compliance'
);

-- Check is_intern column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'staff' AND column_name = 'is_intern'
);

-- Check contracts_enriched_v2 has data
SELECT COUNT(*) FROM contracts_enriched_v2;
```

---

## 🎯 Priority Matrix

|           | Effort | Impact | Priority | Status |
|-----------|--------|--------|----------|--------|
| Database  | 5 hrs  | HIGH   | 🔴 DO FIRST | ⏳ PENDING |
| Mock Data | 4 hrs  | HIGH   | 🔴 DO EARLY | ⏳ PENDING |
| Features  | 6 hrs  | MEDIUM | 🟡 LATER | ⏳ PENDING |
| Cleanup   | 8 hrs  | LOW    | 🟢 ONGOING | ⏳ PENDING |

**Total Effort**: ~23 hours for full remediation

---

## 📊 Impact by User

### For End Users
- ❌ Document compliance widget shows wrong data
- ❌ Intern tracking doesn't work
- ❌ Email notifications not sent
- ❌ AI insights not showing

### For Developers
- ❌ Hard to debug (logger commented out)
- ❌ Mock data confuses testing
- ❌ Incomplete features block workflows
- ❌ Large components hard to maintain

### For Data Integrity
- ⚠️ Silent failures instead of errors
- ⚠️ Wrong data shown in dashboards
- ⚠️ No audit trail for document changes
- ⚠️ Intern progress not tracked

---

## ✅ Done Checklist

- [x] Completed full code sweep (41 files, 65 issues found)
- [x] Created remediation roadmap
- [x] Documented all critical issues
- [x] Provided code samples and fixes
- [x] Estimated effort (23 hours)
- [ ] **NEXT**: Create sprint tasks
- [ ] **NEXT**: Get team approval on prioritization
- [ ] **NEXT**: Start with Critical database work

---

## 🔗 Related Documents

- **Main Report**: `TECHNICAL_DEBT_SWEEP_COMPLETE.md` (comprehensive)
- **Detailed Guide**: `TECHNICAL_DEBT_DETAILED_BREAKDOWN.md` (with SQL + code examples)
- **Architecture Review**: `src/agents/AGENT_architecture-analyst.md` (context)
- **Refactoring Guide**: `src/agents/AGENT_component-refactoring-architect.md` (philosophy)

---

## 📞 Questions to Answer

1. **Logger**: Should we restore logging or remove the comments?
2. **TeamMoodMapping**: Is this a priority LABS feature or can we ignore for now?
3. **contracts_enriched_v2**: Should we investigate data sync issues first?
4. **Sprint**: Do you want this in one sprint or split across multiple?

---

**Report Generated**: October 25, 2025  
**Next Review**: After critical database work complete  
**Status**: 🟠 Ready for sprint planning
