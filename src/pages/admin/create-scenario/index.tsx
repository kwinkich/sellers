import { CreateScenarioForm } from "@/feature";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlocksContainer, type BlockKind, type ScenarioBlockItem } from "@/feature/admin-feature/create-scenario/ui/blocks/parts/BlocksContainer";
import { useState, useEffect, useMemo, useRef } from "react";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosMutationOptions } from "@/entities/scenarios/model/api/scenarios.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { CreateScenarioRequest } from "@/entities/scenarios/model/types/scenarios.types";

// Pre-built block configurations
const PREBUILT_BLOCKS = {
    MODERATOR: {
        skills: ["Презентация", "Закрытие сделки", "Работа с возражениями"],
        type: "SCALE_SKILL_MULTI" as BlockKind
    },
    BUYER: {
        skills: ["Выявление боли", "Понимание приоритетов", "Понимание ресурсов"],
        type: "SCALE_SKILL_MULTI" as BlockKind
    }
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
    scaleOptions?: Array<{ label: string; value: number; countsTowardsScore: boolean; ord: number }>;
    // For SCALE_SKILL_MULTI blocks
    selectedSkills?: number[];
    scaleOptionsMulti?: Array<{ label: string; value: number; countsTowardsScore: boolean; ord: number }>;
}

export const AdminScenariosCreatePage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    const [sellerBlocks, setSellerBlocks] = useState<ExtendedBlockItem[]>([]);
    const [buyerBlocks, setBuyerBlocks] = useState<ExtendedBlockItem[]>([]);
    const [moderatorBlocks, setModeratorBlocks] = useState<ExtendedBlockItem[]>([]);
    
    // Form data state
    const [formData, setFormData] = useState<{ title: string; caseIds: number[] }>({ title: "", caseIds: [] });
    
    // Track if pre-built blocks have been initialized
    const prebuiltInitialized = useRef(false);
    
    // Fetch skills to find IDs for pre-built blocks
    const { data: skillsData } = useQuery(skillsQueryOptions.list());
    const skills = useMemo(() => skillsData?.data || [], [skillsData]);
    
    // Find skill IDs by name
    const findSkillId = (name: string) => skills.find(s => s.name === name)?.id;
    
    // Create scenario mutation
    const { isPending } = useMutation({
        ...scenariosMutationOptions.create(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["scenarios"] });
            
            toast.success("Сценарий успешно создан", {
                description: `Сценарий "${data.data.title}" добавлен в систему`,
            });
            
            navigate("/admin/home");
        },
        onError: (error) => {
            console.error("Ошибка при создании сценария:", error);
            toast.error("Ошибка при создании сценария", {
                description: "Пожалуйста, проверьте введенные данные и попробуйте снова",
            });
        },
    });
    
    // Create pre-built blocks when skills are loaded (only once)
    useEffect(() => {
        if (skills.length === 0 || prebuiltInitialized.current) return;
        
        // Add MODERATOR pre-built block
        const moderatorSkillIds = PREBUILT_BLOCKS.MODERATOR.skills
            .map(skillName => findSkillId(skillName))
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
                    { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 }
                ]
            };
            setModeratorBlocks(prev => [...prev, prebuiltBlock]);
        }
        
        // Add BUYER pre-built block
        const buyerSkillIds = PREBUILT_BLOCKS.BUYER.skills
            .map(skillName => findSkillId(skillName))
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
                    { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 }
                ]
            };
            setBuyerBlocks(prev => [...prev, prebuiltBlock]);
        }
        
        // Mark as initialized
        prebuiltInitialized.current = true;
    }, [skills]);


    const handleAdd = (role: "SELLER" | "BUYER" | "MODERATOR") => (type: BlockKind) => {
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
                scaleOptionsMulti: []
            };
            
            // Initialize with default values based on block type
            if (t === "SCALE_SKILL_SINGLE") {
                baseItem.scaleOptions = [
                    { label: "НЕТ", value: -2, countsTowardsScore: true, ord: 0 },
                    { label: "50/50", value: -1, countsTowardsScore: true, ord: 1 },
                    { label: "ДА", value: 1, countsTowardsScore: true, ord: 2 },
                    { label: "?", value: 2, countsTowardsScore: false, ord: 3 }
                ];
            } else if (t === "SCALE_SKILL_MULTI") {
                baseItem.scaleOptionsMulti = [
                    { label: "плохо", value: -1, countsTowardsScore: true, ord: 0 },
                    { label: "хорошо", value: 0, countsTowardsScore: true, ord: 1 },
                    { label: "отлично", value: 1, countsTowardsScore: true, ord: 2 }
                ];
            }
            
            return baseItem;
        };
        
        if (role === "SELLER") setSellerBlocks((prev) => [...prev, createItem(type)]);
        if (role === "BUYER") setBuyerBlocks((prev) => [...prev, createItem(type)]);
        if (role === "MODERATOR") setModeratorBlocks((prev) => [...prev, createItem(type)]);
    };

    const handleRemove = (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string) => {
        if (role === "SELLER") setSellerBlocks((prev) => prev.filter((b) => b.id !== id));
        if (role === "BUYER") setBuyerBlocks((prev) => prev.filter((b) => b.id !== id));
        if (role === "MODERATOR") setModeratorBlocks((prev) => prev.filter((b) => b.id !== id));
    };

    const handleDataChange = (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string, data: any) => {
        const updateBlock = (blocks: ExtendedBlockItem[]) => 
            blocks.map(block => block.id === id ? { ...block, ...data } : block);

        if (role === "SELLER") setSellerBlocks(prev => updateBlock(prev));
        if (role === "BUYER") setBuyerBlocks(prev => updateBlock(prev));
        if (role === "MODERATOR") setModeratorBlocks(prev => updateBlock(prev));
    };
    
    const handleSubmit = () => {
        if (!formData.title.trim()) {
            toast.error("Ошибка валидации", {
                description: "Название сценария обязательно",
            });
            return;
        }
        
        // Convert blocks to proper format for API
        const convertBlocksToFormBlocks = (blocks: ExtendedBlockItem[], role: string): any[] => {
            return blocks.map((block, index) => {
                // Generate block title according to specification
                const blockTitle = block.type === "TEXT" || block.type === "QA" 
                    ? (block.type === "TEXT" ? block.textContent || "Текстовый блок" : block.questionContent || "Блок вопросов")
                    : `${formData.title.toUpperCase()}_${role}_${block.type}_${index}`;

                const baseBlock: any = {
                    type: block.type,
                    title: blockTitle,
                    helpText: "",
                    required: true,
                    position: index,
                    scale: { options: [] },
                    items: []
                };

                // Handle different block types with REAL data
                if (block.type === "TEXT") {
                    // TEXT blocks: use textContent as title, empty scale and items
                    baseBlock.title = block.textContent || "Текстовый блок";
                    baseBlock.scale = { options: [] };
                    baseBlock.items = [];
                } else if (block.type === "QA") {
                    // QA blocks: use questionContent as title, empty scale and items
                    baseBlock.title = block.questionContent || "Блок вопросов";
                    baseBlock.scale = { options: [] };
                    baseBlock.items = [];
                } else if (block.type === "SCALE_SKILL_SINGLE") {
                    // SCALE_SKILL_SINGLE: use real scale options and questions
                    baseBlock.scale = {
                        options: (block.scaleOptions || []).map((opt, ord) => ({
                            ord,
                            label: opt.label,
                            value: opt.value,
                            countsTowardsScore: opt.countsTowardsScore
                        }))
                    };
                    // Items are questions with the same skillId
                    baseBlock.items = (block.questions || []).map((q, pos) => ({
                        title: q.text,
                        position: pos,
                        skillId: block.selectedSkillId || 1
                    }));
                } else if (block.type === "SCALE_SKILL_MULTI") {
                    // SCALE_SKILL_MULTI: use real scale options and skills
                    baseBlock.scale = {
                        options: (block.scaleOptionsMulti || []).map((opt, ord) => ({
                            ord,
                            label: opt.label,
                            value: opt.value,
                            countsTowardsScore: opt.countsTowardsScore
                        }))
                    };
                    // Items are skills (skill names as titles)
                    baseBlock.items = (block.selectedSkills || []).map((skillId, pos) => {
                        const skill = skills.find(s => s.id === skillId);
                        return {
                            title: skill?.name || `Навык ${skillId}`,
                            position: pos,
                            skillId: skillId
                        };
                    });
                }
                
                return baseBlock;
            });
        };
        
        const requestData: CreateScenarioRequest = {
            title: formData.title,
            caseIds: formData.caseIds.length > 0 ? formData.caseIds : undefined,
            forms: [
                {
                    role: "SELLER",
                    title: "Форма продавца",
                    descr: "Сценарий для продавца",
                    blocks: convertBlocksToFormBlocks(sellerBlocks, "SELLER")
                },
                {
                    role: "BUYER", 
                    title: "Форма покупателя",
                    descr: "Сценарий для покупателя",
                    blocks: convertBlocksToFormBlocks(buyerBlocks, "BUYER")
                },
                {
                    role: "MODERATOR",
                    title: "Форма модератора", 
                    descr: "Сценарий для модератора",
                    blocks: convertBlocksToFormBlocks(moderatorBlocks, "MODERATOR")
                }
            ]
        };
        
        console.log("=== CREATE SCENARIO REQUEST ===");
        console.log(JSON.stringify(requestData, null, 2));
        console.log("=== END REQUEST ===");
        
        toast.success("Request logged to console", {
            description: "Check browser console for the complete request schema",
        });
    };

	return (
		<div className="w-dvw h-dvh bg-white flex flex-col">
			<div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4">
				<HeadText head="Создание сценария" label="Добавьте новый сценарий" />
				<CreateScenarioForm onFormDataChange={setFormData} />
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-6 px-2 pb-32 min-h-full">
					<Tabs defaultValue="SELLER">
						<TabsList variant="second" className="grid grid-cols-3 w-full">
							<TabsTrigger variant="second" value="SELLER" >Продавец</TabsTrigger>
							<TabsTrigger variant="second" value="BUYER" >Покупатель</TabsTrigger>
							<TabsTrigger variant="second" value="MODERATOR" >Модератор</TabsTrigger>
						</TabsList>

						<TabsContent value="SELLER" className="pt-3 data-[state=inactive]:hidden" forceMount>
                            <BlocksContainer 
                                blocks={sellerBlocks} 
                                onAdd={handleAdd("SELLER")} 
                                onRemove={handleRemove("SELLER")} 
                                onDataChange={handleDataChange("SELLER")}
                            />
						</TabsContent>
						<TabsContent value="BUYER" className="pt-3 data-[state=inactive]:hidden" forceMount>
                            <BlocksContainer 
                                blocks={buyerBlocks} 
                                onAdd={handleAdd("BUYER")} 
                                onRemove={handleRemove("BUYER")} 
                                onDataChange={handleDataChange("BUYER")}
                            />
						</TabsContent>
						<TabsContent value="MODERATOR" className="pt-3 data-[state=inactive]:hidden" forceMount>
                            <BlocksContainer 
                                blocks={moderatorBlocks} 
                                onAdd={handleAdd("MODERATOR")} 
                                onRemove={handleRemove("MODERATOR")} 
                                onDataChange={handleDataChange("MODERATOR")}
                            />
						</TabsContent>
					</Tabs>
					
					{/* Submit button */}
					<div className="sticky bottom-0 bg-white pt-4 pb-4 border-t">
						<Button 
							onClick={handleSubmit}
							disabled={isPending || !formData.title.trim()}
							className="w-full h-12"
						>
							{isPending ? "Создание..." : "Создать сценарий"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};


