import { useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  isHighlighted?: boolean;
  onSelect: (userId: string) => void;
}

const UserCard = ({ user, isHighlighted = false, onSelect }: UserCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((previous) => !previous);
  }, []);

  const handleSelectClick = useCallback(() => {
    onSelect(user.id);
  }, [onSelect, user.id]);

  return (
    <article className={isHighlighted ? "highlighted" : ""}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {isExpanded ? (
        <div>
          <p>Additional info</p>
        </div>
      ) : null}
      <button type="button" onClick={handleToggleExpand}>
        {isExpanded ? "Show Less" : "Show More"}
      </button>
      <button type="button" onClick={handleSelectClick}>
        Select User
      </button>
    </article>
  );
};

export default UserCard;
