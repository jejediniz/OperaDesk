"use client";

import { Card } from "@/components/ui";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

function MetricCard({ card, onSelect }) {
  const animatedValue = useAnimatedNumber(card.value);

  return (
    <Card
      className={`metric-card metric-card--${card.variant} metric-card--clickable`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(card.key)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(card.key);
        }
      }}
    >
      <span className="metric-card__accent" aria-hidden="true" />
      <div className="metric-card__header">
        <span className="metric-card__icon">{card.icon}</span>
        <div className="metric-card__heading">
          <span className="metric-card__label">{card.label}</span>
          <span className="metric-card__hint">{card.cta}</span>
        </div>
      </div>
      <strong className="metric-card__value">{animatedValue}</strong>
      <p className="metric-card__body">{card.sublabel}</p>
      <div className="metric-card__footer">
        <span>Detalhar indicadores</span>
        <span aria-hidden="true">→</span>
      </div>
    </Card>
  );
}

export default function MetricsGrid({ cards, onSelect }) {
  return (
    <section className="dashboard-grid">
      {cards.map((card) => (
        <MetricCard key={card.key} card={card} onSelect={onSelect} />
      ))}
    </section>
  );
}
