export default function PageHeader({
  title,
  subtitle,
  centered = false,
  actions = null,
}) {
  return (
    <div className={`page-header${centered ? " page-header--centered" : ""}`}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
