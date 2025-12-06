const items = ['apple', 'banana', 'cherry'];

const FruitList = () => (
  <ul>
    {items.map((item) => (
      <li key={item}>
        {item}
      </li>
    ))}
  </ul>
);

export default FruitList;
