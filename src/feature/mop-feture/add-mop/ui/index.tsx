import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  clientsQueryOptions,
  mopProfilesMutationOptions,
  type CreateMopProfileRequest,
} from "@/entities";
import { AddPeopleIcon } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddMopDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMopDrawer = ({ open, onOpenChange }: AddMopDrawerProps) => {
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
      toast.error("Ошибка");
      return;
    }

    const availableLicenses =
      clientProfile.data.totalLicenses - clientProfile.data.activeLicenses;
    if (availableLicenses <= 0) {
      toast.error("Нет доступных лицензий");
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-second-bg">
        <DrawerHeader className="items-center">
          <DrawerTitle className="sr-only">Добавление МОПа</DrawerTitle>
          <AddPeopleIcon size={70} fill="#06935F" />
          <p className="text-2xl font-medium text-white">Добавление МОПа</p>
        </DrawerHeader>

        <div className="flex flex-col gap-3 p-4">
          <Input
            placeholder="Введите имя МОПа"
            variant="dark"
            value={mopName}
            onChange={(e) => setMopName(e.target.value)}
            disabled={isPending}
          />
          <Input
            placeholder="Введите @username для МОПа"
            variant="dark"
            value={mopUsername}
            onChange={(e) => setMopUsername(e.target.value)}
            disabled={isPending}
          />
        </div>

        <DrawerFooter className="flex-col gap-2">
          <Button
            onClick={handleAddMop}
            disabled={!isFormValid || isPending || availableLicenses <= 0}
            className="w-full"
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
            className="text-white/70 hover:text-white"
          >
            Отменить
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
