"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2, AlertCircle, Calculator } from 'lucide-react';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { getFundContract } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ProviderInterface, SignerInterface } from 'koilib';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function SubmitProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: SubmitProjectModalProps) {
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
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
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
    try {
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

      // todo: add approval for the fee

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

      toast.success('Project submitted successfully!');
      onSuccess?.();
      onClose();
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
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Submit New Project
          </DialogTitle>
          <DialogDescription>
            Submit a new project for community voting. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Project Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project in detail..."
              rows={4}
              className={`w-full min-h-[100px] px-3 py-2 text-sm border rounded-md bg-transparent transition-colors resize-none ${
                errors.description
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50'
                  : 'border-input focus-visible:border-ring focus-visible:ring-ring/50'
              } focus-visible:outline-none focus-visible:ring-[3px]`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Monthly Payment */}
          <div className="space-y-2">
            <label htmlFor="monthly_payment" className="text-sm font-medium">
              Monthly Payment (KOIN) *
            </label>
            <Input
              id="monthly_payment"
              type="number"
              step="0.00000001"
              min="0"
              value={formData.monthly_payment}
              onChange={(e) => handleInputChange('monthly_payment', e.target.value)}
              placeholder="0.00000000"
              className={errors.monthly_payment ? 'border-red-500' : ''}
            />
            {errors.monthly_payment && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.monthly_payment}
              </p>
            )}
          </div>

          {/* Beneficiary Address */}
          <div className="space-y-2">
            <label htmlFor="beneficiary" className="text-sm font-medium">
              Beneficiary Address *
            </label>
            <Input
              id="beneficiary"
              value={formData.beneficiary}
              onChange={(e) => handleInputChange('beneficiary', e.target.value)}
              placeholder="Enter Koinos address"
              className={errors.beneficiary ? 'border-red-500' : ''}
            />
            {errors.beneficiary && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.beneficiary}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium">
                Start Date *
              </label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.start_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="end_date" className="text-sm font-medium">
                End Date *
              </label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.end_date}
                </p>
              )}
            </div>
          </div>

          {/* Fee Information */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Submission Fee</span>
            </div>
            {isCalculatingFee ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating fee...
              </div>
            ) : calculatedFee ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The submission fee is calculated dynamically based on the current number of projects and your project duration.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Fee:</span>
                  <span className="text-lg font-bold text-primary">{calculatedFee} KOIN</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set start and end dates to calculate the submission fee.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isConnected || !calculatedFee || isCalculatingFee}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Submit Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}