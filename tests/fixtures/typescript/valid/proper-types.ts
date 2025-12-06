interface User {
  name: string;
  email: string;
}

const getUser = (): User => {
  return { name: 'John', email: 'john@example.com' };
};

export { getUser };
export type { User };
