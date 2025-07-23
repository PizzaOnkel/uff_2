import * as icons from 'lucide-react';

export default function LucideIcon({ name, className }) {
  const Icon = icons[name];
  return Icon ? <Icon className={className} /> : null;
}