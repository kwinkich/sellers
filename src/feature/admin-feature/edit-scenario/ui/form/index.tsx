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
import type { UpdateScenarioRequest } from "@/entities/scenarios/model/types/scenarios.types";
import WebApp from "@twa-dev/sdk";
import { scenariosQueryOptions } from "@/entities";
import { createYN50Scale, create1to5Scale } from "@/shared/lib/scaleUtils";

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

  // Split blocks into scenario and evaluation for each role
  const [sellerScenarioBlocks, setSellerScenarioBlocks] = useState<
    ExtendedBlockItem[]
  >([]);
  const [sellerEvaluationBlocks, setSellerEvaluationBlocks] = useState<
    ExtendedBlockItem[]
  >([]);
  const [buyerScenarioBlocks, setBuyerScenarioBlocks] = useState<
    ExtendedBlockItem[]
  >([]);
  const [buyerEvaluationBlocks, setBuyerEvaluationBlocks] = useState<
    ExtendedBlockItem[]
  >([]);
  const [moderatorScenarioBlocks, setModeratorScenarioBlocks] = useState<
    ExtendedBlockItem[]
  >([]);
  const [moderatorEvaluationBlocks, setModeratorEvaluationBlocks] = useState<
    ExtendedBlockItem[]
  >([]);

  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
  }>({ title: "" });

  // Active tab state
  const [activeTab, setActiveTab] = useState<"SELLER" | "BUYER" | "MODERATOR">(
    "SELLER"
  );

  // Sub-tab state for each role: "scenario" or "evaluation"
  const [subTab, setSubTab] = useState<{
    SELLER: "scenario" | "evaluation";
    BUYER: "scenario" | "evaluation";
    MODERATOR: "scenario" | "evaluation";
  }>({
    SELLER: "scenario",
    BUYER: "scenario",
    MODERATOR: "scenario",
  });

  // Track validation triggers per tab and sub-tab
  const [validationTriggered, setValidationTriggered] = useState({
    SELLER_scenario: false,
    SELLER_evaluation: false,
    BUYER_scenario: false,
    BUYER_evaluation: false,
    MODERATOR_scenario: false,
    MODERATOR_evaluation: false,
  });

  // Track which blocks have been edited/touched (per tab and sub-tab)
  const [touchedBlocks, setTouchedBlocks] = useState<{
    SELLER_scenario: Set<string>;
    SELLER_evaluation: Set<string>;
    BUYER_scenario: Set<string>;
    BUYER_evaluation: Set<string>;
    MODERATOR_scenario: Set<string>;
    MODERATOR_evaluation: Set<string>;
  }>({
    SELLER_scenario: new Set(),
    SELLER_evaluation: new Set(),
    BUYER_scenario: new Set(),
    BUYER_evaluation: new Set(),
    MODERATOR_scenario: new Set(),
    MODERATOR_evaluation: new Set(),
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
        role: string,
        formType: "scenario" | "evaluation"
      ): ExtendedBlockItem[] => {
        return blocks.map((block) => {
          const baseItem: ExtendedBlockItem = {
            id: `${role}-${formType}-${block.type}-${
              block.position
            }-${Date.now()}`,
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
                id: `${role}-${formType}-q-${idx}-${Date.now()}`,
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

      // Split forms by role and type
      const sellerScenarioForm = scenario.forms.find(
        (f) => f.role === "SELLER" && f.type === "SCENARIO"
      );
      const sellerEvaluationForm = scenario.forms.find(
        (f) => f.role === "SELLER" && f.type === "EVALUATION"
      );
      const buyerScenarioForm = scenario.forms.find(
        (f) => f.role === "BUYER" && f.type === "SCENARIO"
      );
      const buyerEvaluationForm = scenario.forms.find(
        (f) => f.role === "BUYER" && f.type === "EVALUATION"
      );
      const moderatorScenarioForm = scenario.forms.find(
        (f) => f.role === "MODERATOR" && f.type === "SCENARIO"
      );
      const moderatorEvaluationForm = scenario.forms.find(
        (f) => f.role === "MODERATOR" && f.type === "EVALUATION"
      );

      setSellerScenarioBlocks(
        convertApiBlocksToExtended(
          sellerScenarioForm?.blocks || [],
          "SELLER",
          "scenario"
        )
      );
      setSellerEvaluationBlocks(
        convertApiBlocksToExtended(
          sellerEvaluationForm?.blocks || [],
          "SELLER",
          "evaluation"
        )
      );
      setBuyerScenarioBlocks(
        convertApiBlocksToExtended(
          buyerScenarioForm?.blocks || [],
          "BUYER",
          "scenario"
        )
      );
      setBuyerEvaluationBlocks(
        convertApiBlocksToExtended(
          buyerEvaluationForm?.blocks || [],
          "BUYER",
          "evaluation"
        )
      );
      setModeratorScenarioBlocks(
        convertApiBlocksToExtended(
          moderatorScenarioForm?.blocks || [],
          "MODERATOR",
          "scenario"
        )
      );
      setModeratorEvaluationBlocks(
        convertApiBlocksToExtended(
          moderatorEvaluationForm?.blocks || [],
          "MODERATOR",
          "evaluation"
        )
      );

      // Store original data for change detection
      originalDataRef.current = {
        title: scenario.title,
        sellerScenarioBlocks: convertApiBlocksToExtended(
          sellerScenarioForm?.blocks || [],
          "SELLER",
          "scenario"
        ),
        sellerEvaluationBlocks: convertApiBlocksToExtended(
          sellerEvaluationForm?.blocks || [],
          "SELLER",
          "evaluation"
        ),
        buyerScenarioBlocks: convertApiBlocksToExtended(
          buyerScenarioForm?.blocks || [],
          "BUYER",
          "scenario"
        ),
        buyerEvaluationBlocks: convertApiBlocksToExtended(
          buyerEvaluationForm?.blocks || [],
          "BUYER",
          "evaluation"
        ),
        moderatorScenarioBlocks: convertApiBlocksToExtended(
          moderatorScenarioForm?.blocks || [],
          "MODERATOR",
          "scenario"
        ),
        moderatorEvaluationBlocks: convertApiBlocksToExtended(
          moderatorEvaluationForm?.blocks || [],
          "MODERATOR",
          "evaluation"
        ),
        // Track which forms existed originally
        originalForms: {
          sellerScenario: !!sellerScenarioForm,
          sellerEvaluation: !!sellerEvaluationForm,
          buyerScenario: !!buyerScenarioForm,
          buyerEvaluation: !!buyerEvaluationForm,
          moderatorScenario: !!moderatorScenarioForm,
          moderatorEvaluation: !!moderatorEvaluationForm,
        },
        // Store original blocks for ID reference
        originalBlocks: {
          sellerScenario: convertApiBlocksToExtended(
            sellerScenarioForm?.blocks || [],
            "SELLER",
            "scenario"
          ),
          sellerEvaluation: convertApiBlocksToExtended(
            sellerEvaluationForm?.blocks || [],
            "SELLER",
            "evaluation"
          ),
          buyerScenario: convertApiBlocksToExtended(
            buyerScenarioForm?.blocks || [],
            "BUYER",
            "scenario"
          ),
          buyerEvaluation: convertApiBlocksToExtended(
            buyerEvaluationForm?.blocks || [],
            "BUYER",
            "evaluation"
          ),
          moderatorScenario: convertApiBlocksToExtended(
            moderatorScenarioForm?.blocks || [],
            "MODERATOR",
            "scenario"
          ),
          moderatorEvaluation: convertApiBlocksToExtended(
            moderatorEvaluationForm?.blocks || [],
            "MODERATOR",
            "evaluation"
          ),
        },
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
        sellerScenarioBlocks,
        sellerEvaluationBlocks,
        buyerScenarioBlocks,
        buyerEvaluationBlocks,
        moderatorScenarioBlocks,
        moderatorEvaluationBlocks,
      };

      const hasChangesValue =
        JSON.stringify(currentData) !== JSON.stringify(originalDataRef.current);
      setHasChanges(hasChangesValue);
      onFormChange?.(hasChangesValue);
    }
  }, [
    formData,
    sellerScenarioBlocks,
    sellerEvaluationBlocks,
    buyerScenarioBlocks,
    buyerEvaluationBlocks,
    moderatorScenarioBlocks,
    moderatorEvaluationBlocks,
    onFormChange,
  ]);

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
      const createItem = (
        t: BlockKind,
        formType: "scenario" | "evaluation"
      ): ExtendedBlockItem => {
        const baseItem: ExtendedBlockItem = {
          id: `${role}-${formType}-${t}-${Date.now()}`,
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
          // Используем функцию для генерации правильных значений
          baseItem.scaleOptions = createYN50Scale();
        } else if (t === "SCALE_SKILL_MULTI") {
          // Используем функцию для генерации правильных значений
          baseItem.scaleOptionsMulti = create1to5Scale([
            "плохо",
            "хорошо",
            "отлично",
          ]);
        }

        return baseItem;
      };

      // Route based on CURRENT SUB-TAB, not block type
      const currentSubTab = subTab[role];
      const newItem = createItem(type, currentSubTab);

      // Add to scenario or evaluation based on which sub-tab is currently active
      if (role === "SELLER") {
        if (currentSubTab === "scenario") {
          setSellerScenarioBlocks((prev) => [...prev, newItem]);
        } else {
          setSellerEvaluationBlocks((prev) => [...prev, newItem]);
        }
      } else if (role === "BUYER") {
        if (currentSubTab === "scenario") {
          setBuyerScenarioBlocks((prev) => [...prev, newItem]);
        } else {
          setBuyerEvaluationBlocks((prev) => [...prev, newItem]);
        }
      } else if (role === "MODERATOR") {
        if (currentSubTab === "scenario") {
          setModeratorScenarioBlocks((prev) => [...prev, newItem]);
        } else {
          setModeratorEvaluationBlocks((prev) => [...prev, newItem]);
        }
      }
    };

  const handleRemove =
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string) => {
      // Remove from the correct array based on ID (which includes formType)
      // ID format: `${role}-${formType}-${type}-${timestamp}`
      if (id.includes("-scenario-")) {
        // Remove from scenario blocks
        if (role === "SELLER") {
          setSellerScenarioBlocks((prev) => prev.filter((b) => b.id !== id));
        } else if (role === "BUYER") {
          setBuyerScenarioBlocks((prev) => prev.filter((b) => b.id !== id));
        } else if (role === "MODERATOR") {
          setModeratorScenarioBlocks((prev) => prev.filter((b) => b.id !== id));
        }
      } else if (id.includes("-evaluation-")) {
        // Remove from evaluation blocks
        if (role === "SELLER") {
          setSellerEvaluationBlocks((prev) => prev.filter((b) => b.id !== id));
        } else if (role === "BUYER") {
          setBuyerEvaluationBlocks((prev) => prev.filter((b) => b.id !== id));
        } else if (role === "MODERATOR") {
          setModeratorEvaluationBlocks((prev) =>
            prev.filter((b) => b.id !== id)
          );
        }
      }
    };

  const handleDataChange = useCallback(
    (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string, data: any) => {
      // Helper to find which array contains this block
      const findBlockLocation = () => {
        if (role === "SELLER") {
          const inScenario = sellerScenarioBlocks.some((b) => b.id === id);
          return inScenario ? "scenario" : "evaluation";
        } else if (role === "BUYER") {
          const inScenario = buyerScenarioBlocks.some((b) => b.id === id);
          return inScenario ? "scenario" : "evaluation";
        } else {
          const inScenario = moderatorScenarioBlocks.some((b) => b.id === id);
          return inScenario ? "scenario" : "evaluation";
        }
      };

      const subTabKey = findBlockLocation();
      const touchKey = `${role}_${subTabKey}` as keyof typeof touchedBlocks;

      // Mark block as touched/edited
      setTouchedBlocks((prev) => ({
        ...prev,
        [touchKey]: new Set(prev[touchKey]).add(id),
      }));

      const updateBlock = (blocks: ExtendedBlockItem[]) =>
        blocks.map((block) =>
          block.id === id ? { ...block, ...data } : block
        );

      // Update the appropriate blocks array
      if (role === "SELLER") {
        if (subTabKey === "scenario") {
          setSellerScenarioBlocks((prev) => updateBlock(prev));
        } else {
          setSellerEvaluationBlocks((prev) => updateBlock(prev));
        }
      } else if (role === "BUYER") {
        if (subTabKey === "scenario") {
          setBuyerScenarioBlocks((prev) => updateBlock(prev));
        } else {
          setBuyerEvaluationBlocks((prev) => updateBlock(prev));
        }
      } else if (role === "MODERATOR") {
        if (subTabKey === "scenario") {
          setModeratorScenarioBlocks((prev) => updateBlock(prev));
        } else {
          setModeratorEvaluationBlocks((prev) => updateBlock(prev));
        }
      }
    },
    [
      subTab,
      sellerScenarioBlocks,
      sellerEvaluationBlocks,
      buyerScenarioBlocks,
      buyerEvaluationBlocks,
      moderatorScenarioBlocks,
      moderatorEvaluationBlocks,
    ]
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

  // Helper to get current blocks based on role and sub-tab
  const getCurrentBlocks = useCallback(
    (
      role: "SELLER" | "BUYER" | "MODERATOR",
      subTabType: "scenario" | "evaluation"
    ) => {
      if (role === "SELLER") {
        return subTabType === "scenario"
          ? sellerScenarioBlocks
          : sellerEvaluationBlocks;
      } else if (role === "BUYER") {
        return subTabType === "scenario"
          ? buyerScenarioBlocks
          : buyerEvaluationBlocks;
      } else {
        return subTabType === "scenario"
          ? moderatorScenarioBlocks
          : moderatorEvaluationBlocks;
      }
    },
    [
      sellerScenarioBlocks,
      sellerEvaluationBlocks,
      buyerScenarioBlocks,
      buyerEvaluationBlocks,
      moderatorScenarioBlocks,
      moderatorEvaluationBlocks,
    ]
  );

  // Tab navigation helpers
  const handleNextTab = useCallback(() => {
    const currentSubTab = subTab[activeTab];
    const currentBlocks = getCurrentBlocks(activeTab, currentSubTab);
    const validationKey =
      `${activeTab}_${currentSubTab}` as keyof typeof validationTriggered;

    // Validate blocks
    const invalidBlockIndex = currentBlocks.findIndex(
      (block) => !validateBlock(block)
    );

    // Trigger validation for current sub-tab
    setValidationTriggered((prev) => ({ ...prev, [validationKey]: true }));

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
      return; // Don't proceed
    }

    // All blocks are valid, proceed to next sub-tab or next role tab
    if (currentSubTab === "scenario") {
      // Move to evaluation sub-tab of same role
      setSubTab((prev) => ({ ...prev, [activeTab]: "evaluation" }));
    } else {
      // Move to next role's scenario sub-tab
      if (activeTab === "SELLER") {
        setActiveTab("BUYER");
        setSubTab((prev) => ({ ...prev, BUYER: "scenario" }));
      } else if (activeTab === "BUYER") {
        setActiveTab("MODERATOR");
        setSubTab((prev) => ({ ...prev, MODERATOR: "scenario" }));
      }
    }
  }, [activeTab, subTab, getCurrentBlocks, validateBlock]);

  const handlePrevTab = useCallback(() => {
    const currentSubTab = subTab[activeTab];

    if (currentSubTab === "evaluation") {
      // Go back to scenario sub-tab of same role
      setSubTab((prev) => ({ ...prev, [activeTab]: "scenario" }));
    } else {
      // Go back to previous role's evaluation sub-tab
      if (activeTab === "BUYER") {
        setActiveTab("SELLER");
        setSubTab((prev) => ({ ...prev, SELLER: "evaluation" }));
      } else if (activeTab === "MODERATOR") {
        setActiveTab("BUYER");
        setSubTab((prev) => ({ ...prev, BUYER: "evaluation" }));
      }
    }
  }, [activeTab, subTab]);

  // Check if there are any invalid blocks across all tabs
  const hasInvalidBlocks = useMemo(() => {
    const checkBlocks = (blocks: ExtendedBlockItem[]) => {
      return blocks.some((block) => !validateBlock(block));
    };

    return (
      checkBlocks(sellerScenarioBlocks) ||
      checkBlocks(sellerEvaluationBlocks) ||
      checkBlocks(buyerScenarioBlocks) ||
      checkBlocks(buyerEvaluationBlocks) ||
      checkBlocks(moderatorScenarioBlocks) ||
      checkBlocks(moderatorEvaluationBlocks)
    );
  }, [
    sellerScenarioBlocks,
    sellerEvaluationBlocks,
    buyerScenarioBlocks,
    buyerEvaluationBlocks,
    moderatorScenarioBlocks,
    moderatorEvaluationBlocks,
    validateBlock,
  ]);

  // Check if next button should be enabled
  const isNextEnabled = useCallback(() => {
    const currentSubTab = subTab[activeTab];
    const currentBlocks = getCurrentBlocks(activeTab, currentSubTab);

    // For scenario blocks, no validation required - can be empty
    if (currentSubTab === "scenario") {
      // If there are blocks, they must be valid
      if (currentBlocks.length === 0) return true;
      return areAllBlocksValid(currentBlocks);
    }

    // For evaluation blocks, apply minimum block requirements
    if (currentSubTab === "evaluation") {
      const minBlocks = activeTab === "SELLER" ? 3 : 1;
      if (currentBlocks.length < minBlocks) return false;
      return areAllBlocksValid(currentBlocks);
    }

    return false;
  }, [activeTab, subTab, getCurrentBlocks, areAllBlocksValid]);

  // Handle tab change with validation
  const handleTabChange = useCallback(
    (value: string) => {
      // If there are invalid blocks, trigger validation and block tab change
      if (hasInvalidBlocks) {
        // Trigger validation for all sub-tabs
        setValidationTriggered({
          SELLER_scenario: true,
          SELLER_evaluation: true,
          BUYER_scenario: true,
          BUYER_evaluation: true,
          MODERATOR_scenario: true,
          MODERATOR_evaluation: true,
        });
        return; // Block tab change
      }
      // Allow tab change if no invalid blocks
      setActiveTab(value as "SELLER" | "BUYER" | "MODERATOR");
    },
    [hasInvalidBlocks]
  );

  const handleSubmit = useCallback(() => {
    // Validate all blocks before submitting
    const sellerScenarioValid =
      sellerScenarioBlocks.length === 0 ||
      areAllBlocksValid(sellerScenarioBlocks);
    const sellerEvaluationValid =
      sellerEvaluationBlocks.length >= 3 &&
      areAllBlocksValid(sellerEvaluationBlocks);
    const buyerScenarioValid =
      buyerScenarioBlocks.length === 0 ||
      areAllBlocksValid(buyerScenarioBlocks);
    const buyerEvaluationValid =
      buyerEvaluationBlocks.length >= 1 &&
      areAllBlocksValid(buyerEvaluationBlocks);
    const moderatorScenarioValid =
      moderatorScenarioBlocks.length === 0 ||
      areAllBlocksValid(moderatorScenarioBlocks);
    const moderatorEvaluationValid =
      moderatorEvaluationBlocks.length >= 1 &&
      areAllBlocksValid(moderatorEvaluationBlocks);

    const allTabsValid =
      sellerScenarioValid &&
      sellerEvaluationValid &&
      buyerScenarioValid &&
      buyerEvaluationValid &&
      moderatorScenarioValid &&
      moderatorEvaluationValid;

    if (!formData.title.trim()) {
      handleFormError("Ошибка валидации", "Заполните название сценария");
      return;
    }

    if (!allTabsValid) {
      // Trigger validation for all sub-tabs
      setValidationTriggered({
        SELLER_scenario: true,
        SELLER_evaluation: true,
        BUYER_scenario: true,
        BUYER_evaluation: true,
        MODERATOR_scenario: true,
        MODERATOR_evaluation: true,
      });

      // Find first invalid block across all tabs
      let firstInvalidBlock: ExtendedBlockItem | null = null;
      let firstInvalidTab: "SELLER" | "BUYER" | "MODERATOR" = "SELLER";

      if (!sellerEvaluationValid) {
        firstInvalidBlock =
          sellerEvaluationBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "SELLER";
        setSubTab((prev) => ({ ...prev, SELLER: "evaluation" }));
      } else if (!buyerEvaluationValid) {
        firstInvalidBlock =
          buyerEvaluationBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "BUYER";
        setSubTab((prev) => ({ ...prev, BUYER: "evaluation" }));
      } else if (!moderatorEvaluationValid) {
        firstInvalidBlock =
          moderatorEvaluationBlocks.find((b) => !validateBlock(b)) || null;
        firstInvalidTab = "MODERATOR";
        setSubTab((prev) => ({ ...prev, MODERATOR: "evaluation" }));
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
    sellerScenarioBlocks,
    sellerEvaluationBlocks,
    buyerScenarioBlocks,
    buyerEvaluationBlocks,
    moderatorScenarioBlocks,
    moderatorEvaluationBlocks,
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

    // Build forms array - only include forms that existed originally OR have blocks now
    const originalForms = originalDataRef.current?.originalForms;
    const forms: UpdateScenarioRequest["forms"] = [];

    // SELLER forms
    // Scenario form: include if it existed originally OR if it has blocks now
    if (originalForms?.sellerScenario || sellerScenarioBlocks.length > 0) {
      forms.push({
        role: "SELLER",
        type: "SCENARIO",
        title: "Сценарная часть продавца",
        descr: "Сценарная часть для продавца",
        blocks: convertBlocksToFormBlocks(sellerScenarioBlocks),
      });
    }
    // Evaluation form: always include (required)
    forms.push({
      role: "SELLER",
      type: "EVALUATION",
      title: "Оценочная часть продавца",
      descr: "Оценочная часть для продавца",
      blocks: convertBlocksToFormBlocks(sellerEvaluationBlocks),
    });

    // BUYER forms
    // Scenario form: include if it existed originally OR if it has blocks now
    if (originalForms?.buyerScenario || buyerScenarioBlocks.length > 0) {
      forms.push({
        role: "BUYER",
        type: "SCENARIO",
        title: "Сценарная часть покупателя",
        descr: "Сценарная часть для покупателя",
        blocks: convertBlocksToFormBlocks(buyerScenarioBlocks),
      });
    }
    // Evaluation form: always include (required)
    forms.push({
      role: "BUYER",
      type: "EVALUATION",
      title: "Оценочная часть покупателя",
      descr: "Оценочная часть для покупателя",
      blocks: convertBlocksToFormBlocks(buyerEvaluationBlocks),
    });

    // MODERATOR forms
    // Scenario form: include if it existed originally OR if it has blocks now
    if (
      originalForms?.moderatorScenario ||
      moderatorScenarioBlocks.length > 0
    ) {
      forms.push({
        role: "MODERATOR",
        type: "SCENARIO",
        title: "Сценарная часть модератора",
        descr: "Сценарная часть для модератора",
        blocks: convertBlocksToFormBlocks(moderatorScenarioBlocks),
      });
    }
    // Evaluation form: always include (required)
    forms.push({
      role: "MODERATOR",
      type: "EVALUATION",
      title: "Оценочная часть модератора",
      descr: "Оценочная часть для модератора",
      blocks: convertBlocksToFormBlocks(moderatorEvaluationBlocks),
    });

    const requestData: UpdateScenarioRequest = {
      title: formData.title,
      forms,
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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="sticky top-0 bg-white z-50 pb-2">
          <TabsList
            variant="second"
            className={`grid grid-cols-3 w-full ${
              hasInvalidBlocks ? "pointer-events-none opacity-50" : ""
            }`}
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
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs
              value={subTab.SELLER}
              onValueChange={(value) =>
                setSubTab((prev) => ({
                  ...prev,
                  SELLER: value as "scenario" | "evaluation",
                }))
              }
            >
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарная часть
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочная часть
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <BlocksContainer
                  blocks={sellerScenarioBlocks}
                  onAdd={handleAdd("SELLER")}
                  onRemove={handleRemove("SELLER")}
                  onDataChange={handleDataChange("SELLER")}
                  showValidation={validationTriggered.SELLER_scenario}
                  touchedBlocks={touchedBlocks.SELLER_scenario}
                  allowedBlockTypes={["TEXT"]}
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <BlocksContainer
                  blocks={sellerEvaluationBlocks}
                  onAdd={handleAdd("SELLER")}
                  onRemove={handleRemove("SELLER")}
                  onDataChange={handleDataChange("SELLER")}
                  showValidation={validationTriggered.SELLER_evaluation}
                  touchedBlocks={touchedBlocks.SELLER_evaluation}
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent
          value="BUYER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs
              value={subTab.BUYER}
              onValueChange={(value) =>
                setSubTab((prev) => ({
                  ...prev,
                  BUYER: value as "scenario" | "evaluation",
                }))
              }
            >
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарная часть
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочная часть
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <BlocksContainer
                  blocks={buyerScenarioBlocks}
                  onAdd={handleAdd("BUYER")}
                  onRemove={handleRemove("BUYER")}
                  onDataChange={handleDataChange("BUYER")}
                  showValidation={validationTriggered.BUYER_scenario}
                  touchedBlocks={touchedBlocks.BUYER_scenario}
                  allowedBlockTypes={["TEXT"]}
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <BlocksContainer
                  blocks={buyerEvaluationBlocks}
                  onAdd={handleAdd("BUYER")}
                  onRemove={handleRemove("BUYER")}
                  onDataChange={handleDataChange("BUYER")}
                  showValidation={validationTriggered.BUYER_evaluation}
                  touchedBlocks={touchedBlocks.BUYER_evaluation}
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent
          value="MODERATOR"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs
              value={subTab.MODERATOR}
              onValueChange={(value) =>
                setSubTab((prev) => ({
                  ...prev,
                  MODERATOR: value as "scenario" | "evaluation",
                }))
              }
            >
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарная часть
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочная часть
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <BlocksContainer
                  blocks={moderatorScenarioBlocks}
                  onAdd={handleAdd("MODERATOR")}
                  onRemove={handleRemove("MODERATOR")}
                  onDataChange={handleDataChange("MODERATOR")}
                  showValidation={validationTriggered.MODERATOR_scenario}
                  touchedBlocks={touchedBlocks.MODERATOR_scenario}
                  allowedBlockTypes={["TEXT"]}
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <BlocksContainer
                  blocks={moderatorEvaluationBlocks}
                  onAdd={handleAdd("MODERATOR")}
                  onRemove={handleRemove("MODERATOR")}
                  onDataChange={handleDataChange("MODERATOR")}
                  showValidation={validationTriggered.MODERATOR_evaluation}
                  touchedBlocks={touchedBlocks.MODERATOR_evaluation}
                />
              </TabsContent>
            </Tabs>
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
                !(
                  sellerScenarioBlocks.length === 0 ||
                  areAllBlocksValid(sellerScenarioBlocks)
                ) ||
                !(
                  sellerEvaluationBlocks.length >= 3 &&
                  areAllBlocksValid(sellerEvaluationBlocks)
                ) ||
                !(
                  buyerScenarioBlocks.length === 0 ||
                  areAllBlocksValid(buyerScenarioBlocks)
                ) ||
                !(
                  buyerEvaluationBlocks.length >= 1 &&
                  areAllBlocksValid(buyerEvaluationBlocks)
                ) ||
                !(
                  moderatorScenarioBlocks.length === 0 ||
                  areAllBlocksValid(moderatorScenarioBlocks)
                ) ||
                !(
                  moderatorEvaluationBlocks.length >= 1 &&
                  areAllBlocksValid(moderatorEvaluationBlocks)
                )
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
