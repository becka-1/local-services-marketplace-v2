import React, { useId } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();
  const maskId = useId();

  return (
    <StyledButton 
      className={`${className} st-sunMoonThemeToggleBtn ${isDark ? 'is-dark' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <svg width={28} height={28} viewBox="0 0 20 20" fill="currentColor" stroke="none">
        <mask id={maskId}>
          <rect x={0} y={0} width={20} height={20} fill="white" />
          <circle cx={11} cy={3} r={8} fill="black" />
        </mask>
        <circle className="sunMoon" cx={10} cy={10} r={8} mask={`url(#${maskId})`} />
        <g>
          <circle className="sunRay sunRay1" cx={18} cy={10} r="1.5" />
          <circle className="sunRay sunRay2" cx={14} cy="16.928" r="1.5" />
          <circle className="sunRay sunRay3" cx={6} cy="16.928" r="1.5" />
          <circle className="sunRay sunRay4" cx={2} cy={10} r="1.5" />
          <circle className="sunRay sunRay5" cx={6} cy="3.1718" r="1.5" />
          <circle className="sunRay sunRay6" cx={14} cy="3.1718" r="1.5" />
        </g>
      </svg>
    </StyledButton>
  );
}

const StyledButton = styled.button`
  /* The class navbar-theme-toggle will bring width, height, border, background, etc. */
  
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
    transition: transform 0.4s ease;
    transform: rotate(40deg);
  }

  svg .sunMoon {
    transform-origin: center center;
    transition: inherit;
    transform: scale(1);
  }

  svg .sunRay {
    transform-origin: center center;
    transform: scale(0);
  }

  svg mask > circle {
    transition: transform 0.64s cubic-bezier(0.41, 0.64, 0.32, 1.575);
    transform: translate(0px, 0px);
  }

  svg .sunRay2 {
    animation-delay: 0.05s !important;
  }
  svg .sunRay3 {
    animation-delay: 0.1s !important;
  }
  svg .sunRay4 {
    animation-delay: 0.17s !important;
  }
  svg .sunRay5 {
    animation-delay: 0.25s !important;
  }
  svg .sunRay6 {
    animation-delay: 0.29s !important;
  }

  /* Dark mode active states */
  &.is-dark svg {
    transform: rotate(90deg);
  }
  &.is-dark svg mask > circle {
    transform: translate(16px, -3px);
  }
  &.is-dark svg .sunMoon {
    transform: scale(0.55);
  }
  &.is-dark svg .sunRay {
    animation: showRay1832 0.4s ease 0s 1 forwards;
  }

  @keyframes showRay1832 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default ThemeToggle;
