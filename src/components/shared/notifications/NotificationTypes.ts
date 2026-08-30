export interface NotificationFilter {
  id: string;
  label: string;
  count: number;
  hasBadge?: boolean;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface NotificationItemProps<T> {
  notification: T;
  index?: number;
  renderContent: (notification: T) => React.ReactNode;
  renderActions?: (notification: T) => React.ReactNode;
  className?: string;
  isUnread?: boolean;
}

export interface NotificationListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export interface NotificationFiltersProps {
  filters: NotificationFilter[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export interface NotificationHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: NotificationAction[];
  className?: string;
}

export interface NotificationEmptyProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface NotificationLoadingProps {
  message?: string;
  className?: string;
}

export interface NotificationErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}