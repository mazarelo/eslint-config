// @errors: react/jsx-no-leaked-render
interface Props {
  count: number;
}

const Counter = ({ count }: Props) => (
  <div>
    {count && <span>Has items</span>}
  </div>
);

export default Counter;
