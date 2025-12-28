import React from "react";

type BadgeType = "role" | "status" | "lang";

interface BadgeProps {
  type: BadgeType;
  value: string;
}

const normalize = (v: string) => v.toLowerCase().trim();

const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const cls = `ui-badge ${type}-${normalize(value)}`;

  return <span className={cls}>{value}</span>;
};

export default Badge;
