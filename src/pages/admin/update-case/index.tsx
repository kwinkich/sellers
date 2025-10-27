import { UpdateCaseForm } from "@/feature";
import { HeadText, ConfirmationDialog } from "@/shared";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export const AdminUpdateCasePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Telegram back button handler
  useEffect(() => {
    const onTelegramBack = () => {
      if (hasUnsavedChanges) {
        setShowCloseDialog(true);
      } else {
        navigate("/admin/content/cases");
      }
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
  }, [navigate, hasUnsavedChanges]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseDialog(true);
    } else {
      navigate("/admin/content/cases");
    }
  };

  const confirmClose = () => {
    setShowCloseDialog(false);
    navigate("/admin/content/cases");
  };

  const cancelClose = () => {
    setShowCloseDialog(false);
  };

  return (
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-col gap-6 px-2 pt-4 pb-[96px] min-h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between">
            <HeadText
              head="Изменение кейса"
              label="Редактируйте данные кейса"
              variant="black-gray"
            />
            <button
              onClick={handleClose}
              className="
								p-2 rounded-full hover:bg-gray-100 transition-colors
								flex items-center justify-center
							"
              title="Закрыть"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <UpdateCaseForm
            caseId={id ? parseInt(id) : undefined}
            onFormChange={setHasUnsavedChanges}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCloseDialog}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title="Несохраненные изменения"
        description="У вас есть несохраненные изменения. Если вы закроете страницу, все изменения будут потеряны."
        confirmText="Закрыть"
        isLoading={false}
        showCancelButton={false}
        severity="destructive"
      />
    </div>
  );
};
