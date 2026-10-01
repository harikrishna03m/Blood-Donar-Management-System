import React from 'react';

const BloodGroupBadge = ({ bloodGroup = 'O+', size = 'md', solid = false, className = '' }) => {
  const sizeClasses = {
    sm: 'blood-badge-sm',
    md: 'blood-badge-md',
    lg: 'blood-badge-lg',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const solidClass = solid ? 'blood-badge-solid' : '';

  return (
    <div
      className={`blood-badge ${selectedSize} ${solidClass} ${className}`}
      title={`Blood Group ${bloodGroup}`}
    >
      <span>{bloodGroup}</span>
    </div>
  );
};

export default BloodGroupBadge;
