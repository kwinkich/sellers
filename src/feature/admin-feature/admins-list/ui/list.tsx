import { AdminsAPI } from "@/entities";
import { HeadText, useInfiniteScroll, InfiniteScrollList } from "@/shared";
import { AdminCard } from "./card";

export const AdminsList = () => {
  const {
    items: admins,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["admins", "list"],
    queryFn: (page, limit) => AdminsAPI.getAdmins({ page, limit }),
    limit: 20,
  });

  return (
    <div className="space-y-3 px-2">
      <HeadText
        head="Список администраторов"
        label="Все пользователи с правами управления"
        className="px-2"
      />
      <InfiniteScrollList
        items={admins}
        getKey={(admin) => admin.id}
        renderItem={(admin) => <AdminCard data={admin} />}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        emptyMessage="Нет добавленных администраторов"
        loadingMessage="Загрузка списка админов..."
        errorMessage="Ошибка загрузки админов"
        className="space-y-2"
      />
    </div>
  );
};
