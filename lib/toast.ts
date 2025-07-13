import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  icon?: string;
  style?: React.CSSProperties;
}

export interface TransactionToastOptions extends ToastOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showTxHash?: boolean;
}

/**
 * Custom toast utilities for blockchain transactions
 */
export const blockchainToast = {
  /**
   * Show a transaction toast with loading, success, and error states
   */
  transaction: async <T extends { transaction?: { id: string } }>(
    promise: Promise<T>,
    options: TransactionToastOptions = {}
  ): Promise<T> => {
    const {
      loadingMessage = 'Processing transaction...',
      successMessage = 'Transaction successful!',
      errorMessage = 'Transaction failed',
      showTxHash = false,
      ...toastOptions
    } = options;

    return toast.promise(
      promise,
      {
        loading: loadingMessage,
        success: (data: T) => {
          if (showTxHash && data?.transaction?.id) {
            return `${successMessage}\nTx: ${data.transaction.id.slice(0, 10)}...`;
          }
          return successMessage;
        },
        error: (error: Error) => {
          console.error('Transaction error:', error);
          return `${errorMessage}: ${error.message}`;
        },
      },
      {
        style: {
          minWidth: '300px',
          ...toastOptions.style,
        },
        success: {
          duration: 4000,
          icon: '✅',
          ...toastOptions,
        },
        error: {
          duration: 6000,
          icon: '❌',
          ...toastOptions,
        },
      }
    );
  },

  /**
   * Show a vote-specific toast
   */
  vote: async <T>(
    promise: Promise<T>,
    votePercentage: number,
    options: ToastOptions = {}
  ): Promise<T> => {
    return toast.promise(
      promise,
      {
        loading: 'Submitting your vote...',
        success: `Vote of ${votePercentage}% submitted successfully!`,
        error: 'Failed to submit vote. Please try again.',
      },
      {
        style: {
          minWidth: '250px',
          ...options.style,
        },
        success: {
          duration: 4000,
          icon: '🗳️',
          ...options,
        },
        error: {
          duration: 6000,
          icon: '❌',
          ...options,
        },
      }
    );
  },

  /**
   * Show a project submission toast
   */
  projectSubmission: async <T>(
    promise: Promise<T>,
    projectTitle: string,
    options: ToastOptions = {}
  ): Promise<T> => {
    return toast.promise(
      promise,
      {
        loading: 'Submitting your project...',
        success: `"${projectTitle}" submitted successfully!`,
        error: 'Failed to submit project. Please try again.',
      },
      {
        style: {
          minWidth: '300px',
          ...options.style,
        },
        success: {
          duration: 4000,
          icon: '🎉',
          ...options,
        },
        error: {
          duration: 6000,
          icon: '❌',
          ...options,
        },
      }
    );
  },

  /**
   * Show a wallet connection toast
   */
  walletConnection: {
    success: (address: string) => {
      toast.success(
        `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        {
          icon: '🔗',
          duration: 3000,
        }
      );
    },
    error: (error: string) => {
      toast.error(`Connection failed: ${error}`, {
        icon: '❌',
        duration: 5000,
      });
    },
  },

  /**
   * Show a generic success toast
   */
  success: (message: string, options: ToastOptions = {}) => {
    toast.success(message, {
      icon: '✅',
      duration: 3000,
      ...options,
    });
  },

  /**
   * Show a generic error toast
   */
  error: (message: string, options: ToastOptions = {}) => {
    toast.error(message, {
      icon: '❌',
      duration: 5000,
      ...options,
    });
  },

  /**
   * Show a generic info toast
   */
  info: (message: string, options: ToastOptions = {}) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options: ToastOptions = {}) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--warning))',
      },
      ...options,
    });
  },

  /**
   * Show a loading toast that can be dismissed manually
   */
  loading: (message: string, options: ToastOptions = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

export default blockchainToast;