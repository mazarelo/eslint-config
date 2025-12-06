import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
}

const Button = ({ children, isDisabled = false, onClick }: ButtonProps) => {
  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button disabled={isDisabled} type="button" onClick={handleClick}>
      {children}
    </button>
  );
};

export default Button;
