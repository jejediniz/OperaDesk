export default function Container({ children, className = "", id = "main-content" }) {
  return (
    <main id={id} className={`container ${className}`.trim()}>
      {children}
    </main>
  );
}
