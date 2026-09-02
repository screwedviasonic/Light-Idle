import { useEffect } from 'react';
import { useStore } from '../state/store';

export function TitleCard() {
  const { ui, dispatch } = useStore();
  useEffect(() => {
    if (!ui.titleCard) return;
    const id = window.setTimeout(() => dispatch({ type: 'clearTitle' }), 1000);
    return () => window.clearTimeout(id);
  }, [ui.titleCard, dispatch]);
  if (!ui.titleCard) return null;
  return (
    <div className="title-card" key={`${ui.titleCard.title}-${ui.titleCard.sub}`}>
      <div className="title-card-kicker">Transmat</div>
      <div className="title-card-title">{ui.titleCard.title}</div>
      <div className="title-card-rule" />
      <div className="title-card-sub">{ui.titleCard.sub}</div>
    </div>
  );
}
