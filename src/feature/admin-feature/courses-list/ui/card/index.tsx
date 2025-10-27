import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course } from "@/entities";
import { Badge, Box, ConfirmationDialog } from "@/shared";
import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesMutationOptions } from "@/entities";
import { toast } from "sonner";

export const CourseCard: FC<{ data: Course }> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    ...coursesMutationOptions.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      toast.success("Курс удалён");
      setIsConfirmOpen(false);
    },
    onError: () => {
      toast.error("Не удалось удалить курс");
    },
  });

  const getAccessScopeLabel = (scope: "ALL" | "CLIENTS_LIST") => {
    return scope === "ALL" ? "Доступ всем" : "Выборочный доступ";
  };

  return (
    <Box variant="dark" className="gap-3 p-4" justify="start" align="start">
      <div className="w-full flex items-center justify-between">
        <Badge variant="gray-opacity" label={`${data.id} курс`} />
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDeleting}
          className="disabled:opacity-50 w-8 h-8 rounded-full items-center flex justify-center"
          aria-label="Удалить курс"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      <p className="text-lg font-medium leading-[100%] text-white">
        {data.title}
      </p>
      <p className="text-xs text-base-gray leading-[100%]">{data.shortDesc}</p>
      <div className="flex items-center gap-2">
        <Badge
          variant="gray-opacity"
          label={getAccessScopeLabel(data.accessScope)}
        />
      </div>
      <Separator className="bg-[#FFFFFF1A]" />

      <Button
        variant="second"
        className="w-full"
        size="2s"
        onClick={() => navigate(`/admin/content/courses/${data.id}/edit`)}
      >
        Редактировать
      </Button>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteCourse(data.id)}
        title="Удалить курс"
        description={`Вы уверены, что хотите удалить курс ${data.title}? Это действие необратимо.`}
        confirmText="Удалить"
        isLoading={isDeleting}
        userName={data.title}
        showCancelButton={false}
        severity="destructive"
      />
    </Box>
  );
};
