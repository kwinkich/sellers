import { ViewCaseForm } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

export const AdminViewCasePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Telegram back button handler
  useEffect(() => {
    const onTelegramBack = () => {
      navigate("/admin/content/cases");
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
    navigate("/admin/content/cases");
  };

  return (
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        data-scroll-container
      >
        <div className="flex flex-col gap-6 px-2 pt-4 pb-[calc(96px+env(safe-area-inset-bottom))] min-h-full">
          <HeaderWithClose
            title="Просмотр кейса"
            description="Просмотрите данные кейса"
            onClose={handleClose}
          />

          <ViewCaseForm caseId={id ? parseInt(id) : undefined} />
        </div>
      </div>
    </div>
  );
};
