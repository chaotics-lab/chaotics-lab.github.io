import { Link, type LinkProps } from 'react-router-dom';
import { usePageTransition, type TransitionOpts } from '@/lib/pageTransition';

// A Link that plays the page transition (sea unless `transition` says). Modified clicks (new tab etc.)
// behave like a normal link.
export const TransitionLink = ({ to, onClick, transition, ...rest }: Omit<LinkProps, 'to'> & { to: string; transition?: TransitionOpts }) => {
  const { go } = usePageTransition();
  return (
    <Link
      to={to}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(to, transition);
      }}
    />
  );
};
