export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat-card">
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      {hint && <p className="stat-card-hint">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <span className="page-eyebrow">Báo cáo công việc</span>
        <h1>{title}</h1>
        {description && (
          <p>{description}</p>
        )}
      </div>
      {badge && <div className="page-header-badge">{badge}</div>}
    </div>
  );
}
