"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingInput, FloatingTextarea } from '@/components/ui/floating-input';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Loader2, Calculator, ArrowLeft } from 'lucide-react';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { getFundContract } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ProviderInterface, SignerInterface } from 'koilib';
import { useRouter } from 'next/navigation';

interface SubmitProjectFormProps {
  onSuccess?: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  monthly_payment: string;
  beneficiary: string;
  start_date: string;
  end_date: string;
}

interface GlobalVars {
  total_active_projects: number;
  total_upcoming_projects: number;
  fee_denominator: string;
}

export function SubmitProjectForm({ onSuccess }: SubmitProjectFormProps) {
  const { isConnected, getKondorProvider, getKondorSigner } = useKondorWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState<string>('');
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    monthly_payment: '',
    beneficiary: '',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const router = useRouter();

  const calculateFee = useCallback(async () => {
    if (!formData.start_date || !formData.end_date) {
      setCalculatedFee('');
      return;
    }

    setIsCalculatingFee(true);
    try {
      const provider = getKondorProvider() as ProviderInterface;
      const fund = getFundContract(provider);

      // Get global vars from the fund contract
      const { result: globalVars } = await fund.functions.get_global_vars<GlobalVars>();

      if (!globalVars) {
        throw new Error('Failed to fetch global variables');
      }

      // Calculate fee using the formula: p * p * p * (end_date - start_date) / fee_denominator
      const p = (globalVars.total_active_projects || 0) + (globalVars.total_upcoming_projects || 0) + 1;
      const startTimestamp = new Date(formData.start_date).getTime();
      const endTimestamp = new Date(formData.end_date).getTime();

      const feeNumerator = p * p * p * (endTimestamp - startTimestamp);
      const feeDenominator = parseInt(globalVars.fee_denominator);
      const feeInSmallestUnit = Math.ceil(feeNumerator / feeDenominator);
      const feeInKoin = feeInSmallestUnit / 1e8;

      setCalculatedFee(feeInKoin.toFixed(8));
    } catch (error) {
      console.error('Error calculating fee:', error);
      toast.error('Failed to calculate submission fee');
      setCalculatedFee('');
    } finally {
      setIsCalculatingFee(false);
    }
  }, [formData.start_date, formData.end_date, getKondorProvider]);

  // Calculate fee when form data changes
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      calculateFee();
    } else {
      setCalculatedFee('');
    }
  }, [formData.start_date, formData.end_date, calculateFee]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.monthly_payment.trim()) {
      newErrors.monthly_payment = 'Monthly payment is required';
    } else {
      const payment = parseFloat(formData.monthly_payment);
      if (isNaN(payment) || payment <= 0) {
        newErrors.monthly_payment = 'Monthly payment must be a positive number';
      }
    }

    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = 'Beneficiary address is required';
    } else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(formData.beneficiary)) {
      newErrors.beneficiary = 'Invalid Koinos address format';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const startDate = new Date(formData.start_date + 'T00:00:00');
      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
        } else {
      const endDate = new Date(formData.end_date + 'T00:00:00');

      // Check if end date is in the past
      if (endDate < today) {
        newErrors.end_date = 'End date cannot be in the past';
      }
      // Check if end date is at least one day after start date (only if start date is valid)
      else if (formData.start_date) {
        const startDate = new Date(formData.start_date + 'T00:00:00');
        if (endDate <= startDate) {
          newErrors.end_date = 'End date must be at least one day after start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!calculatedFee) {
      toast.error('Please wait for fee calculation to complete');
      return;
    }

    setIsLoading(true);

    // Enhanced toast.promise pattern for better UX
    const submitProject = async () => {
      const provider = getKondorProvider() as ProviderInterface;
      const signer = await getKondorSigner() as SignerInterface;
      const fund = getFundContract(provider, signer);

      // Convert monthly payment to the correct format (multiply by 1e8)
      const monthlyPaymentInKoin = parseFloat(formData.monthly_payment);
      const monthlyPaymentInSmallestUnit = Math.floor(monthlyPaymentInKoin * 1e8);

      // Convert dates to timestamps
      const startTimestamp = new Date(formData.start_date).getTime();
      const endTimestamp = new Date(formData.end_date).getTime();

      // Convert calculated fee to smallest unit
      const feeInKoin = parseFloat(calculatedFee);
      const feeInSmallestUnit = Math.floor(feeInKoin * 1e8);

      const { transaction, receipt } = await fund.functions.submit_project({
        creator: signer.getAddress(),
        beneficiary: formData.beneficiary,
        title: formData.title,
        description: formData.description,
        monthly_payment: monthlyPaymentInSmallestUnit.toString(),
        start_date: startTimestamp.toString(),
        end_date: endTimestamp.toString(),
        fee: feeInSmallestUnit.toString(),
      });

      console.log('project submission result:', { transaction, receipt });

      // Wait for the transaction to be mined (if transaction exists)
      if (transaction?.id) {
        const { blockNumber } = await provider.wait(transaction.id);
        console.log(`project submission transaction mined in block ${blockNumber}`);
      }

      return transaction;
    };

    try {
      await toast.promise(
        submitProject(),
        {
          loading: 'Submitting your project...',
          success: 'Project submitted successfully!',
          error: 'Failed to submit project. Please try again.',
        },
        {
          style: {
            minWidth: '250px',
          },
          success: {
            duration: 4000,
            icon: '🎉',
          },
          error: {
            duration: 6000,
          },
        }
      );

      onSuccess?.();

      // Reset form
      setFormData({
        title: '',
        description: '',
        monthly_payment: '',
        beneficiary: '',
        start_date: '',
        end_date: '',
      });
      setCalculatedFee('');
    } catch (error) {
      console.error('Error submitting project:', error);
      // Error is already handled by toast.promise
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2">
      <div className="space-y-8">
                {/* Project Title */}
        <div className="space-y-2">
          <FloatingInput
            label="Project Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
          />
        </div>

                {/* Project Description */}
        <div className="space-y-2">
          <FloatingTextarea
            label="Project Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            rows={5}
          />
        </div>

                {/* Monthly Payment */}
        <div className="space-y-2">
          <div className="relative">
            <FloatingInput
              label="Monthly Payment"
              type="number"
              step="0.00000001"
              min="0"
              value={formData.monthly_payment}
              onChange={(e) => handleInputChange('monthly_payment', e.target.value)}
              error={errors.monthly_payment}
              className="pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              KOIN
            </span>
          </div>
        </div>

                {/* Beneficiary Address */}
        <div className="space-y-2">
          <FloatingInput
            label="Beneficiary Address"
            value={formData.beneficiary}
            onChange={(e) => handleInputChange('beneficiary', e.target.value)}
            error={errors.beneficiary}
          />
        </div>

                {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(value) => handleInputChange('start_date', value)}
              error={errors.start_date}
            />
          </div>

          <div className="space-y-2">
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(value) => handleInputChange('end_date', value)}
              error={errors.end_date}
              minDate={formData.start_date}
            />
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Submission Fee</h3>
              <p className="text-sm text-muted-foreground">
                Calculated based on project duration and current network activity
              </p>
            </div>
          </div>

          {isCalculatingFee ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculating fee...</span>
            </div>
          ) : calculatedFee ? (
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Total Fee:</span>
              <span className="text-2xl font-bold text-primary">{calculatedFee} KOIN</span>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Set start and end dates to calculate the submission fee
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-14 text-base border-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isConnected || !calculatedFee || isCalculatingFee}
            className="flex-1 h-14 text-base rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Submit Project
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}