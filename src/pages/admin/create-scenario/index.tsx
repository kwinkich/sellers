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
import { createYN50Scale, create1to5Scale } from "@/shared/lib/scaleUtils";

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

  // Split blocks into scenario (TEXT only) and evaluation (all other blocks) for each role
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

  // Create pre-built blocks when skills are loaded (only once) - these go in evaluation blocks
  useEffect(() => {
    if (skillsLoading || prebuiltInitialized.current || skills.length === 0)
      return;

    // Add MODERATOR pre-built block to evaluation blocks
    const moderatorSkillIds = PREBUILT_BLOCKS.MODERATOR.skillCodes
      .map((skillCode) => findSkillIdByCode(skillCode))
      .filter((id): id is number => id !== undefined);

    if (moderatorSkillIds.length > 0) {
      const prebuiltBlock: ExtendedBlockItem = {
        id: `MODERATOR-prebuilt-${Date.now()}`,
        type: PREBUILT_BLOCKS.MODERATOR.type,
        prebuiltSkills: moderatorSkillIds,
        selectedSkills: moderatorSkillIds,
        scaleOptionsMulti: create1to5Scale(["плохо", "хорошо", "отлично"]),
      };
      setModeratorEvaluationBlocks((prev) => [...prev, prebuiltBlock]);
    } else {
      console.warn(
        "No MODERATOR skills found for prebuilt block. Expected codes:",
        PREBUILT_BLOCKS.MODERATOR.skillCodes
      );
    }

    // Add BUYER pre-built block to evaluation blocks
    const buyerSkillIds = PREBUILT_BLOCKS.BUYER.skillCodes
      .map((skillCode) => findSkillIdByCode(skillCode))
      .filter((id): id is number => id !== undefined);

    if (buyerSkillIds.length > 0) {
      const prebuiltBlock: ExtendedBlockItem = {
        id: `BUYER-prebuilt-${Date.now()}`,
        type: PREBUILT_BLOCKS.BUYER.type,
        prebuiltSkills: buyerSkillIds,
        selectedSkills: buyerSkillIds,
        scaleOptionsMulti: create1to5Scale(["плохо", "хорошо", "отлично"]),
      };
      setBuyerEvaluationBlocks((prev) => [...prev, prebuiltBlock]);
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
    },
    [subTab]
  );

  const handleRemove = useCallback(
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

      // Update the appropriate blocks array
      if (role === "SELLER") {
        if (subTabKey === "scenario") {
          setSellerScenarioBlocks((prev) => updateById(prev, id, data));
        } else {
          setSellerEvaluationBlocks((prev) => updateById(prev, id, data));
        }
      } else if (role === "BUYER") {
        if (subTabKey === "scenario") {
          setBuyerScenarioBlocks((prev) => updateById(prev, id, data));
        } else {
          setBuyerEvaluationBlocks((prev) => updateById(prev, id, data));
        }
      } else if (role === "MODERATOR") {
        if (subTabKey === "scenario") {
          setModeratorScenarioBlocks((prev) => updateById(prev, id, data));
        } else {
          setModeratorEvaluationBlocks((prev) => updateById(prev, id, data));
        }
      }
    },
    [
      updateById,
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

  // Compute which tabs should be clickable based on current block validation
  // A tab becomes clickable when its evaluation sub-tab meets minimum requirements
  const clickableTabs = useMemo(() => {
    const isSellerEvaluationValid =
      sellerEvaluationBlocks.length >= 3 &&
      areAllBlocksValid(sellerEvaluationBlocks);
    const isBuyerEvaluationValid =
      buyerEvaluationBlocks.length >= 1 &&
      areAllBlocksValid(buyerEvaluationBlocks);

    return {
      SELLER: true, // SELLER is always clickable (it's the first tab)
      BUYER: isSellerEvaluationValid, // BUYER becomes clickable when SELLER evaluation is valid
      MODERATOR: isBuyerEvaluationValid && isSellerEvaluationValid, // MODERATOR becomes clickable when BUYER evaluation is valid
    };
  }, [sellerEvaluationBlocks, buyerEvaluationBlocks, areAllBlocksValid]);

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

  // Tab navigation helpers - now with sub-tab support
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

  // Handle tab click - only allow if tab is clickable
  const handleTabClick = useCallback(
    (tab: "SELLER" | "BUYER" | "MODERATOR") => {
      // Can always click current tab (no-op)
      if (tab === activeTab) return;

      // Can click if tab is marked as clickable
      if (clickableTabs[tab]) {
        setActiveTab(tab);
        setSubTab((prev) => ({ ...prev, [tab]: "scenario" }));
      }
    },
    [activeTab, clickableTabs]
  );

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

  // Check if create scenario button should be enabled (all roles must have required blocks)
  const isCreateScenarioEnabled = useCallback(() => {
    // Scenario blocks can be empty (will be skipped) or valid if they have blocks
    const hasValidSellerScenario =
      sellerScenarioBlocks.length === 0 ||
      areAllBlocksValid(sellerScenarioBlocks);
    const hasValidBuyerScenario =
      buyerScenarioBlocks.length === 0 ||
      areAllBlocksValid(buyerScenarioBlocks);
    const hasValidModeratorScenario =
      moderatorScenarioBlocks.length === 0 ||
      areAllBlocksValid(moderatorScenarioBlocks);

    // Evaluation blocks have minimum requirements (always required)
    const hasValidSellerEvaluation =
      sellerEvaluationBlocks.length >= 3 &&
      areAllBlocksValid(sellerEvaluationBlocks);
    const hasValidBuyerEvaluation =
      buyerEvaluationBlocks.length >= 1 &&
      areAllBlocksValid(buyerEvaluationBlocks);
    const hasValidModeratorEvaluation =
      moderatorEvaluationBlocks.length >= 1 &&
      areAllBlocksValid(moderatorEvaluationBlocks);

    const enabled =
      hasValidSellerScenario &&
      hasValidSellerEvaluation &&
      hasValidBuyerScenario &&
      hasValidBuyerEvaluation &&
      hasValidModeratorScenario &&
      hasValidModeratorEvaluation &&
      formData.title.trim().length > 0;

    return enabled;
  }, [
    sellerScenarioBlocks,
    sellerEvaluationBlocks,
    buyerScenarioBlocks,
    buyerEvaluationBlocks,
    moderatorScenarioBlocks,
    moderatorEvaluationBlocks,
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
      // Build forms array - skip scenario forms if they have 0 blocks
      const forms: CreateScenarioRequest["forms"] = [];

      // SELLER forms
      if (sellerScenarioBlocks.length > 0) {
        forms.push({
          role: "SELLER",
          type: "SCENARIO",
          title: "Сценарная часть продавца",
          descr: "Сценарная часть для продавца",
          blocks: convertBlocksToFormBlocks(sellerScenarioBlocks),
        });
      }
      forms.push({
        role: "SELLER",
        type: "EVALUATION",
        title: "Оценочная часть продавца",
        descr: "Оценочная часть для продавца",
        blocks: convertBlocksToFormBlocks(sellerEvaluationBlocks),
      });

      // BUYER forms
      if (buyerScenarioBlocks.length > 0) {
        forms.push({
          role: "BUYER",
          type: "SCENARIO",
          title: "Сценарная часть покупателя",
          descr: "Сценарная часть для покупателя",
          blocks: convertBlocksToFormBlocks(buyerScenarioBlocks),
        });
      }
      forms.push({
        role: "BUYER",
        type: "EVALUATION",
        title: "Оценочная часть покупателя",
        descr: "Оценочная часть для покупателя",
        blocks: convertBlocksToFormBlocks(buyerEvaluationBlocks),
      });

      // MODERATOR forms
      if (moderatorScenarioBlocks.length > 0) {
        forms.push({
          role: "MODERATOR",
          type: "SCENARIO",
          title: "Сценарная часть модератора",
          descr: "Сценарная часть для модератора",
          blocks: convertBlocksToFormBlocks(moderatorScenarioBlocks),
        });
      }
      forms.push({
        role: "MODERATOR",
        type: "EVALUATION",
        title: "Оценочная часть модератора",
        descr: "Оценочная часть для модератора",
        blocks: convertBlocksToFormBlocks(moderatorEvaluationBlocks),
      });

      const requestData: CreateScenarioRequest = {
        title: formData.title,
        forms,
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
    sellerScenarioBlocks,
    sellerEvaluationBlocks,
    buyerScenarioBlocks,
    buyerEvaluationBlocks,
    moderatorScenarioBlocks,
    moderatorEvaluationBlocks,
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
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              handleTabClick(value as "SELLER" | "BUYER" | "MODERATOR")
            }
          >
            <div className="sticky top-0 bg-white z-50">
              <TabsList variant="second" className="grid grid-cols-3 w-full">
                <TabsTrigger
                  variant="second"
                  value="SELLER"
                  className={
                    activeTab !== "SELLER" && !clickableTabs.SELLER
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {getRoleLabel("SELLER")}
                </TabsTrigger>
                <TabsTrigger
                  variant="second"
                  value="BUYER"
                  className={
                    activeTab !== "BUYER" && !clickableTabs.BUYER
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {getRoleLabel("BUYER")}
                </TabsTrigger>
                <TabsTrigger
                  variant="second"
                  value="MODERATOR"
                  className={
                    activeTab !== "MODERATOR" && !clickableTabs.MODERATOR
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {getRoleLabel("MODERATOR")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="SELLER"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0 space-y-4">
                {/* Sub-tabs for Scenario and Evaluation */}
                <Tabs
                  value={subTab.SELLER}
                  onValueChange={(value) =>
                    setSubTab((prev) => ({
                      ...prev,
                      SELLER: value as "scenario" | "evaluation",
                    }))
                  }
                >
                  <TabsList
                    variant="second"
                    className="grid grid-cols-2 w-full"
                  >
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
                      onAdd={onAddSeller}
                      onRemove={onRemoveSeller}
                      onDataChange={onDataChangeSeller}
                      showValidation={validationTriggered.SELLER_scenario}
                      touchedBlocks={touchedBlocks.SELLER_scenario}
                      allowedBlockTypes={["TEXT"]}
                    />
                  </TabsContent>

                  <TabsContent value="evaluation" className="mt-4">
                    <BlocksContainer
                      blocks={sellerEvaluationBlocks}
                      onAdd={onAddSeller}
                      onRemove={onRemoveSeller}
                      onDataChange={onDataChangeSeller}
                      showValidation={validationTriggered.SELLER_evaluation}
                      touchedBlocks={touchedBlocks.SELLER_evaluation}
                    />
                    {sellerEvaluationBlocks.length < 3 && (
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        Необходимо добавить минимум 3 блока
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            <TabsContent
              value="BUYER"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0 space-y-4">
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Загрузка предустановленных блоков...
                    </p>
                  </div>
                ) : (
                  <Tabs
                    value={subTab.BUYER}
                    onValueChange={(value) =>
                      setSubTab((prev) => ({
                        ...prev,
                        BUYER: value as "scenario" | "evaluation",
                      }))
                    }
                  >
                    <TabsList
                      variant="second"
                      className="grid grid-cols-2 w-full"
                    >
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
                        onAdd={onAddBuyer}
                        onRemove={onRemoveBuyer}
                        onDataChange={onDataChangeBuyer}
                        showValidation={validationTriggered.BUYER_scenario}
                        touchedBlocks={touchedBlocks.BUYER_scenario}
                        allowedBlockTypes={["TEXT"]}
                      />
                    </TabsContent>

                    <TabsContent value="evaluation" className="mt-4">
                      <BlocksContainer
                        blocks={buyerEvaluationBlocks}
                        onAdd={onAddBuyer}
                        onRemove={onRemoveBuyer}
                        onDataChange={onDataChangeBuyer}
                        showValidation={validationTriggered.BUYER_evaluation}
                        touchedBlocks={touchedBlocks.BUYER_evaluation}
                      />
                      {buyerEvaluationBlocks.length < 1 && (
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                          Необходимо добавить минимум 1 блок
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="MODERATOR"
              className="pt-3 data-[state=inactive]:hidden"
            >
              <div className="overflow-visible min-h-0 space-y-4">
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Загрузка предустановленных блоков...
                    </p>
                  </div>
                ) : (
                  <Tabs
                    value={subTab.MODERATOR}
                    onValueChange={(value) =>
                      setSubTab((prev) => ({
                        ...prev,
                        MODERATOR: value as "scenario" | "evaluation",
                      }))
                    }
                  >
                    <TabsList
                      variant="second"
                      className="grid grid-cols-2 w-full"
                    >
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
                        onAdd={onAddModerator}
                        onRemove={onRemoveModerator}
                        onDataChange={onDataChangeModerator}
                        showValidation={validationTriggered.MODERATOR_scenario}
                        touchedBlocks={touchedBlocks.MODERATOR_scenario}
                        allowedBlockTypes={["TEXT"]}
                      />
                    </TabsContent>

                    <TabsContent value="evaluation" className="mt-4">
                      <BlocksContainer
                        blocks={moderatorEvaluationBlocks}
                        onAdd={onAddModerator}
                        onRemove={onRemoveModerator}
                        onDataChange={onDataChangeModerator}
                        showValidation={
                          validationTriggered.MODERATOR_evaluation
                        }
                        touchedBlocks={touchedBlocks.MODERATOR_evaluation}
                      />
                      {moderatorEvaluationBlocks.length < 1 && (
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                          Необходимо добавить минимум 1 блок
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
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
