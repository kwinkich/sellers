import { CreateScenarioForm } from "@/feature";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BlocksContainer,
  type BlockKind,
  type ScenarioBlockItem,
} from "@/feature/admin-feature/create-scenario/ui/blocks/parts/BlocksContainer";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  HeaderWithClose,
  getRoleLabel,
  useEdgeSwipeGuard,
  useTelegramVerticalSwipes,
} from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosMutationOptions } from "@/entities/scenarios/model/api/scenarios.api";
import { handleFormSuccess, handleFormError, ERROR_MESSAGES } from "@/shared";
import { useNavigate } from "react-router-dom";
import type { CreateScenarioRequest } from "@/entities/scenarios/model/types/scenarios.types";
import WebApp from "@twa-dev/sdk";

// Pre-built block configurations using skill codes
const PREBUILT_BLOCKS = {
  MODERATOR: {
    skillCodes: ["PROCESS_MANAGEMENT", "TIMING", "CHARISMA"],
    type: "SCALE_SKILL_MULTI" as BlockKind,
  },
  BUYER: {
    skillCodes: [
      "LOGICAL_BEHAVIOR",
      "EMOTIONAL_AUTHENTICITY",
      "CHARACTER_INTEGRITY",
    ],
    type: "SCALE_SKILL_MULTI" as BlockKind,
  },
};

// Extended block item with actual data
interface ExtendedBlockItem extends ScenarioBlockItem {
  // For TEXT blocks
  textContent?: string;
  // For QA blocks
  questionContent?: string;
  // For SCALE_SKILL_SINGLE blocks
  selectedSkillId?: number;
  questions?: Array<{ id: string; text: string; skillId: number }>;
  scaleOptions?: Array<{
    label: string;
    value: number;
    countsTowardsScore: boolean;
    ord: number;
  }>;
  // For SCALE_SKILL_MULTI blocks
  selectedSkills?: number[];
  scaleOptionsMulti?: Array<{
    label: string;
    value: number;
    countsTowardsScore: boolean;
    ord: number;
  }>;
}

