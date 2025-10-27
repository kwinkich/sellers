import { ViewScenarioForm } from "@/feature";
import {
  HeadText,
  useEdgeSwipeGuard,
  useTelegramVerticalSwipes,
} from "@/shared";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useQuery } from "@tanstack/react-query";
import { scenariosQueryOptions } from "@/entities";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { X } from "lucide-react";

export const AdminViewScenarioPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guardRef = useEdgeSwipeGuard();

  // Disable Telegram vertical swipes to prevent accidental app close during viewing
  useTelegramVerticalSwipes(true);

  // Fetch scenario data
  const { data: scenarioData } = useQuery({
    ...scenariosQueryOptions.byId(id ? parseInt(id) : 0, true), // includeForms = true
    enabled: !!id,
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
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4 shrink-0">
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
      <div
        ref={guardRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
      >
        <div className="flex flex-col gap-6 px-2 pb-[96px] min-h-full">
          <ViewScenarioForm scenarioId={id ? parseInt(id) : undefined} />
        </div>
      </div>
    </div>
  );
};
