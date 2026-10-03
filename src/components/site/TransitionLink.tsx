import { Link, type LinkProps } from 'react-router-dom';
import { usePageTransition } from '@/lib/pageTransition';

// A Link that plays the sea transition. Modified clicks (new tab etc.)
// behave like a normal link.
export const TransitionLink = ({ to, onClick, ...rest }: Omit<LinkProps, 'to'> & { to: string }) => {
  const go = usePageTransition();
  return (
    <Link
      to={to}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(to);
      }}
    />
  );
};
