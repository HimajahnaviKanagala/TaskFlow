import { format, isAfter, parseISO } from "date-fns";

export const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return format(parseISO(dateStr), "MMM dd, yyyy");
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return isAfter(new Date(), parseISO(dateStr));
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
