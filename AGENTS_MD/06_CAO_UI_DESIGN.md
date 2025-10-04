# CAO Salary Interface Design & User Experience

## Overview

This document outlines the user interface design for the CAO (Collective Labor Agreement) salary system integration, providing both guided salary creation and intelligent salary analysis capabilities.

## Current Integration Points

### Existing Salary Workflows
1. **Staff Creation/Editing**: Manual salary entry in staff management
2. **Contract Management**: Salary setting during contract creation
3. **Review Process**: Salary adjustments during performance reviews
4. **Employes.nl Sync**: Salary data import from external system

## UI Components Design

### 1. CAO Scale & Trede Selector

```typescript
interface CaoSelectorProps {
  value?: {
    scale: number;
    trede: number;
    calculatedSalary: number;
  };
  onChange: (selection: CaoSelection) => void;
  effectiveDate: string;
  disabled?: boolean;
}

const CaoSelector: React.FC<CaoSelectorProps> = ({
  value,
  onChange,
  effectiveDate,
  disabled = false
}) => {
  const [selectedScale, setSelectedScale] = useState(value?.scale);
  const [selectedTrede, setSelectedTrede] = useState(value?.trede);
  const [isOverridden, setIsOverridden] = useState(false);

  // Fetch available scales
  const { data: scales } = useQuery({
    queryKey: ['cao-scales'],
    queryFn: fetchCaoScales
  });

  // Fetch available tredes for selected scale
  const { data: tredes } = useQuery({
    queryKey: ['cao-tredes', selectedScale, effectiveDate],
    queryFn: () => fetchAvailableTredes(selectedScale!, effectiveDate),
    enabled: !!selectedScale
  });

  // Calculate salary when scale/trede changes
  const { data: calculatedSalary, isLoading: isCalculating } = useQuery({
    queryKey: ['cao-salary', selectedScale, selectedTrede, effectiveDate],
    queryFn: () => calculateCaoSalary(selectedScale!, selectedTrede!, effectiveDate),
    enabled: !!selectedScale && !!selectedTrede
  });

  return (
    <div className="cao-selector bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">CAO Salary Calculator</h3>
        <Badge variant="outline" className="text-blue-700">
          Effective: {new Date(effectiveDate).toLocaleDateString('nl-NL')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Scale Selection */}
        <div className="space-y-2">
          <Label htmlFor="scale-select" className="text-sm font-medium text-gray-700">
            Functie Schaal
          </Label>
          <Select value={selectedScale?.toString()} onValueChange={(value) => setSelectedScale(parseInt(value))}>
            <SelectTrigger id="scale-select" disabled={disabled}>
              <SelectValue placeholder="Selecteer schaal..." />
            </SelectTrigger>
            <SelectContent>
              {scales?.map((scale) => (
                <SelectItem key={scale.scale_number} value={scale.scale_number.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">Schaal {scale.scale_number}</span>
                    <span className="text-xs text-gray-500">{scale.scale_category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trede Selection */}
        <div className="space-y-2">
          <Label htmlFor="trede-select" className="text-sm font-medium text-gray-700">
            Trede (Ervaring)
          </Label>
          <Select
            value={selectedTrede?.toString()}
            onValueChange={(value) => setSelectedTrede(parseInt(value))}
            disabled={!selectedScale || disabled}
          >
            <SelectTrigger id="trede-select">
              <SelectValue placeholder="Selecteer trede..." />
            </SelectTrigger>
            <SelectContent>
              {tredes?.map((trede) => (
                <SelectItem key={trede} value={trede.toString()}>
                  Trede {trede}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calculated Salary Display */}
      {calculatedSalary && (
        <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CAO Bruto Maandsalaris (36u)</p>
              <p className="text-2xl font-bold text-green-600">
                €{calculatedSalary.toLocaleString('nl-NL')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Schaal {selectedScale} • Trede {selectedTrede}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOverridden(!isOverridden)}
                className="mt-2"
              >
                {isOverridden ? 'Use CAO Amount' : 'Manual Override'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Section */}
      {isOverridden && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Manual Override Active</span>
          </div>
          <Input
            type="number"
            placeholder="Enter custom salary amount..."
            className="w-full"
            min={0}
            step={0.01}
          />
          <p className="text-xs text-yellow-700 mt-1">
            This will override the CAO calculated amount. Ensure compliance with labor agreements.
          </p>
        </div>
      )}
    </div>
  );
};
```

