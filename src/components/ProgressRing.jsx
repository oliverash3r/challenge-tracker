export default function ProgressRing({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  showText = true,
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 100) return "#22c55e"; // green
    if (percentage >= 70) return "#eab308"; // yellow
    if (percentage >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()}50)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          showText && (
            <span className="text-2xl font-bold text-white">
              {Math.round(percentage)}%
            </span>
          )
        )}
      </div>
    </div>
  );
}
