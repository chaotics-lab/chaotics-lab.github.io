import { ELEMENTS } from '@/config/elements';
import { IconTile } from './IconTile';

// Slanted black band with the elements scrolling past (P5-style ticker).
// The list is rendered twice so the -50% loop is seamless.
export const ElementMarquee = () => (
  <div className="relative -rotate-2 my-6 md:my-10 -mx-4 bg-[#121212] border-y-[3px] border-[#121212] overflow-hidden" aria-hidden="true">
    <div className="h-marquee py-3 md:py-4">
      {[0, 1].map(copy => (
        <div key={copy} className="flex shrink-0">
          {[...ELEMENTS, ...ELEMENTS].map((e, i) => (
            <span key={`${copy}-${i}`} className="flex items-center gap-3 px-6 md:px-8">
              <IconTile id={e.id} shadow="0px" className="w-10 md:w-12" />
              <span className="h-display not-italic text-3xl md:text-5xl text-[#F5E8D6]">{e.name}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
