import React from 'react';

export const ShaderSVG = () => {
  return (
    <div className="flex justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 691 271"
        className="text-5xl md:text-7xl h-auto"
      >
        {/* Original text */}
        <text
          x="83.93"
          y="180.63"
          fontSize="120"
          fontFamily="KotoriRose-Bold, Kotori Rose"
          fontWeight="700"
          letterSpacing="-0.03em"
          fill="white"
        >
          Chaotics
        </text>

        {/* Circle that replaces the 'o' */}
        <path
          d="M387,145.75a27,27,0,1,1-27-27A27,27,0,0,1,387,145.75Z"
          fill="white"
          transform="translate(-1 1)"
        />
      </svg>
    </div>
  );
};
