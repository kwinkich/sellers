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
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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

  // Track validation triggers per tab (only show validation after Next is clicked)
  const [validationTriggered, setValidationTriggered] = useState({
    SELLER: false,
    BUYER: false,
    MODERATOR: false,
  });

  // Track which blocks have been edited/touched (per tab)
  const [touchedBlocks, setTouchedBlocks] = useState<{
    SELLER: Set<string>;
    BUYER: Set<string>;
    MODERATOR: Set<string>;
  }>({
    SELLER: new Set(),
    BUYER: new Set(),
    MODERATOR: new Set(),
  });

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

  // Fetch ALL skills with the new getAllSkills endpoint
  const { data: skillsResponse, isLoading: skillsLoading } = useQuery(
    skillsQueryOptions.all({ by: "name", order: "asc" })
  );

  const skills = useMemo(() => {
    if (!skillsResponse?.data) return [];
    return skillsResponse.data;
  }, [skillsResponse]);

  // Optimized skills lookup
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

      navigate("/admin/content/scenarios");
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
    if (skillsLoading || prebuiltInitialized.current || skills.length === 0)
      return;

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
    } else {
      console.warn(
        "No MODERATOR skills found for prebuilt block. Expected codes:",
        PREBUILT_BLOCKS.MODERATOR.skillCodes
      );
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
    } else {
      console.warn(
        "No BUYER skills found for prebuilt block. Expected codes:",
        PREBUILT_BLOCKS.BUYER.skillCodes
      );
    }

    // Mark as initialized
    prebuiltInitialized.current = true;
  }, [skills, skillsLoading, findSkillIdByCode]);

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
      // Mark block as touched/edited
      setTouchedBlocks((prev) => ({
        ...prev,
        [role]: new Set(prev[role]).add(id),
      }));

      if (role === "SELLER")
        setSellerBlocks((prev) => updateById(prev, id, data));
      if (role === "BUYER")
        setBuyerBlocks((prev) => updateById(prev, id, data));
      if (role === "MODERATOR")
        setModeratorBlocks((prev) => updateById(prev, id, data));
    },
    [updateById]
  );

  // Validate a single block based on its type
  const validateBlock = useCallback((block: ExtendedBlockItem): boolean => {
    switch (block.type) {
      case "TEXT":
        return !!(block.textContent && block.textContent.trim().length > 0);
      case "QA":
        return !!(
          block.questionContent && block.questionContent.trim().length > 0
        );
      case "SCALE_SKILL_SINGLE":
        // Must have skill selected and at least 1 question with text
        const hasSkill = !!(block.selectedSkillId && block.selectedSkillId > 0);
        const hasValidQuestions = !!(
          block.questions &&
          block.questions.some((q) => q.text && q.text.trim().length > 0)
        );
        return hasSkill && hasValidQuestions;
      case "SCALE_SKILL_MULTI":
        // Must have at least 1 skill selected
        return !!(block.selectedSkills && block.selectedSkills.length > 0);
      default:
        return true;
    }
  }, []);

  // Check if all blocks are valid
  const areAllBlocksValid = useCallback(
    (blocks: ExtendedBlockItem[]): boolean => {
      if (blocks.length === 0) return false;
      return blocks.every(validateBlock);
    },
    [validateBlock]
  );

  // Tab navigation helpers
  const handleNextTab = useCallback(() => {
    // Get current blocks based on active tab
    const currentBlocks =
      activeTab === "SELLER"
        ? sellerBlocks
        : activeTab === "BUYER"
        ? buyerBlocks
        : moderatorBlocks;

    // Validate blocks
    const invalidBlockIndex = currentBlocks.findIndex(
      (block) => !validateBlock(block)
    );

    // Trigger validation for current tab
    setValidationTriggered((prev) => ({ ...prev, [activeTab]: true }));

    // If there are invalid blocks, scroll to first invalid one
    if (invalidBlockIndex !== -1) {
      const invalidBlock = currentBlocks[invalidBlockIndex];
      const blockElement = document.querySelector(
        `[data-block-id="${invalidBlock.id}"]`
      );
      if (blockElement) {
        // Small delay to ensure DOM is updated with validation messages
        setTimeout(() => {
          blockElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
      return; // Don't proceed to next tab
    }

    // All blocks are valid, proceed to next tab
    if (activeTab === "SELLER") {
      setActiveTab("BUYER");
    } else if (activeTab === "BUYER") {
      setActiveTab("MODERATOR");
    }
  }, [activeTab, sellerBlocks, buyerBlocks, moderatorBlocks, validateBlock]);

  const handlePrevTab = useCallback(() => {
    if (activeTab === "BUYER") {
      setActiveTab("SELLER");
    } else if (activeTab === "MODERATOR") {
      setActiveTab("BUYER");
    }
    // Reset validation trigger for the tab we're leaving
    setValidationTriggered((prev) => ({ ...prev, [activeTab]: false }));
  }, [activeTab]);

  // Check if next button should be enabled
  const isNextEnabled = useCallback(() => {
    if (activeTab === "SELLER") {
      return sellerBlocks.length >= 3 && areAllBlocksValid(sellerBlocks);
    } else if (activeTab === "BUYER") {
      // For BUYER, we need at least 1 block and all must be valid
      return buyerBlocks.length >= 1 && areAllBlocksValid(buyerBlocks);
    } else if (activeTab === "MODERATOR") {
      // For MODERATOR, we need at least 1 block and all must be valid
      return moderatorBlocks.length >= 1 && areAllBlocksValid(moderatorBlocks);
    }
    return false;
  }, [
    activeTab,
    sellerBlocks,
    buyerBlocks,
    moderatorBlocks,
    areAllBlocksValid,
  ]);

  // Check if create scenario button should be enabled (all roles must have required blocks)
  const isCreateScenarioEnabled = useCallback(() => {
    const enabled =
      sellerBlocks.length >= 3 &&
      buyerBlocks.length >= 1 &&
      moderatorBlocks.length >= 1 &&
      formData.title.trim().length > 0 &&
      areAllBlocksValid(sellerBlocks) &&
      areAllBlocksValid(buyerBlocks) &&
      areAllBlocksValid(moderatorBlocks);

    return enabled;
  }, [
    sellerBlocks,
    buyerBlocks,
    moderatorBlocks,
    formData.title,
    areAllBlocksValid,
  ]);

  // Optimized skills lookup for convertBlocksToFormBlocks
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
        const baseBlock: any = {
          type: block.type,
          required: true,
          position: index,
        };

        // Handle different block types with REAL data
        if (block.type === "TEXT") {
          // TEXT blocks: use textContent as title, no scale and items
          if (!block.textContent || block.textContent.trim().length === 0) {
            throw new Error("TEXT блок должен содержать текст");
          }
          baseBlock.title = block.textContent.trim();
          // Ensure no scale or items properties for TEXT blocks
          console.log("TEXT block created:", baseBlock);
        } else if (block.type === "QA") {
          // QA blocks: use questionContent as title, no scale and items
          if (
            !block.questionContent ||
            block.questionContent.trim().length === 0
          ) {
            throw new Error("QA блок должен содержать вопросы");
          }
          baseBlock.title = block.questionContent.trim();
          // Ensure no scale or items properties for QA blocks
          console.log("QA block created:", baseBlock);
        } else if (block.type === "SCALE_SKILL_SINGLE") {
          // SCALE_SKILL_SINGLE: use real scale options and questions
          baseBlock.title = "Оценка навыка";
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
          console.log("SCALE_SKILL_SINGLE block created:", baseBlock);
        } else if (block.type === "SCALE_SKILL_MULTI") {
          // SCALE_SKILL_MULTI: use real scale options and skills
          baseBlock.title = "Оценка навыков";
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
          console.log("SCALE_SKILL_MULTI block created:", baseBlock);
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

    try {
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

      // Debug: Log the request data to see what we're sending
      console.log(
        "Scenario creation request:",
        JSON.stringify(requestData, null, 2)
      );

      // Call the actual API
      createScenario(requestData);
    } catch (error) {
      console.error("Validation error:", error);
      handleFormError(
        "Ошибка валидации",
        error instanceof Error
          ? error.message
          : "Проверьте заполнение всех блоков"
      );
    }
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
            <div className="sticky top-0 bg-white z-50">
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
                  showValidation={validationTriggered.SELLER}
                  touchedBlocks={touchedBlocks.SELLER}
                />
                {sellerBlocks.length < 3 && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Необходимо добавить минимум 3 блока
                  </p>
                )}
                {sellerBlocks.some(
                  (block) =>
                    block.type === "TEXT" &&
                    (!block.textContent ||
                      block.textContent.trim().length === 0)
                ) && (
                  <p className="mt-2 text-xs text-amber-600 text-center">
                    Заполните текст во всех текстовых блоках
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="BUYER"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0">
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Загрузка предустановленных блоков...
                    </p>
                  </div>
                ) : (
                  <>
                    <BlocksContainer
                      blocks={buyerBlocks}
                      onAdd={onAddBuyer}
                      onRemove={onRemoveBuyer}
                      onDataChange={onDataChangeBuyer}
                      showValidation={validationTriggered.BUYER}
                      touchedBlocks={touchedBlocks.BUYER}
                    />
                    {buyerBlocks.length < 1 && (
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        Необходимо добавить минимум 1 блок
                      </p>
                    )}
                    {buyerBlocks.some(
                      (block) =>
                        block.type === "TEXT" &&
                        (!block.textContent ||
                          block.textContent.trim().length === 0)
                    ) && (
                      <p className="mt-2 text-xs text-amber-600 text-center">
                        Заполните текст во всех текстовых блоках
                      </p>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="MODERATOR"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0">
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Загрузка предустановленных блоков...
                    </p>
                  </div>
                ) : (
                  <>
                    <BlocksContainer
                      blocks={moderatorBlocks}
                      onAdd={onAddModerator}
                      onRemove={onRemoveModerator}
                      onDataChange={onDataChangeModerator}
                      showValidation={validationTriggered.MODERATOR}
                      touchedBlocks={touchedBlocks.MODERATOR}
                    />
                    {moderatorBlocks.length < 1 && (
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        Необходимо добавить минимум 1 блок
                      </p>
                    )}
                    {moderatorBlocks.some(
                      (block) =>
                        block.type === "TEXT" &&
                        (!block.textContent ||
                          block.textContent.trim().length === 0)
                    ) && (
                      <p className="mt-2 text-xs text-amber-600 text-center">
                        Заполните текст во всех текстовых блоках
                      </p>
                    )}
                  </>
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
                className="w-full h-12 cursor-pointer"
              >
                Далее
              </Button>
            )}

            {activeTab === "BUYER" && (
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevTab}
                  variant="second"
                  className="flex-1 h-12 cursor-pointer"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleNextTab}
                  disabled={!isNextEnabled()}
                  className="flex-1 h-12 cursor-pointer"
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
                  className="flex-1 h-12 cursor-pointer"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || !isCreateScenarioEnabled()}
                  className="flex-1 h-12 cursor-pointer"
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
