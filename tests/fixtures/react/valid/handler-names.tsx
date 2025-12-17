import type { ReactNode } from 'react';

interface ChildProps {
  onClick: () => void;
  onSubmit: () => void;
}

const ChildComponent = ({ onClick, onSubmit }: ChildProps) => {
  return (
    <button type="button" onClick={onClick} onMouseDown={onSubmit}>
      Click me
    </button>
  );
};

interface ParentProps {
  children?: ReactNode;
  onChange: () => void;
  onSelect: (id: string) => void;
}

/**
 * Valid: Props prefixed with "on" can be passed directly to child components
 * without needing to be wrapped in a "handle" prefixed function.
 */
const ParentComponent = ({ onChange, onSelect }: ParentProps) => {
  // Valid: local handler with "handle" prefix
  const handleClick = () => {
    onChange();
  };

  // Valid: local handler with "handle" prefix
  const handleItemSelect = () => {
    onSelect('123');
  };

  return (
    <div>
      {/* Valid: passing "on" prefixed prop directly to child */}
      <ChildComponent onClick={onChange} onSubmit={handleClick} />

      {/* Valid: using "handle" prefixed local handler */}
      <button type="button" onClick={handleClick}>
        Click
      </button>

      <button type="button" onClick={handleItemSelect}>
        Select
      </button>
    </div>
  );
};

export { ChildComponent, ParentComponent };
