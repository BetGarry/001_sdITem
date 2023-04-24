import React from "react";

interface SliderProps {
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ name, min, max, step, value, onChange }) => {
  return (
    <div>
      <label>{name}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{value.toFixed(2)}</span>
    </div>
  );
};

export default Slider;
