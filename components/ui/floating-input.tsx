import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

function FloatingInput({ label, error, className, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  // Initialize hasValue based on initial value
  React.useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <input
        {...props}
        className={cn(
          "w-full h-14 px-4 pt-6 pb-2 text-base bg-paper border rounded-2xl transition-colors duration-150 outline-none peer",
          error
            ? "border-danger focus:border-danger"
            : "border-line-strong focus:border-ink hover:border-ink",
          // Hide spinner arrows for number inputs
          props.type === "number" && "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder=""
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          isLabelFloating
            ? "top-2 text-xs font-medium text-ink-2"
            : "top-1/2 -translate-y-1/2 text-base text-ink-2"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="text-sm text-danger mt-1.5 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface FloatingTextareaProps extends React.ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

function FloatingTextarea({ label, error, className, ...props }: FloatingTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  // Initialize hasValue based on initial value
  React.useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <textarea
        {...props}
        className={cn(
          "w-full min-h-[120px] px-4 pt-6 pb-2 text-base bg-paper border rounded-2xl transition-colors duration-150 outline-none resize-none",
          error
            ? "border-danger focus:border-danger"
            : "border-line-strong focus:border-ink hover:border-ink",
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder=""
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          isLabelFloating
            ? "top-2 text-xs font-medium text-ink-2"
            : "top-6 text-base text-ink-2"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="text-sm text-danger mt-1.5 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export { FloatingInput, FloatingTextarea }