import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BlocksContainer,
  type BlockKind,
  type ScenarioBlockItem,
} from "@/feature/admin-feature/create-scenario/ui/blocks/parts/BlocksContainer";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getRoleLabel, ConfirmationDialog } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosMutationOptions } from "@/entities/scenarios/model/api/scenarios.api";
import { handleFormSuccess, handleFormError, ERROR_MESSAGES } from "@/shared";
import { useNavigate } from "react-router-dom";
import type { CreateScenarioRequest } from "@/entities/scenarios/model/types/scenarios.types";
import WebApp from "@twa-dev/sdk";
import { scenariosQueryOptions } from "@/entities";

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

interface EditScenarioFormProps {
  scenarioId?: number;
  onFormChange?: (hasChanges: boolean) => void;
  scenarioTitle?: string;
  onTitleChange?: (title: string) => void;
}

export function EditScenarioForm({
  scenarioId,
  onFormChange,
  scenarioTitle,
  onTitleChange,
}: EditScenarioFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [sellerBlocks, setSellerBlocks] = useState<ExtendedBlockItem[]>([]);
  const [buyerBlocks, setBuyerBlocks] = useState<ExtendedBlockItem[]>([]);
  const [moderatorBlocks, setModeratorBlocks] = useState<ExtendedBlockItem[]>(
    []
  );

  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
  }>({ title: "" });

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

  // Confirmation dialog states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track original data for change detection
  const originalDataRef = useRef<any>(null);

  // Fetch scenario data
  const {
    data: scenarioData,
    isLoading,
    isError,
  } = useQuery({
    ...scenariosQueryOptions.byId(scenarioId!, true), // includeForms = true
    enabled: !!scenarioId,
  });

  // Use warmed all-skills cache and build O(1) lookup
  const { data: allSkillsResp } = useQuery(
    skillsQueryOptions.all({ by: "name", order: "asc" })
  );
  const skillsById = useMemo(() => {
    const map: Record<number, { id: number; name: string; code?: string }> = {};
    const rows = allSkillsResp?.data ?? [];
    for (const s of rows) {
      map[s.id] = {
        id: s.id,
        name: s.name,
        code: s.code || undefined,
      };
    }
    return map;
  }, [allSkillsResp]);

  // Initialize form with scenario data
  useEffect(() => {
    if (scenarioData?.data) {
      const scenario = scenarioData.data;

      // Set form title
      setFormData({ title: scenario.title });
      onTitleChange?.(scenario.title);

      // Convert API blocks to ExtendedBlockItem format
      const convertApiBlocksToExtended = (
        blocks: any[],
        role: string
      ): ExtendedBlockItem[] => {
        return blocks.map((block) => {
          const baseItem: ExtendedBlockItem = {
            id: `${role}-${block.type}-${block.position}-${Date.now()}`,
            type: block.type as BlockKind,
            textContent: "",
            questionContent: "",
            selectedSkillId: undefined,
            questions: [],
            scaleOptions: [],
            selectedSkills: [],
            scaleOptionsMulti: [],
          };

          if (block.type === "TEXT") {
            baseItem.textContent = block.title || "";
          } else if (block.type === "QA") {
            baseItem.questionContent = block.title || "";
          } else if (block.type === "SCALE_SKILL_SINGLE") {
            baseItem.selectedSkillId = block.items?.[0]?.skillId;
            baseItem.questions =
              block.items?.map((item: any, idx: number) => ({
                id: `${role}-q-${idx}-${Date.now()}`,
                text: item.title,
                skillId: item.skillId,
              })) || [];
            baseItem.scaleOptions =
              block.scale?.options?.map((opt: any, ord: number) => ({
                label: opt.label,
                value: opt.value,
                countsTowardsScore: opt.countsTowardsScore,
                ord: ord,
              })) || [];
          } else if (block.type === "SCALE_SKILL_MULTI") {
            baseItem.selectedSkills =
              block.items?.map((item: any) => item.skillId) || [];
            baseItem.scaleOptionsMulti =
              block.scale?.options?.map((opt: any, ord: number) => ({
                label: opt.label,
                value: opt.value,
                countsTowardsScore: opt.countsTowardsScore,
                ord: ord,
              })) || [];
          }

          return baseItem;
        });
      };

      // Set blocks for each role
      const sellerForm = scenario.forms.find((f) => f.role === "SELLER");
      const buyerForm = scenario.forms.find((f) => f.role === "BUYER");
      const moderatorForm = scenario.forms.find((f) => f.role === "MODERATOR");

      setSellerBlocks(
        convertApiBlocksToExtended(sellerForm?.blocks || [], "SELLER")
      );
      setBuyerBlocks(
        convertApiBlocksToExtended(buyerForm?.blocks || [], "BUYER")
      );
      setModeratorBlocks(
        convertApiBlocksToExtended(moderatorForm?.blocks || [], "MODERATOR")
      );

      // Store original data for change detection
      originalDataRef.current = {
        title: scenario.title,
        sellerBlocks: convertApiBlocksToExtended(
          sellerForm?.blocks || [],
          "SELLER"
        ),
        buyerBlocks: convertApiBlocksToExtended(
          buyerForm?.blocks || [],
          "BUYER"
        ),
        moderatorBlocks: convertApiBlocksToExtended(
          moderatorForm?.blocks || [],
          "MODERATOR"
        ),
      };
    }
  }, [scenarioData, onTitleChange]);

  // Sync external title changes with form data
  useEffect(() => {
    if (scenarioTitle !== undefined && scenarioTitle !== formData.title) {
      setFormData({ title: scenarioTitle });
    }
  }, [scenarioTitle]);

  // Track changes
  useEffect(() => {
    if (originalDataRef.current) {
      const currentData = {
        title: formData.title,
        sellerBlocks,
        buyerBlocks,
        moderatorBlocks,
      };

      const hasChangesValue =
        JSON.stringify(currentData) !== JSON.stringify(originalDataRef.current);
      setHasChanges(hasChangesValue);
      onFormChange?.(hasChangesValue);
    }
  }, [formData, sellerBlocks, buyerBlocks, moderatorBlocks, onFormChange]);

  // Telegram back button handler for tab navigation
  useEffect(() => {
    const onTelegramBack = () => {
      if (activeTab !== "SELLER") {
        handlePrevTab();
      } else {
        navigate("/admin/content/scenarios");
      }
    };

    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onTelegramBack);
      WebApp.BackButton.show();

      return () => {
        try {
          WebApp.BackButton.offClick(onTelegramBack);
        } catch {}
      };
    }
  }, [activeTab, navigate]);

  // Update scenario mutation
  const { mutate: updateScenario, isPending } = useMutation({
    ...scenariosMutationOptions.update(),
    onSuccess: () => {
      // Invalidate specific queries with more targeted approach
      queryClient.invalidateQueries({
        queryKey: ["scenarios", "list"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["scenarios", "detail", scenarioId],
      });
      handleFormSuccess("Сценарий успешно обновлен");
      navigate("/admin/content/scenarios");
    },
    onError: (error) => {
      console.error("Ошибка при обновлении сценария:", error);
      handleFormError(error, ERROR_MESSAGES.UPDATE);
    },
  });

  const handleAdd =
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
    };

  const handleRemove =
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string) => {
      if (role === "SELLER")
        setSellerBlocks((prev) => prev.filter((b) => b.id !== id));
      if (role === "BUYER")
        setBuyerBlocks((prev) => prev.filter((b) => b.id !== id));
      if (role === "MODERATOR")
        setModeratorBlocks((prev) => prev.filter((b) => b.id !== id));
    };

  const handleDataChange = useCallback(
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string, data: any) => {
      // Mark block as touched/edited
      setTouchedBlocks((prev) => ({
        ...prev,
        [role]: new Set(prev[role]).add(id),
      }));

      const updateBlock = (blocks: ExtendedBlockItem[]) =>
        blocks.map((block) =>
          block.id === id ? { ...block, ...data } : block
        );

      if (role === "SELLER") setSellerBlocks((prev) => updateBlock(prev));
      if (role === "BUYER") setBuyerBlocks((prev) => updateBlock(prev));
      if (role === "MODERATOR") setModeratorBlocks((prev) => updateBlock(prev));
    },
    []
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
      return buyerBlocks.length >= 1 && areAllBlocksValid(buyerBlocks);
    }
    return false;
  }, [activeTab, sellerBlocks, buyerBlocks, areAllBlocksValid]);

  const handleSubmit = useCallback(() => {
    // Validate all blocks before submitting
    const allTabsValid =
      sellerBlocks.length >= 3 &&
      areAllBlocksValid(sellerBlocks) &&
      buyerBlocks.length >= 1 &&
      areAllBlocksValid(buyerBlocks) &&
      moderatorBlocks.length >= 1 &&
      areAllBlocksValid(moderatorBlocks);

    if (!formData.title.trim()) {
      handleFormError("Ошибка валидации", "Заполните название сценария");
      return;
    }

    if (!allTabsValid) {
      // Trigger validation for all tabs
      setValidationTriggered({
        SELLER: true,
        BUYER: true,
        MODERATOR: true,
      });

      // Find first invalid block across all tabs
      let firstInvalidBlock: ExtendedBlockItem | null = null;
      let firstInvalidTab: "SELLER" | "BUYER" | "MODERATOR" = "SELLER";

      if (!areAllBlocksValid(sellerBlocks)) {
        firstInvalidBlock = sellerBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "SELLER";
      } else if (!areAllBlocksValid(buyerBlocks)) {
        firstInvalidBlock = buyerBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "BUYER";
      } else if (!areAllBlocksValid(moderatorBlocks)) {
        firstInvalidBlock =
          moderatorBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "MODERATOR";
      }

      // Switch to tab with invalid block and scroll
      if (firstInvalidBlock) {
        setActiveTab(firstInvalidTab);
        setTimeout(() => {
          const blockElement = document.querySelector(
            `[data-block-id="${firstInvalidBlock!.id}"]`
          );
          if (blockElement) {
            blockElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }

      handleFormError("Ошибка валидации", "Проверьте заполнение всех блоков");
      return;
    }

    setShowSubmitDialog(true);
  }, [
    formData.title,
    sellerBlocks,
    buyerBlocks,
    moderatorBlocks,
    areAllBlocksValid,
    validateBlock,
  ]);

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    performSubmit();
  };

  const cancelSubmit = () => {
    setShowSubmitDialog(false);
  };

  const performSubmit = () => {
    // Convert blocks to proper format for API
    const convertBlocksToFormBlocks = (blocks: ExtendedBlockItem[]): any[] => {
      return blocks.map((block, index) => {
        const baseBlock: any = {
          type: block.type,
          required: true,
          position: index,
        };

        // Handle different block types with REAL data
        if (block.type === "TEXT") {
          baseBlock.title = block.textContent || "Текстовый блок";
        } else if (block.type === "QA") {
          baseBlock.title = block.questionContent || "Блок вопросов";
        } else if (block.type === "SCALE_SKILL_SINGLE") {
          baseBlock.scale = {
            options: (block.scaleOptions || []).map((opt, ord) => ({
              ord,
              label: opt.label,
              value: opt.value,
              countsTowardsScore: opt.countsTowardsScore,
            })),
          };
          baseBlock.items = (block.questions || []).map((q, pos) => ({
            title: q.text,
            position: pos,
            skillId: block.selectedSkillId || 1,
          }));
        } else if (block.type === "SCALE_SKILL_MULTI") {
          baseBlock.scale = {
            options: (block.scaleOptionsMulti || []).map((opt, ord) => ({
              ord,
              label: opt.label,
              value: opt.value,
              countsTowardsScore: opt.countsTowardsScore,
            })),
          };
          baseBlock.items = (block.selectedSkills || []).map(
            (skillId, pos) => ({
              title: skillsById[skillId]?.name || `Навык ${skillId}`,
              position: pos,
              skillId: skillId,
            })
          );
        }

        return baseBlock;
      });
    };

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
    // console.log(requestData);
    updateScenario({ id: scenarioId!, data: requestData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка сценария...</p>
        </div>
      </div>
    );
  }

  if (isError || !scenarioData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка загрузки сценария</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-0">
      {/* Tabs for different roles */}
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
          forceMount
        >
          <div className="overflow-visible min-h-0">
            <BlocksContainer
              blocks={sellerBlocks}
              onAdd={handleAdd("SELLER")}
              onRemove={handleRemove("SELLER")}
              onDataChange={handleDataChange("SELLER")}
              showValidation={validationTriggered.SELLER}
              touchedBlocks={touchedBlocks.SELLER}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="BUYER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0">
            <BlocksContainer
              blocks={buyerBlocks}
              onAdd={handleAdd("BUYER")}
              onRemove={handleRemove("BUYER")}
              onDataChange={handleDataChange("BUYER")}
              showValidation={validationTriggered.BUYER}
              touchedBlocks={touchedBlocks.BUYER}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="MODERATOR"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0">
            <BlocksContainer
              blocks={moderatorBlocks}
              onAdd={handleAdd("MODERATOR")}
              onRemove={handleRemove("MODERATOR")}
              onDataChange={handleDataChange("MODERATOR")}
              showValidation={validationTriggered.MODERATOR}
              touchedBlocks={touchedBlocks.MODERATOR}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation buttons */}
      <div className="pt-4 pb-4">
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
              disabled={
                isPending ||
                !formData.title.trim() ||
                !hasChanges ||
                !areAllBlocksValid(sellerBlocks) ||
                !areAllBlocksValid(buyerBlocks) ||
                !areAllBlocksValid(moderatorBlocks) ||
                sellerBlocks.length < 3 ||
                buyerBlocks.length < 1 ||
                moderatorBlocks.length < 1
              }
              className="flex-1 h-12"
            >
              {isPending ? "Обновление..." : "Обновить сценарий"}
            </Button>
          </div>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSubmitDialog}
        onClose={cancelSubmit}
        onConfirm={confirmSubmit}
        title="Подтверждение обновления"
        description={`Вы уверены, что хотите обновить сценарий ${formData.title}? Все изменения будут сохранены.`}
        userName={formData.title}
        confirmText="Обновить"
        isLoading={isPending}
        showCancelButton={false}
        severity="constructive"
      />
    </div>
  );
}