### 2. Salary Detection & Reverse Lookup (VLookup)

```typescript
interface SalaryDetectorProps {
  salary: number;
  effectiveDate: string;
  onDetectionResult?: (result: TredeDetectionResult) => void;
}

const SalaryTredeDetector: React.FC<SalaryDetectorProps> = ({
  salary,
  effectiveDate,
  onDetectionResult
}) => {
  // Perform reverse lookup
  const { data: detection, isLoading } = useQuery({
    queryKey: ['trede-detection', salary, effectiveDate],
    queryFn: () => detectTredeFromSalary(salary, effectiveDate),
    enabled: !!salary && salary > 0,
    onSuccess: onDetectionResult
  });

  if (!salary || salary <= 0) return null;
  if (isLoading) return <SalaryDetectionSkeleton />;
  if (!detection) return null;

  return (
    <div className="salary-detector bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-emerald-600" />
        <h4 className="font-medium text-emerald-900">CAO Analyse</h4>
      </div>

      {detection.isExactMatch ? (
        <ExactMatchDisplay detection={detection} salary={salary} />
      ) : (
        <NearestMatchDisplay detection={detection} salary={salary} />
      )}

      {/* Scale Information */}
      <div className="mt-3 p-3 bg-white rounded border border-emerald-200">
        <h5 className="text-sm font-medium text-gray-800 mb-2">Schaal Informatie</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Functie Niveau:</span>
            <span className="ml-2 font-medium">{detection.scaleInfo.scale_category}</span>
          </div>
          <div>
            <span className="text-gray-600">Trede Bereik:</span>
            <span className="ml-2 font-medium">
              {detection.scaleInfo.min_trede} - {detection.scaleInfo.max_trede}
            </span>
          </div>
        </div>
      </div>

      {/* Progression Preview */}
      <SalaryProgressionPreview
        scale={detection.scale}
        currentTrede={detection.exactTrede || detection.nearestTrede}
        effectiveDate={effectiveDate}
      />
    </div>
  );
};

const ExactMatchDisplay = ({ detection, salary }: { detection: TredeDetectionResult, salary: number }) => (
  <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <div>
        <p className="font-medium text-green-800">Perfect Match!</p>
        <p className="text-sm text-green-700">
          Schaal {detection.scale}, Trede {detection.exactTrede}
        </p>
      </div>
    </div>
    <Badge variant="success" className="bg-green-600">
      €{salary.toLocaleString('nl-NL')}
    </Badge>
  </div>
);

const NearestMatchDisplay = ({ detection, salary }: { detection: TredeDetectionResult, salary: number }) => {
  const difference = detection.salaryDifference;
  const isOver = difference > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-300">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Closest Match</p>
            <p className="text-sm text-blue-700">
              Schaal {detection.scale}, Trede {detection.nearestTrede}
            </p>
          </div>
        </div>
        <Badge variant={isOver ? "destructive" : "secondary"}>
          {isOver ? '+' : ''}€{Math.abs(difference).toLocaleString('nl-NL')}
        </Badge>
      </div>

      {/* Difference Analysis */}
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        {isOver ? (
          <span className="text-red-600">
            ⚠️ Salary is €{Math.abs(difference)} above CAO rate - verify compliance
          </span>
        ) : (
          <span className="text-orange-600">
            💡 Salary is €{Math.abs(difference)} below CAO rate - consider adjustment
          </span>
        )}
      </div>
    </div>
  );
};
```

### 3. Salary Progression Preview

