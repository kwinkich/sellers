import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  clientsQueryOptions,
  mopProfilesMutationOptions,
  type CreateMopProfileRequest,
} from "@/entities";
import { AddPeopleIcon } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { handleFormError } from "@/shared";

interface AddMopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMopDialog = ({ open, onOpenChange }: AddMopDialogProps) => {
  const [mopName, setMopName] = useState("");
  const [mopUsername, setMopUsername] = useState("");
  const queryClient = useQueryClient();

  const { data: clientProfile } = useQuery(clientsQueryOptions.profile());

  const { mutate: createMop, isPending } = useMutation({
    ...mopProfilesMutationOptions.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["clients", "mop-profiles"] });
      setMopName("");
      setMopUsername("");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Ошибка при добавлении МОПа:", error);
    },
  });

  const handleAddMop = () => {
    if (!clientProfile?.data) {
      handleFormError("Ошибка", "Профиль клиента не найден");
      return;
    }

    const availableLicenses =
      clientProfile.data.totalLicenses - clientProfile.data.activeLicenses;
    if (availableLicenses <= 0) {
      handleFormError(
        "Нет доступных лицензий",
        "Все лицензии уже используются"
      );
      return;
    }

    const mopData: CreateMopProfileRequest = {
      name: mopName.trim(),
      telegramUsername: mopUsername.trim().startsWith("@")
        ? mopUsername.trim()
        : `@${mopUsername.trim()}`,
      repScore: 0,
      level: "LEVEL_3",
      currentSlotId: 0,
    };

    createMop(mopData);
  };

  const handleCancel = () => {
    if (!isPending) {
      setMopName("");
      setMopUsername("");
      onOpenChange(false);
    }
  };

  const isFormValid =
    mopName.trim().length > 0 && mopUsername.trim().length > 0;

  const availableLicenses = clientProfile?.data
    ? clientProfile.data.totalLicenses - clientProfile.data.activeLicenses
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* overlay without animations */}
      <DialogOverlay
        className="
          fixed inset-0 bg-black/50
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
        "
      />

      {/* container without animations, center via translate */}
      <DialogContent
        className="
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[min(100svw-32px,400px)] max-w-none
          p-0 rounded-3xl
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
          overflow-hidden
          bg-second-bg
          border-2 border-black
        "
      >
        {/* panel: flex-column, footer sticky at bottom; auto-height by content */}
        <div className="flex flex-col min-h-0 max-h-[90svh] relative">
          {/* Close button */}
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="
              absolute top-4 right-4 z-10
              w-8 h-8
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* header + body: scrolls when overflowing */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-3 min-h-0">
            <DialogHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <AddPeopleIcon size={70} fill="#06935F" />
              </div>
              <DialogTitle className="text-2xl font-medium text-white">
                Добавление МОПа
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300 leading-relaxed">
                Заполните данные для создания нового профиля МОПа
              </DialogDescription>
            </DialogHeader>

            {/* Form inputs */}
            <div className="flex flex-col gap-4 mt-6">
              <Input
                placeholder="Введите имя МОПа"
                variant="dark"
                value={mopName}
                onChange={(e) => setMopName(e.target.value)}
                disabled={isPending}
                className="text-base" // >=16px: disables iOS zoom
                autoCapitalize="words"
              />
              <Input
                placeholder="Введите @username для МОПа"
                variant="dark"
                value={mopUsername}
                onChange={(e) => setMopUsername(e.target.value)}
                disabled={isPending}
                className="text-base" // >=16px: disables iOS zoom
                autoCapitalize="none"
                inputMode="text"
              />
            </div>
          </div>

          {/* footer: sticky bottom of panel + background/border for readability */}
          <DialogFooter
            className="
              sticky bottom-0
              flex-col gap-3
              px-6 py-4
              bg-second-bg/90
              backdrop-blur supports-[backdrop-filter]:bg-second-bg/60
            "
          >
            <Button
              onClick={handleAddMop}
              disabled={!isFormValid || isPending || availableLicenses <= 0}
              className=" h-12 bg-base-main hover:bg-base-main/80 focus-visible:ring-base-main text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление...
                </>
              ) : availableLicenses <= 0 ? (
                "Нет доступных лицензий"
              ) : (
                "Добавить МОПа"
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="link"
              disabled={isPending}
              className="text-white/70 hover:text-white h-12"
            >
              Отменить
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
