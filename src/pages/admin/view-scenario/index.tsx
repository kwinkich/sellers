import { ViewScenarioForm } from "@/feature";
import { HeadText } from "@/shared";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useQuery } from "@tanstack/react-query";
import { scenariosQueryOptions } from "@/entities";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { X } from "lucide-react";

export const AdminViewScenarioPage = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();

  // Fetch scenario data
  const { data: scenarioData } = useQuery({
    ...scenariosQueryOptions.byId(scenarioId ? parseInt(scenarioId) : 0, true), // includeForms = true
    enabled: !!scenarioId,
  });

  // Telegram back button handler
  useEffect(() => {
    const onTelegramBack = () => {
      navigate("/admin/content/scenarios");
    };

    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onTelegramBack);
      WebApp.BackButton.show(); // Ensure back button is visible

      return () => {
        try {
          WebApp.BackButton.offClick(onTelegramBack);
        } catch {}
      };
    }
  }, [navigate]);

  const handleClose = () => {
    navigate("/admin/content/scenarios");
  };

  return (
    <div className="w-dvw h-dvh bg-white flex flex-col">
      <div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <HeadText
            head="Просмотр сценария"
            label="Просмотрите данные сценария"
          />
          <button
            onClick={handleClose}
            className="
							p-2 rounded-full hover:bg-white/10 transition-colors
							flex items-center justify-center
						"
            title="Закрыть"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        {scenarioData?.data && (
          <InputFloatingLabel
            variant="dark"
            className="bg-second-bg disabled:opacity-100"
            placeholder="Название сценария"
            value={scenarioData.data.title}
            disabled={true}
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-2 pb-24 min-h-full">
          <ViewScenarioForm
            scenarioId={scenarioId ? parseInt(scenarioId) : undefined}
          />
        </div>
      </div>
    </div>
  );
};
