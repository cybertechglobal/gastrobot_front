export const getUrgencyIndicator = (createdAt: string) => {
  const minutesAgo = Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / 60000
  );
  if (minutesAgo > 10) {
    return (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
    );
  }
  return null;
};
