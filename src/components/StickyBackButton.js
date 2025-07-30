
import React from "react";

const StickyBackButton = ({ onClick, label, style }) => {
  return (
    <button
      className="sticky-back-btn"
      style={{
        position: 'fixed',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        background: '#ff3b3b',
        color: '#fff',
        border: 'none',
        borderRadius: '30px 0 0 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '7px 13px', // 60% von vorher
        fontSize: '0.72em', // 60% von vorher
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.2s',
        ...style
      }}
      onClick={onClick}
    >
      {label || 'Zurück'}
    </button>
  );
};

export default StickyBackButton;
