// @errors: react/jsx-key
const items = ['a', 'b', 'c'];

const List = () => (
  <ul>
    {items.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
);

export default List;
