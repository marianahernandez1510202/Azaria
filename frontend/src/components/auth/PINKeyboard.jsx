import React from 'react';
import './PINKeyboard.css';

const PINKeyboard = ({ value = '', onChange, maxLength = 6 }) => {
  const handleNumberClick = (num) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="pin-keyboard">
      <div className="pin-display">
        {[...Array(maxLength)].map((_, index) => (
          <div key={index} className="pin-dot">
            {value[index] ? '●' : '○'}
          </div>
        ))}
      </div>

      <div className="keyboard-grid">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            className="keyboard-button"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className="keyboard-button keyboard-button-action"
          onClick={handleClear}
        >
          Borrar Todo
        </button>
        <button
          type="button"
          className="keyboard-button keyboard-button-action"
          onClick={handleDelete}
        >
          ← Borrar
        </button>
      </div>
    </div>
  );
};

export default PINKeyboard;