export const AdminScenariosCreatePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const guardRef = useEdgeSwipeGuard();

  // Disable Telegram vertical swipes to prevent accidental app close during creation
  useTelegramVerticalSwipes(true);

  const [sellerBlocks, setSellerBlocks] = useState<ExtendedBlockItem[]>([]);
  const [buyerBlocks, setBuyerBlocks] = useState<ExtendedBlockItem[]>([]);
  const [moderatorBlocks, setModeratorBlocks] = useState<ExtendedBlockItem[]>(
    []
  );

  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
  }>({ title: "" });

  // Error state for form
  const [titleError, setTitleError] = useState<string>("");

  // Memoized callback to clear title error
  const clearTitleError = useCallback(() => {
    setTitleError("");
  }, []);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"SELLER" | "BUYER" | "MODERATOR">(
    "SELLER"
  );

  // Track if pre-built blocks have been initialized
  const prebuiltInitialized = useRef(false);

  // Telegram back button handler for tab navigation
  useEffect(() => {
    const onTelegramBack = () => {
      // If not on first tab, go to previous tab
      if (activeTab !== "SELLER") {
        handlePrevTab();
      } else {
        // If on first tab, navigate back to previous page
        navigate(-1);
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
  }, [activeTab, navigate]);

  // Fetch skills to find IDs for pre-built blocks
  const { data: skillsData } = useQuery(skillsQueryOptions.list());
  const skills = useMemo(() => skillsData?.data || [], [skillsData]);

  // Optimized skills lookup - O(1) instead of O(N)
  const skillsByCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const skill of skills) {
      if (skill.code) {
        map.set(skill.code, skill.id);
      }
    }
    return map;
  }, [skills]);

  const findSkillIdByCode = useCallback(
    (code: string) => skillsByCode.get(code),
    [skillsByCode]
  );

  // Create scenario mutation
  const { mutate: createScenario, isPending } = useMutation({
    ...scenariosMutationOptions.create(),
    onSuccess: () => {
      // Invalidate specific queries with more targeted approach
      queryClient.invalidateQueries({
        queryKey: ["scenarios", "list"],
        exact: false,
      });

      handleFormSuccess("Сценарий успешно создан");

      navigate("/admin/home");
    },
    onError: (error: any) => {
      console.error("Ошибка при создании сценария:", error);

      const errorMessage = handleFormError(error, ERROR_MESSAGES.CREATE);

      // Handle unique constraint violation (409 Conflict) - set title error
      if (error?.status === 409 || error?.error?.code === "CONFLICT") {
        setTitleError(errorMessage);
      } else {
        setTitleError(""); // Clear title error for other types of errors
      }
    },
  });

  // Create pre-built blocks when skills are loaded (only once)
  useEffect(() => {
    if (skills.length === 0 || prebuiltInitialized.current) return;

    // Add MODERATOR pre-built block
    const moderatorSkillIds = PREBUILT_BLOCKS.MODERATOR.skillCodes
      .map((skillCode) => findSkillIdByCode(skillCode))
      .filter((id): id is number => id !== undefined);

    if (moderatorSkillIds.length > 0) {
      const prebuiltBlock: ExtendedBlockItem = {
        id: `MODERATOR-prebuilt-${Date.now()}`,
        type: PREBUILT_BLOCKS.MODERATOR.type,
        prebuiltSkills: moderatorSkillIds,
        selectedSkills: moderatorSkillIds,
        scaleOptionsMulti: [
          { label: "плохо", value: -1, countsTowardsScore: true, ord: 0 },
          { label: "хорошо", value: 0, countsTowardsScore: true, ord: 1 },
          { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 },
        ],
      };
      setModeratorBlocks((prev) => [...prev, prebuiltBlock]);
    }

    // Add BUYER pre-built block
    const buyerSkillIds = PREBUILT_BLOCKS.BUYER.skillCodes
      .map((skillCode) => findSkillIdByCode(skillCode))
      .filter((id): id is number => id !== undefined);

    if (buyerSkillIds.length > 0) {
      const prebuiltBlock: ExtendedBlockItem = {
        id: `BUYER-prebuilt-${Date.now()}`,
        type: PREBUILT_BLOCKS.BUYER.type,
        prebuiltSkills: buyerSkillIds,
        selectedSkills: buyerSkillIds,
        scaleOptionsMulti: [
          { label: "плохо", value: -1, countsTowardsScore: true, ord: 0 },
          { label: "хорошо", value: 0, countsTowardsScore: true, ord: 1 },
          { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 },
        ],
      };
      setBuyerBlocks((prev) => [...prev, prebuiltBlock]);
    }

    // Mark as initialized
    prebuiltInitialized.current = true;
  }, [skills]);

  const handleAdd = useCallback(
    (role: "SELLER" | "BUYER" | "MODERATOR") => (type: BlockKind) => {
      const createItem = (t: BlockKind): ExtendedBlockItem => {
        const baseItem: ExtendedBlockItem = {
          id: `${role}-${t}-${Date.now()}`,
          type: t,
          textContent: "",
          questionContent: "",
          selectedSkillId: undefined,
          questions: [],
          scaleOptions: [],
          selectedSkills: [],
          scaleOptionsMulti: [],
        };

        // Initialize with default values based on block type
        if (t === "SCALE_SKILL_SINGLE") {
          baseItem.scaleOptions = [
            { label: "НЕТ", value: -2, countsTowardsScore: true, ord: 0 },
            { label: "50/50", value: -1, countsTowardsScore: true, ord: 1 },
            { label: "ДА", value: 1, countsTowardsScore: true, ord: 2 },
            { label: "?", value: 2, countsTowardsScore: false, ord: 3 },
          ];
        } else if (t === "SCALE_SKILL_MULTI") {
          baseItem.scaleOptionsMulti = [
            { label: "плохо", value: -1, countsTowardsScore: true, ord: 0 },
            { label: "хорошо", value: 0, countsTowardsScore: true, ord: 1 },
            { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 },
          ];
        }

        return baseItem;
      };

      if (role === "SELLER")
        setSellerBlocks((prev) => [...prev, createItem(type)]);
      if (role === "BUYER")
        setBuyerBlocks((prev) => [...prev, createItem(type)]);
      if (role === "MODERATOR")
        setModeratorBlocks((prev) => [...prev, createItem(type)]);
    },
    []
  );

  const handleRemove = useCallback(
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string) => {
      if (role === "SELLER")
        setSellerBlocks((prev) => prev.filter((b) => b.id !== id));
      if (role === "BUYER")
        setBuyerBlocks((prev) => prev.filter((b) => b.id !== id));
      if (role === "MODERATOR")
        setModeratorBlocks((prev) => prev.filter((b) => b.id !== id));
    },
    []
  );

  // Optimized block update function
  const updateById = useCallback(
    <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) => {
      const idx = arr.findIndex((b) => b.id === id);
      if (idx === -1) return arr;
      const next = arr.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    },
    []
  );

  const handleDataChange = useCallback(
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string, data: any) => {
      if (role === "SELLER")
        setSellerBlocks((prev) => updateById(prev, id, data));
      if (role === "BUYER")
        setBuyerBlocks((prev) => updateById(prev, id, data));
      if (role === "MODERATOR")
        setModeratorBlocks((prev) => updateById(prev, id, data));
    },
    [updateById]
  );

  // Tab navigation helpers
  const handleNextTab = useCallback(() => {
    if (activeTab === "SELLER") {
      setActiveTab("BUYER");
    } else if (activeTab === "BUYER") {
      setActiveTab("MODERATOR");
    }
  }, [activeTab]);

  const handlePrevTab = useCallback(() => {
    if (activeTab === "BUYER") {
      setActiveTab("SELLER");
    } else if (activeTab === "MODERATOR") {
      setActiveTab("BUYER");
    }
  }, [activeTab]);

  // Check if next button should be enabled
  const isNextEnabled = useCallback(() => {
    if (activeTab === "SELLER") {
      return sellerBlocks.length >= 3;
    } else if (activeTab === "BUYER") {
      return buyerBlocks.length >= 1;
    }
    return false;
  }, [activeTab, sellerBlocks.length, buyerBlocks.length]);

  // Optimized skills lookup for convertBlocksToFormBlocks - O(1) instead of O(N)
  const skillsById = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    for (const skill of skills) {
      map.set(skill.id, skill);
    }
    return map;
  }, [skills]);

  // Convert blocks to proper format for API
  const convertBlocksToFormBlocks = useCallback(
    (blocks: ExtendedBlockItem[]): any[] => {
      return blocks.map((block, index) => {
        // Generate block title according to specification

        const baseBlock: any = {
          type: block.type,
          required: true,
          position: index,
        };

        // Handle different block types with REAL data
        if (block.type === "TEXT") {
          // TEXT blocks: use textContent as title, no scale and items
          baseBlock.title = block.textContent || "Текстовый блок";
        } else if (block.type === "QA") {
          // QA blocks: use questionContent as title, no scale and items
          baseBlock.title = block.questionContent || "Блок вопросов";
        } else if (block.type === "SCALE_SKILL_SINGLE") {
          // SCALE_SKILL_SINGLE: use real scale options and questions (no title)
          baseBlock.scale = {
            options: (block.scaleOptions || []).map((opt, ord) => ({
              ord,
              label: opt.label,
              value: opt.value,
              countsTowardsScore: opt.countsTowardsScore,
            })),
          };
          // Items are questions with the same skillId
          baseBlock.items = (block.questions || []).map((q, pos) => ({
            title: q.text,
            position: pos,
            skillId: block.selectedSkillId || 1,
          }));
        } else if (block.type === "SCALE_SKILL_MULTI") {
          // SCALE_SKILL_MULTI: use real scale options and skills (no title)
          baseBlock.scale = {
            options: (block.scaleOptionsMulti || []).map((opt, ord) => ({
              ord,
              label: opt.label,
              value: opt.value,
              countsTowardsScore: opt.countsTowardsScore,
            })),
          };
          // Items are skills (skill names as titles) - O(1) lookup
          baseBlock.items = (block.selectedSkills || []).map((skillId, pos) => {
            const skill = skillsById.get(skillId);
            return {
              title: skill?.name || `Навык ${skillId}`,
              position: pos,
              skillId: skillId,
            };
          });
        }

        return baseBlock;
      });
    },
    [skillsById]
  );

  // Stable per-role handlers to prevent function creation during render
  const onAddSeller = useCallback(
    (type: BlockKind) => handleAdd("SELLER")(type),
    [handleAdd]
  );
  const onRemoveSeller = useCallback(
    (id: string) => handleRemove("SELLER")(id),
    [handleRemove]
  );
  const onDataChangeSeller = useCallback(
    (id: string, data: any) => handleDataChange("SELLER")(id, data),
    [handleDataChange]
  );

  const onAddBuyer = useCallback(
    (type: BlockKind) => handleAdd("BUYER")(type),
    [handleAdd]
  );
  const onRemoveBuyer = useCallback(
    (id: string) => handleRemove("BUYER")(id),
    [handleRemove]
  );
  const onDataChangeBuyer = useCallback(
    (id: string, data: any) => handleDataChange("BUYER")(id, data),
    [handleDataChange]
  );

  const onAddModerator = useCallback(
    (type: BlockKind) => handleAdd("MODERATOR")(type),
    [handleAdd]
  );
  const onRemoveModerator = useCallback(
    (id: string) => handleRemove("MODERATOR")(id),
    [handleRemove]
  );
  const onDataChangeModerator = useCallback(
    (id: string, data: any) => handleDataChange("MODERATOR")(id, data),
    [handleDataChange]
  );

  const handleSubmit = useCallback(() => {
    if (!formData.title.trim()) {
      handleFormError("Ошибка валидации", "Заполните название сценария");
      return;
    }

    const requestData: CreateScenarioRequest = {
      title: formData.title,
      forms: [
        {
          role: "SELLER",
          title: "Форма продавца",
          descr: "Сценарий для продавца",
          blocks: convertBlocksToFormBlocks(sellerBlocks),
        },
        {
          role: "BUYER",
          title: "Форма покупателя",
          descr: "Сценарий для покупателя",
          blocks: convertBlocksToFormBlocks(buyerBlocks),
        },
        {
          role: "MODERATOR",
          title: "Форма модератора",
          descr: "Сценарий для модератора",
          blocks: convertBlocksToFormBlocks(moderatorBlocks),
        },
      ],
    };

    // Call the actual API
    createScenario(requestData);
  }, [
    formData.title,
    convertBlocksToFormBlocks,
    sellerBlocks,
    buyerBlocks,
    moderatorBlocks,
    createScenario,
  ]);

  return (
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4 shrink-0">
        <HeaderWithClose
          title="Создание сценария"
          description="Добавьте новый сценарий"
          onClose={() => navigate("/admin/home")}
          variant="dark"
        />
        <CreateScenarioForm
          onFormDataChange={setFormData}
          titleError={titleError}
          onTitleErrorClear={clearTitleError}
        />
      </div>
      <div
        ref={guardRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        data-scroll-container
      >
        <div className="flex flex-col pb-[calc(96px+env(safe-area-inset-bottom))] gap-6 px-2 min-h-full">
          <Tabs value={activeTab}>
            <div className="sticky top-0 bg-white z-50 pb-2">
              <TabsList
                variant="second"
                className="grid grid-cols-3 w-full pointer-events-none"
              >
                <TabsTrigger variant="second" value="SELLER">
                  {getRoleLabel("SELLER")}
                </TabsTrigger>
                <TabsTrigger variant="second" value="BUYER">
                  {getRoleLabel("BUYER")}
                </TabsTrigger>
                <TabsTrigger variant="second" value="MODERATOR">
                  {getRoleLabel("MODERATOR")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="SELLER"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0">
                <BlocksContainer
                  blocks={sellerBlocks}
                  onAdd={onAddSeller}
                  onRemove={onRemoveSeller}
                  onDataChange={onDataChangeSeller}
                />
                {sellerBlocks.length < 3 && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Необходимо добавить минимум 3 блока
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="BUYER"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0">
                <BlocksContainer
                  blocks={buyerBlocks}
                  onAdd={onAddBuyer}
                  onRemove={onRemoveBuyer}
                  onDataChange={onDataChangeBuyer}
                />
                {buyerBlocks.length < 1 && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Необходимо добавить минимум 1 блок
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="MODERATOR"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0">
                <BlocksContainer
                  blocks={moderatorBlocks}
                  onAdd={onAddModerator}
                  onRemove={onRemoveModerator}
                  onDataChange={onDataChangeModerator}
                />
                {moderatorBlocks.length < 1 && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Необходимо добавить минимум 1 блок
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation buttons */}
          <div className="relative pt-4 pb-4">
            {activeTab === "SELLER" && (
              <Button
                onClick={handleNextTab}
                disabled={!isNextEnabled()}
                className="w-full h-12"
              >
                Далее
              </Button>
            )}

            {activeTab === "BUYER" && (
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevTab}
                  variant="second"
                  className="flex-1 h-12"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleNextTab}
                  disabled={!isNextEnabled()}
                  className="flex-1 h-12"
                >
                  Далее
                </Button>
              </div>
            )}

            {activeTab === "MODERATOR" && (
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevTab}
                  variant="second"
                  className="flex-1 h-12"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || !formData.title.trim()}
                  className="flex-1 h-12"
                >
                  {isPending ? "Создание..." : "Создать сценарий"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
