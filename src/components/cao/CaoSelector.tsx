import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calculator, CheckCircle, DollarSign } from 'lucide-react';
import { CaoService, type CaoSelection, type ScaleDefinition } from '@/lib/CaoService';
import { toast } from '@/components/ui/sonner';
import { CAO_DEFAULTS } from '@/config/cao.config';

interface CaoSelectorProps {
  value?: CaoSelection;
  onChange: (selection: CaoSelection) => void;
  effectiveDate: string;
  disabled?: boolean;
  showOverride?: boolean;
  className?: string;
  hoursPerWeek?: number;
}

export const CaoSelector: React.FC<CaoSelectorProps> = ({
  value,
  onChange,
  effectiveDate,
  disabled = false,
  showOverride = false,
  className = '',
  hoursPerWeek = CAO_DEFAULTS.hoursPerWeek
}) => {
  const [selectedScale, setSelectedScale] = useState<number | undefined>(value?.scale);
  const [selectedTrede, setSelectedTrede] = useState<number | undefined>(value?.trede);
  const [isOverridden, setIsOverridden] = useState(false);
  const [manualAmount, setManualAmount] = useState<string>('');
  
  // Use ref to prevent infinite loop - same fix as useCandidates
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Fetch available scales
  const { data: scales, isLoading: scalesLoading, error: scalesError } = useQuery({
    queryKey: ['cao-scales'],
    queryFn: CaoService.getScaleDefinitions,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false, // Don't retry since we have fallback logic
  });


  // Scales state monitoring removed - keeping console clean

  // Fetch available tredes for selected scale
  const { data: tredes, isLoading: tredesLoading } = useQuery({
    queryKey: ['cao-tredes', selectedScale, effectiveDate],
    queryFn: () => selectedScale ? CaoService.getAvailableTredes(selectedScale, effectiveDate) : Promise.resolve([]),
    enabled: !!selectedScale,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Calculate salary when scale/trede changes
  const { data: calculatedSalary, isLoading: isCalculating } = useQuery({
    queryKey: ['cao-salary', selectedScale, selectedTrede, effectiveDate],
    queryFn: () => selectedScale && selectedTrede
      ? CaoService.getSalaryByDate(selectedScale, selectedTrede, effectiveDate)
      : Promise.resolve(0),
    enabled: !!selectedScale && !!selectedTrede && !isOverridden,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Auto-select default values when component becomes enabled
  useEffect(() => {
    if (!disabled && !selectedScale && !selectedTrede && scales && scales.length > 0) {
      // Auto-select default CAO scale and trede from config
      const defaultScale = scales.find(s => s.scale_number === CAO_DEFAULTS.scale);
      if (defaultScale) {
        setSelectedScale(CAO_DEFAULTS.scale);
        setSelectedTrede(CAO_DEFAULTS.trede);
      }
    }
  }, [disabled, scales, selectedScale, selectedTrede]);

  // Update parent when selection changes
  // ✅ FIX: Use onChangeRef to prevent infinite loop (onChange recreates on every parent render)
  useEffect(() => {
    if (selectedScale && selectedTrede && calculatedSalary && !isOverridden) {
      onChangeRef.current({
        scale: selectedScale,
        trede: selectedTrede,
        calculatedSalary,
        effectiveDate
      });
    } else if (isOverridden && manualAmount && selectedScale && selectedTrede) {
      const amount = parseFloat(manualAmount);
      if (!isNaN(amount) && amount > 0) {
        onChangeRef.current({
          scale: selectedScale,
          trede: selectedTrede,
          calculatedSalary: amount,
          effectiveDate
        });
      }
    }
  }, [selectedScale, selectedTrede, calculatedSalary, isOverridden, manualAmount, effectiveDate]); // ✅ Removed onChange from deps!

  const handleScaleChange = (scaleStr: string) => {
    const scale = parseInt(scaleStr);
    setSelectedScale(scale);
    setSelectedTrede(undefined); // Reset trede when scale changes
  };

  const handleTredeChange = (tredeStr: string) => {
    const trede = parseInt(tredeStr);
    setSelectedTrede(trede);
  };

  const handleOverrideToggle = () => {
    setIsOverridden(!isOverridden);
    if (!isOverridden && calculatedSalary) {
      setManualAmount(calculatedSalary.toString());
    }
  };

  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualAmount(e.target.value);
  };

  const getSelectedScaleInfo = (): ScaleDefinition | undefined => {
    return scales?.find(s => s.scale_number === selectedScale);
  };

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calculator className="h-5 w-5" />
          CAO Salary Calculator
          <Badge variant="outline" className="text-blue-700 ml-auto">
            {new Date(effectiveDate).toLocaleDateString('nl-NL')}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Disabled message */}
        {disabled && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span>⚠️</span>
              Please select start date to enable CAO calculator
            </p>
          </div>
        )}
        {/* Scale and Trede Selection - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scale Selection - Left */}
          <div className="space-y-2">
            <Label htmlFor="scale-select" className="text-sm font-medium text-gray-700">
              Functie Schaal
            </Label>
            <Select
              value={selectedScale?.toString() || ''}
              onValueChange={handleScaleChange}
              disabled={disabled || scalesLoading}
            >
              <SelectTrigger id="scale-select">
                <SelectValue placeholder={scalesLoading ? "Loading scales..." : "Selecteer schaal..."} />
              </SelectTrigger>
              <SelectContent>
                {scales?.map((scale) => (
                  <SelectItem key={scale.scale_number} value={scale.scale_number.toString()}>
                    <span className="font-medium">{scale.scale_name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trede Selection - Right */}
          <div className="space-y-2">
            <Label htmlFor="trede-select" className="text-sm font-medium text-gray-700">
              Trede (Ervaring)
            </Label>
            <Select
              value={selectedTrede?.toString() || ''}
              onValueChange={handleTredeChange}
              disabled={!selectedScale || disabled || tredesLoading}
            >
              <SelectTrigger id="trede-select">
                <SelectValue placeholder={
                  !selectedScale ? "Selecteer eerst een schaal..." :
                  tredesLoading ? "Loading tredes..." :
                  "Selecteer trede..."
                } />
              </SelectTrigger>
              <SelectContent>
                {tredes?.map((trede) => (
                  <SelectItem key={trede} value={trede.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>Trede {trede}</span>
                      {getSelectedScaleInfo() && (
                        <span className="text-xs text-gray-500 ml-2">
                          {trede === getSelectedScaleInfo()?.min_trede && 'Min'}
                          {trede === getSelectedScaleInfo()?.max_trede && 'Max'}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculated Salary Display */}
        {((calculatedSalary && calculatedSalary > 0 && !isOverridden) || (isOverridden && manualAmount)) && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Bruto - Left */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Bruto
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {isCalculating ? (
                    <span className="text-gray-400">Calculating...</span>
                  ) : (
                    `€${(calculatedSalary || 0).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`
                  )}
                </p>
              </div>

              {/* Netto - Right */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Netto
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {isCalculating ? (
                    <span className="text-gray-400">Calculating...</span>
                  ) : (
                    `€${((hoursPerWeek / 36) * (calculatedSalary || 0)).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`
                  )}
                </p>
              </div>
            </div>

            {/* Override Button */}
            {showOverride && (
              <div className="mt-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOverrideToggle}
                  disabled={disabled || !calculatedSalary}
                >
                  {isOverridden ? 'Use CAO Amount' : 'Manual Override'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Manual Override Warning */}
        {isOverridden && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Manual Override Active</span>
            </div>
            <p className="text-xs text-yellow-700">
              This will override the CAO calculated amount. Ensure compliance with labor agreements.
            </p>
          </div>
        )}

        {/* Scale Information */}
        {selectedScale && getSelectedScaleInfo() && (
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <h5 className="text-sm font-medium text-gray-800 mb-2">Schaal Informatie</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Functie Niveau:</span>
                <span className="ml-2 font-medium">{getSelectedScaleInfo()?.scale_category}</span>
              </div>
              <div>
                <span className="text-gray-600">Trede Bereik:</span>
                <span className="ml-2 font-medium">
                  {getSelectedScaleInfo()?.min_trede} - {getSelectedScaleInfo()?.max_trede}
                </span>
              </div>
            </div>
            {getSelectedScaleInfo()?.description && (
              <p className="text-xs text-gray-600 mt-2">
                {getSelectedScaleInfo()?.description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};