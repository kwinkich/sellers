import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UniversalAccordion } from "@/components/ui/u-accordion";
import type { MopPractice, MopSkill } from "@/entities";
import { mopProfilesQueryOptions } from "@/entities";
import {
  ArrowIcon,
  Box,
  HeadText,
  MiniGameIcon,
  PracticeNoCaseIcon,
  PracticeWithCaseIcon,
  StudioIcon,
  getRoleLabel,
} from "@/shared";
import { MopNavBar } from "@/widget";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const MopProfilePage = () => {
  const navigate = useNavigate();

  const {
    data: profileRes,
    isLoading,
    error,
  } = useQuery(mopProfilesQueryOptions.profileInfo());
  const profile = profileRes?.data;

  const displayName = profile?.displayName ?? "-";
  const companyName = profile?.companyName ?? "-";
  const repScore = profile?.repScore ?? 0;
  const licenseId = profile?.currentSlotId ?? "-";
  const licenseExpiresAt = profile?.currentSlotExpiresAt
    ? new Date(profile.currentSlotExpiresAt).toLocaleDateString("ru-RU")
    : "-";
  const learningProgress = profile?.learningProgress ?? 0;
  const normalizedProgress = Math.max(0, Math.min(100, learningProgress));

  const [currentPage, setCurrentPage] = useState(1);
  const [allSkills, setAllSkills] = useState<MopSkill[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const limit = 20;

  const { data: skillsRes, isLoading: isLoadingSkills } = useQuery(
    mopProfilesQueryOptions.profileSkills({
      page: currentPage,
      limit,
    })
  );

  const totalPages = skillsRes?.meta?.pagination?.totalPages ?? 0;
  const hasMorePages = currentPage < totalPages;

  useEffect(() => {
    if (skillsRes?.data) {
      if (currentPage === 1) {
        setAllSkills(skillsRes.data);
      } else {
        setAllSkills((prev) => [...prev, ...skillsRes.data]);
      }
      setIsFetchingMore(false);
    }
  }, [skillsRes, currentPage]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      if (isFetchingMore || !hasMorePages) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isNearBottom) {
        setIsFetchingMore(true);
        setCurrentPage((prev) => prev + 1);
      }
    },
    [isFetchingMore, hasMorePages]
  );

  const { data: practicesRes } = useQuery(
    mopProfilesQueryOptions.profilePractices()
  );
  const practices = practicesRes?.data ?? [];

  const getSkillClasses = (status: MopSkill["status"]) => {
    switch (status) {
      case "YES":
        return "bg-base-opacity10-main font-medium text-base-main";
      case "HALF":
        return "bg-[#FFFFFF14] text-gray-400";
      default:
        return "bg-[#f44f471a] bg-opacity-10 font-medium text-[#F44F47]";
    }
  };

  const getPracticeIcon = (practiceType: string): ReactNode => {
    switch (practiceType) {
      case "WITH_CASE":
        return <PracticeWithCaseIcon size={45} fill="#06935F" />;
      case "WITHOUT_CASE":
        return <PracticeNoCaseIcon size={45} fill="#06935F" />;
      case "MINI":
        return <MiniGameIcon size={45} fill="#06935F" />;
      default:
        return <StudioIcon size={45} fill="#06935F" />;
    }
  };

  const getMopRoleLabel = (role: MopPractice["role"]) => {
    return getRoleLabel(role as any);
  };

  const getPracticeTypeLabel = (practiceType: string) => {
    switch (practiceType) {
      case "WITH_CASE":
        return "Игра с кейсом";
      case "WITHOUT_CASE":
        return "Игра без кейса";
      case "MINI":
        return "Мини-игра";
      default:
        return practiceType;
    }
  };

  const skillsAccordionItems = [
    {
      id: "skills",
      title: (
        <p className="text-lg py-0 font-medium leading-[100%] text-white">
          Список навыков
        </p>
      ),
      content: (
        <div
          className="flex flex-col gap-2 pt-2 max-h-[320px] overflow-auto"
          onScroll={handleScroll}
        >
          {isLoadingSkills && currentPage === 1 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          ) : allSkills.length === 0 ? (
            <p className="text-xs text-white">Навыков пока нет</p>
          ) : (
            <>
              {allSkills.map((s) => (
                <div
                  key={`skill-${s.id}`}
                  className="w-full flex items-center justify-between bg-second-bg p-2 rounded-[8px]"
                >
                  <p className="text-white">{s.name}</p>
                  <div
                    className={`px-[18px] py-[4.5px] rounded-[8px] ${getSkillClasses(
                      s.status
                    )}`}
                  >
                    <p className="text-xs leading-[100%]">
                      {s.status === "YES"
                        ? "Да"
                        : s.status === "HALF"
                        ? "50/50"
                        : "Нет"}
                    </p>
                  </div>
                </div>
              ))}
              {isFetchingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const practicesAccordionItems = [
    {
      id: "practices",
      title: (
        <p className="text-lg py-0 font-medium leading-[100%] text-white">
          История практик
        </p>
      ),
      content: (
        <div className="flex flex-col gap-3 pt-2">
          {practices.length === 0 ? (
            <p className="text-xs text-base-gray">Практик пока нет</p>
          ) : (
            practices.map((practice: MopPractice) => (
              <Card
                key={`practice-${practice.id}`}
                className="bg-second-bg border-none"
              >
                <CardHeader className="py-2 px-2">
                  <div className="flex items-start gap-3">
                    {getPracticeIcon(practice.practiceType)}
                    <div className="flex flex-col flex-1 gap-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs w-max rounded-md bg-base-bg px-3 py-1 text-base-gray">
                          {getPracticeTypeLabel(practice.practiceType)}
                        </span>
                        <span
                          className={`text-sm ${
                            practice.repChanged
                              ? practice.repDelta > 0
                                ? "text-green-500"
                                : "text-red-400"
                              : "text-base-gray"
                          }`}
                        >
                          {practice.repChanged
                            ? practice.repDelta > 0
                              ? `+${practice.repDelta} rep`
                              : `${practice.repDelta} rep`
                            : ""}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-white">
                        {practice.title}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="bg-[#0A0C0E] rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-base-gray">
                          Ваша роль:
                        </span>
                        <span className="text-md font-medium text-white">
                          {getMopRoleLabel(practice.role)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-base-gray">
                          Дата игры:
                        </span>
                        <span className="text-md font-medium text-white">
                          {new Date(practice.startAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-second-bg min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-6 px-2 pt-4">
          <HeadText
            head="Профиль МОПа"
            label="Загрузка данных..."
            variant="black-gray"
          />
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileRes) {
    return (
      <div className="bg-second-bg min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-6 px-2 pt-4">
          <HeadText
            head="Профиль МОПа"
            label="Ошибка загрузки профиля"
            variant="black-gray"
          />
          <div className="text-center py-8 text-destructive">
            {(error as any)?.message || "Профиль не найден"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-second-bg min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-3 bg-base-bg rounded-b-3xl px-2 pb-3 pt-2">
        <div className="flex items-center justify-between mb-2">
          <HeadText
            className="gap-0.5 pl-2 pt-2"
            head={displayName}
            label={companyName}
          />

          <div className="rounded-full px-5 py-2.5 bg-base-opacity10-main">
            <p className="text-xs font-medium text-base-main">Rep {repScore}</p>
          </div>
        </div>

        <Box
          direction="row"
          justify="between"
          className="px-4 py-3"
          rounded="xl"
        >
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-base-gray">Лицензия</p>
            <p className="text-xs font-medium text-white">{licenseId}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <p className="text-xs text-base-gray">До</p>
            <p className="text-xs font-medium text-white">{licenseExpiresAt}</p>
          </div>
        </Box>

        <Box className="px-3 py-2">
          <div className=" w-full flex items-center gap-3">
            <div className="bg-[#FFFFFF0D] px-3 py-1 rounded-[8px]">
              <p className="font-medium text-white">{learningProgress}%</p>
            </div>

            <p className="flex-1 text-xs text-base-gray">Прогресс обучения</p>

            <button
              onClick={() => navigate("/mop/education/courses")}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Перейти к курсам"
            >
              <ArrowIcon size={24} fill="#06935F" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2">
            {Array(5)
              .fill(null)
              .map((_, idx) => {
                const segmentStart = idx * 20;
                const filledInSegment = Math.min(
                  20,
                  Math.max(0, normalizedProgress - segmentStart)
                );
                const widthPercent = (filledInSegment / 20) * 100;

                return (
                  <div
                    key={`progress-segment-${idx}`}
                    className="h-2 rounded-full w-full bg-[#FFFFFF0A] overflow-hidden"
                  >
                    <div
                      className="h-full bg-base-main"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                );
              })}
          </div>
        </Box>
      </div>

      <div className="flex flex-col gap-2 px-2">
        <HeadText
          className="mb-4 px-2"
          head="Навыки и компетенции"
          label="Следите за прогрессом и улучшайте результат"
          headSize="lg"
          labelSize="sm"
        />
        <UniversalAccordion
          items={skillsAccordionItems}
          className="pb-2 pt-3"
          type="single"
          defaultValue="skills"
          itemClassName="border-none bg-transparent"
          triggerClassName="px-0 pb-2 pt-0  hover:no-underline"
          contentClassName="px-0"
        />

        <UniversalAccordion
          items={practicesAccordionItems}
          className="pb-2 pt-3"
          type="single"
          defaultValue="practices"
          itemClassName="border-none bg-transparent"
          triggerClassName="px-0 pb-2 pt-0 hover:no-underline"
          contentClassName="px-0"
        />
      </div>

      {/* Reserve room for fixed navbar + iOS safe area + a bit of breathing space */}
      <div className="h-[calc(var(--mop-navbar-h,64px)+env(safe-area-inset-bottom)+8px)]" />

      <MopNavBar />
    </div>
  );
};
