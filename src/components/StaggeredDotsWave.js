// StaggeredDotsWave.js - Matches Flutter's StaggeredDotsWave loader
import React from "react";

export default function StaggeredDotsWave({ color = "#670FC5", size = 35 }) {
  const dotSize = Math.max(6, Math.floor(size / 3.5));

  return (
    <div className="staggered-dots-wave" style={{ height: size }}>
      {[0, 1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="dot"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}
