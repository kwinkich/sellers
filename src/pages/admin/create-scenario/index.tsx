import { CreateScenarioForm } from "@/feature";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlocksContainer, type BlockKind, type ScenarioBlockItem } from "@/feature/admin-feature/create-scenario/ui/blocks/parts/BlocksContainer";
import { useState, useEffect, useMemo, useRef } from "react";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";

// Pre-built block configurations
const PREBUILT_BLOCKS = {
    MODERATOR: {
        skills: ["Управление процессом", "Тайминг", "Обаяние"],
        type: "SCALE_SINGLE" as BlockKind
    },
    BUYER: {
        skills: ["Понимание ресурсов", "Эмоциональная достоверность", "Цельность образа"],
        type: "SCALE_SINGLE" as BlockKind
    }
};

export const AdminScenariosCreatePage = () => {
    const [sellerBlocks, setSellerBlocks] = useState<ScenarioBlockItem[]>([]);
    const [buyerBlocks, setBuyerBlocks] = useState<ScenarioBlockItem[]>([]);
    const [moderatorBlocks, setModeratorBlocks] = useState<ScenarioBlockItem[]>([]);
    
    // Track if pre-built blocks have been initialized
    const prebuiltInitialized = useRef(false);
    
    // Fetch skills to find IDs for pre-built blocks
    const { data: skillsData } = useQuery(skillsQueryOptions.list());
    const skills = useMemo(() => skillsData?.data || [], [skillsData]);
    
    // Find skill IDs by name
    const findSkillId = (name: string) => skills.find(s => s.name === name)?.id;
    
    // Create pre-built blocks when skills are loaded (only once)
    useEffect(() => {
        if (skills.length === 0 || prebuiltInitialized.current) return;
        
        // Add MODERATOR pre-built block
        const moderatorSkillIds = PREBUILT_BLOCKS.MODERATOR.skills
            .map(skillName => findSkillId(skillName))
            .filter((id): id is number => id !== undefined);
        
        if (moderatorSkillIds.length > 0) {
            const prebuiltBlock: ScenarioBlockItem = {
                id: `MODERATOR-prebuilt-${Date.now()}`,
                type: PREBUILT_BLOCKS.MODERATOR.type,
                prebuiltSkills: moderatorSkillIds
            };
            setModeratorBlocks(prev => [...prev, prebuiltBlock]);
        }
        
        // Add BUYER pre-built block
        const buyerSkillIds = PREBUILT_BLOCKS.BUYER.skills
            .map(skillName => findSkillId(skillName))
            .filter((id): id is number => id !== undefined);
        
        if (buyerSkillIds.length > 0) {
            const prebuiltBlock: ScenarioBlockItem = {
                id: `BUYER-prebuilt-${Date.now()}`,
                type: PREBUILT_BLOCKS.BUYER.type,
                prebuiltSkills: buyerSkillIds
            };
            setBuyerBlocks(prev => [...prev, prebuiltBlock]);
        }
        
        // Mark as initialized
        prebuiltInitialized.current = true;
    }, [skills]);


    const handleAdd = (role: "SELLER" | "BUYER" | "MODERATOR") => (type: BlockKind) => {
        const createItem = (t: BlockKind): ScenarioBlockItem => ({ id: `${role}-${t}-${Date.now()}`, type: t });
        if (role === "SELLER") setSellerBlocks((prev) => [...prev, createItem(type)]);
        if (role === "BUYER") setBuyerBlocks((prev) => [...prev, createItem(type)]);
        if (role === "MODERATOR") setModeratorBlocks((prev) => [...prev, createItem(type)]);
    };

    const handleRemove = (role: "SELLER" | "BUYER" | "MODERATOR") => (id: string) => {
        if (role === "SELLER") setSellerBlocks((prev) => prev.filter((b) => b.id !== id));
        if (role === "BUYER") setBuyerBlocks((prev) => prev.filter((b) => b.id !== id));
        if (role === "MODERATOR") setModeratorBlocks((prev) => prev.filter((b) => b.id !== id));
    };

	return (
		<div className="w-dvw h-dvh bg-white flex flex-col">
			<div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4">
				<HeadText head="Создание сценария" label="Добавьте новый сценарий" />
				<CreateScenarioForm />
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
                            <BlocksContainer blocks={sellerBlocks} onAdd={handleAdd("SELLER")} onRemove={handleRemove("SELLER")} />
						</TabsContent>
						<TabsContent value="BUYER" className="pt-3 data-[state=inactive]:hidden" forceMount>
                            <BlocksContainer blocks={buyerBlocks} onAdd={handleAdd("BUYER")} onRemove={handleRemove("BUYER")} />
						</TabsContent>
						<TabsContent value="MODERATOR" className="pt-3 data-[state=inactive]:hidden" forceMount>
                            <BlocksContainer blocks={moderatorBlocks} onAdd={handleAdd("MODERATOR")} onRemove={handleRemove("MODERATOR")} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};


