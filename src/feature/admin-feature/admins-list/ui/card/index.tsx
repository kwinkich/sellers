import { adminsMutationOptions, type Admin } from "@/entities";
import { CreateAdminIcon, ConfirmationDialog } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";

export const AdminCard: FC<{ data: Admin }> = ({ data }) => {
  const queryClient = useQueryClient();
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const { mutate: blockAdmin, isPending: isBlocking } = useMutation({
    ...adminsMutationOptions.block(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setShowBlockDialog(false);
    },
    onError: (error) => {
      console.error("Ошибка при удалении администратора:", error);
    },
  });

  const handleBlockClick = () => {
    setShowBlockDialog(true);
  };

  const handleConfirmBlock = () => {
    blockAdmin(data.id);
  };

  return (
    <>
      <div className="flex items-center p-3 bg-base-bg rounded-2xl gap-3">
        <CreateAdminIcon size={36} fill="#06935F" />

        <div className="flex flex-col flex-1 items-start gap-1">
          <p className="text-lg font-medium text-white leading-[100%]">
            {data.displayName}
          </p>
          <p className="text-xs text-base-gray leading-[100%] ">
            {data.telegramUsername}
          </p>
        </div>

        <div
          onClick={handleBlockClick}
          className="cursor-pointer hover:opacity-70 transition-opacity"
        >
          <XIcon size={20} color="#FFF" fill="#FFF" />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleConfirmBlock}
        title="Удалить администратора"
        description={`Вы уверены, что хотите удалить администратора${
          data.displayName ? ` ${data.displayName}` : ""
        }? После удаления он не сможет войти в систему.`}
        confirmText="Удалить"
        isLoading={isBlocking}
        userName={data.displayName}
        showCancelButton={false}
        severity="destructive"
      />
    </>
  );
};
