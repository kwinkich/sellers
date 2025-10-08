import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportTabsProps {
  forms: { role: "SELLER" | "BUYER" | "MODERATOR" }[];
  activeTab: string;
}

const roleLabel = {
  SELLER: "Продавец",
  BUYER: "Покупатель",
  MODERATOR: "Модератор",
} as const;

export const ReportTabs = ({ forms, activeTab }: ReportTabsProps) => {
  return (
    <div className="relative w-full px-4 pt-4">
      <div className="relative h-8 mb-4 flex items-center justify-center">
        {forms.map((form) => (
          <div
            key={form.role}
            className={`absolute left-1/2 -translate-x-1/2 text-center transition-opacity duration-200 ${
              form.role === activeTab ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-xl font-semibold text-gray-800">
              {roleLabel[form.role as keyof typeof roleLabel] ?? form.role}
            </span>
          </div>
        ))}
      </div>

      <TabsList className="relative grid w-1/2 bg-transparent p-0 mx-auto h-4" style={{ gridTemplateColumns: `repeat(${forms.length}, 1fr)` }}>
        {forms.map((form) => (
          <TabsTrigger
            key={form.role}
            value={form.role}
            className="relative h-2 bg-transparent p-0 data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent"
          >
            <div
              className={`h-2 w-full rounded-full transition-colors duration-500 ${
                form.role === activeTab ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
            <span className="sr-only">
              {roleLabel[form.role as keyof typeof roleLabel] ?? form.role}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};


