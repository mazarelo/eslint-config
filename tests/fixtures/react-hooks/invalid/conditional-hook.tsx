// @errors: react-hooks/rules-of-hooks
import { useState } from 'react';

interface Props {
  shouldUseState: boolean;
}

const BadComponent = ({ shouldUseState }: Props) => {
  if (shouldUseState) {
    const [count, setCount] = useState(0);
    return (
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        {count}
      </button>
    );
  }
  return <div>No state</div>;
};

export default BadComponent;