```typescript
const SalaryProgressionPreview: React.FC<{
  scale: number;
  currentTrede: number;
  effectiveDate: string;
}> = ({ scale, currentTrede, effectiveDate }) => {
  const { data: progression } = useQuery({
    queryKey: ['salary-progression', scale, currentTrede],
    queryFn: () => getSalaryProgression(scale, currentTrede)
  });

  if (!progression) return null;

  return (
    <div className="mt-4 p-3 bg-white rounded border border-gray-200">
      <h5 className="text-sm font-medium text-gray-800 mb-3">Salaris Progressie</h5>

      <div className="space-y-2">
        {progression.map((item, index) => (
          <div
            key={item.effectiveDate}
            className={`flex justify-between items-center p-2 rounded ${
              item.effectiveDate === effectiveDate
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50'
            }`}
          >
            <span className="text-sm text-gray-700">
              {new Date(item.effectiveDate).toLocaleDateString('nl-NL')}
            </span>
            <span className="font-medium">
              €{item.salary.toLocaleString('nl-NL')}
            </span>
            {index > 0 && (
              <Badge variant="outline" className="text-xs">
                +€{(item.salary - progression[index-1].salary).toLocaleString('nl-NL')}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Next Trede Preview */}
      <NextTredePreview scale={scale} currentTrede={currentTrede} effectiveDate={effectiveDate} />
    </div>
  );
};
```

### 4. Integration with Existing Forms

```typescript
// Enhanced Staff Salary Form
const StaffSalaryForm = () => {
  const [useCaoCalculator, setUseCaoCalculator] = useState(false);
  const [manualSalary, setManualSalary] = useState('');
  const [caoSelection, setCaoSelection] = useState<CaoSelection>();

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <Label htmlFor="cao-toggle" className="text-base font-medium">
          Use CAO Salary Calculator
        </Label>
        <Switch
          id="cao-toggle"
          checked={useCaoCalculator}
          onCheckedChange={setUseCaoCalculator}
        />
      </div>

      {useCaoCalculator ? (
        <>
          {/* CAO Calculator Mode */}
          <CaoSelector
            value={caoSelection}
            onChange={setCaoSelection}
            effectiveDate={effectiveDate}
          />

          {/* Show detection for calculated amount */}
          {caoSelection?.calculatedSalary && (
            <SalaryTredeDetector
              salary={caoSelection.calculatedSalary}
              effectiveDate={effectiveDate}
            />
          )}
        </>
      ) : (
        <>
          {/* Manual Entry Mode */}
          <div className="space-y-2">
            <Label htmlFor="manual-salary">Bruto Maandsalaris (€)</Label>
            <Input
              id="manual-salary"
              type="number"
              value={manualSalary}
              onChange={(e) => setManualSalary(e.target.value)}
              placeholder="Enter salary amount..."
            />
          </div>

          {/* Show detection for manual entry */}
          {manualSalary && parseFloat(manualSalary) > 0 && (
            <SalaryTredeDetector
              salary={parseFloat(manualSalary)}
              effectiveDate={effectiveDate}
            />
          )}
        </>
      )}

      {/* Compliance Check */}
      <ComplianceCheck
        salary={useCaoCalculator ? caoSelection?.calculatedSalary : parseFloat(manualSalary)}
        scale={caoSelection?.scale}
        trede={caoSelection?.trede}
        effectiveDate={effectiveDate}
      />
    </div>
  );
};
```

### 5. Employes.nl Integration Display

