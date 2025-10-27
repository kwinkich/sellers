import { clientsQueryOptions, clientsMutationOptions } from "@/entities";
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { handleFormSuccess, handleFormError, ERROR_MESSAGES } from "@/shared";
import { LicenseCard } from "./ui";

export const AdminLicencesList = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    licenseId: number | null;
    licenseStatus: string | null;
    mopName: string | null;
  }>({
    isOpen: false,
    licenseId: null,
    licenseStatus: null,
    mopName: null,
  });

  const { data, isLoading, error } = useQuery(
    clientsQueryOptions.licenses(parseInt(id!))
  );

  const { mutate: removeSingleLicense, isPending: isRemovingSingle } =
    useMutation({
      ...clientsMutationOptions.removeLicenses(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({
          queryKey: ["clients", "licenses", parseInt(id!)],
        });

        handleFormSuccess("Лицензия удалена");
        setConfirmationDialog({
          isOpen: false,
          licenseId: null,
          licenseStatus: null,
          mopName: null,
        });
      },
      onError: (error) => {
        console.error("Ошибка при удалении лицензии:", error);
        handleFormError(error, ERROR_MESSAGES.DELETE);
      },
    });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-base-gray">Загрузка лицензий...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-destructive">
        {error?.message || "Ошибка загрузки лицензий"}
      </div>
    );
  }

  const licenses = data.data;

  const handleRemoveSingleLicense = (licenseId: number) => {
    if (!id) return;

    const license = licenses.find((l) => l.id === licenseId);
    if (!license) return;

    // For active licenses, show confirmation dialog
    if (license.status === "ACTIVE") {
      const mopName = license.assignedUser
        ? license.assignedUser.displayName ||
          license.assignedUser.telegramUsername ||
          "Неизвестно"
        : null;

      setConfirmationDialog({
        isOpen: true,
        licenseId,
        licenseStatus: license.status,
        mopName,
      });
    } else {
      // For inactive/expired licenses, remove directly
      removeSingleLicense({
        id: parseInt(id),
        licenseIds: [licenseId],
      });
    }
  };

  const handleConfirmRemoval = () => {
    if (!confirmationDialog.licenseId || !id) return;

    removeSingleLicense({
      id: parseInt(id),
      licenseIds: [confirmationDialog.licenseId],
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialog({
      isOpen: false,
      licenseId: null,
      licenseStatus: null,
      mopName: null,
    });
  };

  if (licenses.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-base-gray">
        Нет лицензий для этого клиента
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {licenses.map((license) => (
          <LicenseCard
            key={license.id}
            data={license}
            onRemove={handleRemoveSingleLicense}
            isRemoving={isRemovingSingle}
          />
        ))}
      </div>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmRemoval}
        title="Удаление активной лицензии"
        description={
          confirmationDialog.mopName
            ? `Удаление активной лицензии приведет к потере доступа МОПа ${confirmationDialog.mopName} к приложению. Вы уверены, что хотите продолжить?`
            : "Удаление активной лицензии приведет к потере доступа назначенного МОПа к приложению. Вы уверены, что хотите продолжить?"
        }
        userName={confirmationDialog.mopName ?? undefined}
        confirmText="Удалить"
        isLoading={isRemovingSingle}
        showCancelButton={false}
        severity="destructive"
      />
    </>
  );
};
