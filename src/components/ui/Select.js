import React, { useId } from "react";

export default function Select({
  label,
  helperText,
  error,
  children,
  className = "",
  hideLabel = false,
  id: providedId,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || props.name || `select-${generatedId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label className={`field ${className}`}>
      {label && (
        <span className={`field-label${hideLabel ? " sr-only" : ""}`}>{label}</span>
      )}
      <select
        id={id}
        className="select-field"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
      {helperText && (
        <span id={helperId} className="field-helper">
          {helperText}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}