```typescript
const EmployesSalaryAnalysis = ({ employesData, staffId }: {
  employesData: EmployesEmployeeData;
  staffId: string;
}) => {
  // Get current salary from Employes.nl
  const currentSalary = employesData.current_salary;

  // Detect CAO information
  const { data: caoAnalysis } = useQuery({
    queryKey: ['employes-cao-analysis', currentSalary, staffId],
    queryFn: () => analyzeEmployesSalaryAgainstCao(currentSalary, new Date().toISOString().split('T')[0])
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Employes.nl CAO Analysis</h3>
        <Badge variant="outline">
          Live Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Salary Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Current Salary (Employes.nl)</p>
            <p className="text-2xl font-bold text-blue-600">
              €{currentSalary.toLocaleString('nl-NL')}
            </p>
          </div>

          {/* Contract Details */}
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">Contract Details</h4>
            <div className="text-sm space-y-1">
              <div>Hours/Week: {employesData.hours_per_week}</div>
              <div>Contract Type: {employesData.contract_type}</div>
              <div>Start Date: {new Date(employesData.start_date).toLocaleDateString('nl-NL')}</div>
            </div>
          </div>
        </div>

        {/* CAO Analysis */}
        <div>
          {caoAnalysis && (
            <SalaryTredeDetector
              salary={currentSalary}
              effectiveDate={new Date().toISOString().split('T')[0]}
            />
          )}
        </div>
      </div>

      {/* Recommendations */}
      {caoAnalysis && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
          <div className="text-sm text-blue-800">
            {caoAnalysis.isCompliant ? (
              <p>✅ Salary is compliant with CAO agreements</p>
            ) : (
              <p>⚠️ Review recommended: Salary may need adjustment for CAO compliance</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Mobile-First Responsive Design

```typescript
// Mobile-optimized CAO selector
const MobileCaoSelector = () => {
  return (
    <div className="space-y-4">
      {/* Collapsible sections for mobile */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg">
          <span className="font-medium">CAO Calculator</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 space-y-4">
          {/* Scale selection first */}
          <ScaleSelector />
          {/* Then trede selection */}
          <TredeSelector />
          {/* Result display */}
          <SalaryResult />
        </CollapsibleContent>
      </Collapsible>

      {/* Detection results in accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="cao-analysis">
          <AccordionTrigger>CAO Analysis</AccordionTrigger>
          <AccordionContent>
            <SalaryTredeDetector />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
```

## Accessibility Features

```typescript
// Screen reader friendly labels and descriptions
const AccessibleCaoSelector = () => {
  return (
    <div role="region" aria-labelledby="cao-calculator-heading">
      <h3 id="cao-calculator-heading" className="sr-only">
        CAO Salary Calculator
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="scale-select" className="text-sm font-medium">
            Function Scale
            <span className="sr-only">
              Select the appropriate job function scale according to CAO agreements
            </span>
          </Label>
          <Select>
            {/* Options with descriptive text */}
          </Select>
        </div>

        <div>
          <Label htmlFor="trede-select" className="text-sm font-medium">
            Experience Step (Trede)
            <span className="sr-only">
              Select experience level step within the chosen scale
            </span>
          </Label>
          <Select>
            {/* Options */}
          </Select>
        </div>

        {/* Results announced to screen readers */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {calculatedSalary && (
            <span className="sr-only">
              Calculated CAO salary: {calculatedSalary} euros per month
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Performance Optimizations

```typescript
// Optimized queries with caching
const useCaoData = () => {
  // Cache scales for the session
  const scalesQuery = useQuery({
    queryKey: ['cao-scales'],
    queryFn: fetchCaoScales,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
  });

  // Cache salary calculations
  const calculateSalary = useCallback(
    debounce(async (scale: number, trede: number, date: string) => {
      return queryClient.fetchQuery({
        queryKey: ['cao-salary', scale, trede, date],
        queryFn: () => calculateCaoSalary(scale, trede, date),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    }, 300),
    []
  );

  return {
    scales: scalesQuery.data,
    calculateSalary,
    isLoading: scalesQuery.isLoading,
  };
};

// Virtualized large datasets
const VirtualizedTredeList = ({ tredes }: { tredes: number[] }) => {
  return (
    <FixedSizeList
      height={200}
      itemCount={tredes.length}
      itemSize={35}
      itemData={tredes}
    >
      {TredeItem}
    </FixedSizeList>
  );
};
```

This comprehensive UI design provides:

1. **Intuitive Scale/Trede Selection** with real-time salary calculation
2. **Intelligent Salary Detection** (reverse lookup/vlookup functionality)
3. **Manual Override Capability** for special cases
4. **Employes.nl Integration** showing live data analysis
5. **Mobile-Responsive Design** for all devices
6. **Accessibility Compliance** for screen readers
7. **Performance Optimization** with caching and debouncing

The interface seamlessly blends guided CAO calculations with intelligent salary analysis, making salary management both compliant and user-friendly.