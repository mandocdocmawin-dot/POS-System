import { useTranslation } from '../../i18n/useTranslation';
import { T } from "../../i18n/T";
import { useEffect, useState } from 'react';
import { Users, Store, ShoppingCart, ArrowUpFromLine, ArrowDownToLine, Pause, Play } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { dashboardService } from '../../services/dashboardService';
export function SummaryRow() {
  const { can } = usePermission();
  return <div className="dashboard-stats">{dashboardService.getStats().filter(s => s.title !== 'Net Profit' || can('reports:finance')).map((s, i) => {
    const Icon = s.icon;
    return <section className="dashboard-panel dashboard-stat" key={s.title}><div><p><T>{s.title}</T></p><h2>{s.value}</h2></div><span className={`dashboard-stat-icon stat-color-${i}`}><Icon size={21}/></span><p className="dashboard-stat-change"><span className={s.up ? 'dashboard-positive' : 'dashboard-negative'}>{s.up ? <ArrowUpFromLine size={12}/> : <ArrowDownToLine size={12}/>} <T>{s.trend}</T></span><T text={" From Last Week"}/></p></section>;
  })}</div>;
}
export function SummaryCarousel() {
  const { t } = useTranslation();
  const { can } = usePermission();
  const slides = dashboardService.getSummarySlides().filter(s => s.kind !== 'suppliers' || can('suppliers:view'));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (paused || hovered) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, slides.length]);
  const current = index % slides.length, slide = slides[current];
  const Icon = slide.kind === 'suppliers' ? Store : slide.kind === 'customers' ? Users : ShoppingCart;
  return <section className="dashboard-panel dashboard-summary" aria-label="Business summary" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false); }}>
    <div key={slide.kind} className="dashboard-summary-slide" role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${slides.length}`}><div className="dashboard-summary-title"><span className="dashboard-summary-icon"><Icon size={21}/></span><div><h2><T>{slide.title}</T></h2><p><strong>{slide.total}</strong><span className="dashboard-positive"><T>{slide.trend}</T></span></p></div></div><div className="dashboard-summary-details">{slide.mini.map(item => <div key={item.label}><p><T>{item.label}</T></p><strong>{item.value}</strong></div>)}</div></div>
    <div className="dashboard-carousel-controls"><div className="dashboard-carousel-dots">{slides.map((s, i) => <button key={s.kind} aria-label={t('Show {title}',{title:t(s.title)})} aria-pressed={current === i} onClick={() => setIndex(i)}><span className={current === i ? 'is-active' : ''}/></button>)}</div><button className="dashboard-carousel-pause" aria-label={t(paused ? 'Play summary rotation' : 'Pause summary rotation')} onClick={() => setPaused(p => !p)}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button></div>
  </section>;
}
