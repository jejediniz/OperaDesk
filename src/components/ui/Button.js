import React, { forwardRef } from "react";

const Button = forwardRef(function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}, ref) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  return (
    <button
      ref={ref}
      type={type}
      {...props}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
});

export default Button;
