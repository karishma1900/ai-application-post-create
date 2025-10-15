import React from 'react';
import './Credit.css';

const Credit = ({ total, used }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = used && total ? circumference * (1 - used / total) : 0;
  const remaining = total && used ? total - used : 0;

  return (
    <div className="credit-card">
      <h3>Credits</h3>
      <div className="credit-circle">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="background-ring"
            stroke="#2e2e40"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className="progress-ring-circle"
            stroke="#8b5cf6"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="credit-text">
          {remaining > 0 ? remaining : 0}
        </div>
      </div>

      {remaining === 0 && <p className="no-credits">No credits left!</p>}

      <div className="credit-legend">
        <div className="legend-item">
          <span className="dot used"></span>
          <span>Used ({used})</span>
        </div>
        <div className="legend-item">
          <span className="dot left"></span>
          <span>Left ({remaining})</span>
        </div>
      </div>
    </div>
  );
};

export default Credit;
