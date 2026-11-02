
import {
  IconActivity,
  IconBoxMultiple,
  IconCash,
  IconHistory,
  IconLayoutDashboard,
} from "@tabler/icons-react";

export const SECTIONS = [
  "Dashboard",
  "Supply",
  "Borrow",
  "Risk Sim",
  "History",
] as const;

export type Section = (typeof SECTIONS)[number];

const ICONS = {
  Dashboard: IconLayoutDashboard,
  Supply: IconBoxMultiple,
  Borrow: IconCash,
  "Risk Sim": IconActivity,
  History: IconHistory,
} as const;

type SidebarProps = {
  active: Section;
  onSelect: (section: Section) => void;
};

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="w-full shrink-0 border-b border-zinc-200 bg-[#1f1f1f] shadow-sm md:w-68 md:self-stretch md:border-b-0 md:border-r">
      <nav
        aria-label="Main"
        className="flex gap-1 overflow-x-auto p-2 py-3 md:flex-col md:space-y-1 md:overflow-visible md:py-8"
      >
        {SECTIONS.map((section) => {
          const Icon = ICONS[section];
          const isActive = section === active;

          return (
            <button
              key={section}
              type="button"
              onClick={() => onSelect(section)}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 px-3 py-2 text-lg transition-colors md:w-full ${
                isActive
                  ? "bg-white font-medium text-blue-600 shadow-sm ring-1 ring-zinc-200"
                  : "text-[#e6e6e6] hover:bg-zinc-100 hover:text-blue-600"
              }`}
            >
              <Icon className="w-5 h-5" stroke={1.5} />
              {section}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
