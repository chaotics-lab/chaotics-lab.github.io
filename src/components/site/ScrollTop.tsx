import { useEffect, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { usePageTransition } from '@/lib/pageTransition';

// Back-to-top pill, bottom right, styled like the header links. It shows
// up once the page has been scrolled a little. Going up, the sea pours in
// from the top.
export const ScrollTop = () => {
  const { dive } = usePageTransition();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const check = () => setShown(window.scrollY > 120);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <div className="s-top s-nav select-none" data-shown={shown}>
      <button
        type="button"
        className="s-nav-item s-top-item"
        onClick={() => dive(() => window.scrollTo(0, 0), { dir: 'down' })}
        tabIndex={shown ? 0 : -1}
        aria-label="Back to top"
      >
        <ArrowUp size={18} weight="bold" className="s-icon" />
      </button>
    </div>
  );
};
