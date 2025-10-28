import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { adminsMutationOptions } from "@/entities";
import { AdminsList } from "@/feature/admin-feature/admins-list/ui/list";
import { HeaderWithClose } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminsControlPage = () => {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createAdmin, isPending } = useMutation({
    ...adminsMutationOptions.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setUsername("");
    },
    onError: (error) => {
      console.error("Ошибка при добавлении админа:", error);
    },
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
      <HeaderWithClose
        title="Добавление администратора"
        description="Назначайте ответственных за управление и контроль"
        onClose={() => navigate("/admin/home")}
        variant="dark"
      />

      <div className="bg-base-bg flex text-white flex-col w-full rounded-2xl p-4 mb-6">
        <div className="flex flex-col gap-3">
          <InputFloatingLabel
            placeholder="Введите @username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            variant="second"
            disabled={isPending}
          />

          <Button
            type="submit"
            className="w-full"
            text="white"
            disabled={isPending}
            onClick={() =>
              createAdmin({
                telegramUsername: username,
              })
            }
            size="xs"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Добавление...
              </>
            ) : (
              "Добавить"
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <AdminsList />
      </div>
    </div>
  );
};
