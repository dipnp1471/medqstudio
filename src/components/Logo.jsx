export default function Logo({ size = 48, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-svg ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* White Q Body with Inner Cutout */}
      <path 
        d="M100,23 C65.8,23 38,50.8 38,85 C38,119.2 65.8,147 100,147 C113,147 125.5,143 135.5,135.5 C145.5,144.5 158,149 171.5,144 C162,135.5 156.5,123.5 154,115.5 C159,106.5 162,96 162,85 C162,50.8 134.2,23 100,23 Z M100,123 C79,123 62,106 62,85 C62,64 79,47 100,47 C121,47 138,64 138,85 C138,106 121,123 100,123 Z" 
        fill="white" 
        fillRule="evenodd"
      />
      
      {/* Blue Aperture Shutter Blades inside the Q */}
      <g>
        {/* Base blue circle that fills the inner cutout */}
        <circle cx="100" cy="85" r="37.5" fill="#0ea5e9" />
        
        {/* Shutter blade seam lines in dark background color (#0f1115) to match the dark theme */}
        {/* Outer vertices on r=37.5 at (100, 85):
            0°: (137.5, 85)
            60°: (118.8, 117.5)
            120°: (81.3, 117.5)
            180°: (62.5, 85)
            240°: (81.3, 52.5)
            300°: (118.8, 52.5)
            
            Inner hexagon vertices at r=13.5 at (100, 85):
            0°: (113.5, 85)
            60°: (106.8, 96.7)
            120°: (93.3, 96.7)
            180°: (86.5, 85)
            240°: (93.3, 73.3)
            300°: (106.8, 73.3)
        */}
        
        {/* Blade edge separator lines */}
        <line x1="137.5" y1="85" x2="106.8" y2="96.7" stroke="#0f1115" strokeWidth="2.5" />
        <line x1="118.8" y1="117.5" x2="93.3" y2="96.7" stroke="#0f1115" strokeWidth="2.5" />
        <line x1="81.3" y1="117.5" x2="86.5" y2="85" stroke="#0f1115" strokeWidth="2.5" />
        <line x1="62.5" y1="85" x2="93.3" y2="73.3" stroke="#0f1115" strokeWidth="2.5" />
        <line x1="81.3" y1="52.5" x2="106.8" y2="73.3" stroke="#0f1115" strokeWidth="2.5" />
        <line x1="118.8" y1="52.5" x2="113.5" y2="85" stroke="#0f1115" strokeWidth="2.5" />

        {/* Central Hexagonal aperture cutout */}
        <polygon 
          points="113.5,85 106.8,96.7 93.3,96.7 86.5,85 93.3,73.3 106.8,73.3" 
          fill="#0f1115" 
        />
      </g>
    </svg>
  );
}
