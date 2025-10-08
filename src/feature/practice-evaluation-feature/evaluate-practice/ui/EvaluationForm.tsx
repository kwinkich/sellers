import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	EvaluationBlocks,
	EvaluationFooter,
	EvaluationHeader,
	EvaluationTabs,
} from "./index";

// Types for the evaluation page
export interface EvaluationFormData {
	role: "SELLER" | "BUYER" | "MODERATOR";
	title: string;
	descr: string;
	blocks: EvaluationBlock[];
}

export interface EvaluationBlock {
	type: "TEXT" | "QA" | "SCALE_SKILL_SINGLE" | "SCALE_SKILL_MULTI";
	title?: string;
	required: boolean;
	position: number;
	scale?: {
		options: Array<{
			ord: number;
			label: string;
			value: number;
			countsTowardsScore: boolean;
		}>;
	};
	items?: Array<{
		title: string;
		position: number;
		skillId: number;
	}>;
}

export interface EvaluationResponse {
	forms: EvaluationFormData[];
}

export const EvaluationForm = () => {
	const [activeTab, setActiveTab] = useState<string>("");
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [touchEnd, setTouchEnd] = useState<number | null>(null);

	// Fetch evaluation forms from backend
	const { data: evaluationData, isLoading } = useQuery({
		queryKey: ["evaluation-forms"],
		queryFn: async (): Promise<EvaluationResponse> => {
			// TODO: Replace with actual API call
			// const response = await API.get("/evaluation/forms");
			// return response.data;

			// Mock data for now
			return {
				forms: [
					{
						role: "SELLER",
						title: "Форма продавца",
						descr: "Оцените продавца",
						blocks: [
							{
								type: "TEXT",
								title:
									"Краткая инструкция по оценке: \n1. Оцените продавца\n2. Оцените продавца\n3. Оцените продавца\n4. Оцените продавца\n5. Оцените продавца",
								required: false,
								position: 0,
							},
							{
								type: "SCALE_SKILL_SINGLE",
								required: true,
								position: 1,
								scale: {
									options: [
										{
											ord: 0,
											label: "Нет",
											value: -2,
											countsTowardsScore: true,
										},
										{
											ord: 1,
											label: "50/50",
											value: -1,
											countsTowardsScore: true,
										},
										{ ord: 2, label: "Да", value: 1, countsTowardsScore: true },
										{ ord: 3, label: "?", value: 2, countsTowardsScore: false },
									],
								},
								items: [
									{
										title: "Хорошо ли человек рассказал?",
										position: 0,
										skillId: 9,
									},
									{
										title: "Хорошо ли человек рассказал?",
										position: 1,
										skillId: 9,
									},
									{
										title: "Хорошо ли человек рассказал?",
										position: 2,
										skillId: 9,
									},
								],
							},
							{
								type: "QA",
								title: "Ваш комментарий про покупателя:",
								required: true,
								position: 2,
							},
						],
					},
					{
						role: "BUYER",
						title: "Форма покупателя",
						descr: "Оцените покупателя",
						blocks: [
							{
								type: "TEXT",
								title:
									"Краткая инструкция по оценке: \n1. Оцените покупателя\n2. Оцените покупателя\n3. Оцените покупателя",
								required: false,
								position: 0,
							},
							{
								type: "QA",
								title: "Какой-то вопрос про покупателя?",
								required: true,
								position: 1,
							},
							{
								type: "QA",
								title: "Ваш комментарий про покупателя:",
								required: false,
								position: 2,
							},
						],
					},
					{
						role: "MODERATOR",
						title: "Форма модератора",
						descr: "Оцените модератора",
						blocks: [
							{
								type: "TEXT",
								title: "Краткая инструкция по оценке",
								required: false,
								position: 0,
							},
							{
								type: "SCALE_SKILL_MULTI",
								required: true,
								position: 1,
								scale: {
									options: [
										{
											ord: 0,
											label: "Плохо",
											value: -1,
											countsTowardsScore: true,
										},
										{
											ord: 1,
											label: "Хорошо",
											value: 0,
											countsTowardsScore: true,
										},
										{
											ord: 2,
											label: "Отлично",
											value: 1,
											countsTowardsScore: true,
										},
									],
								},
								items: [
									{ title: "Понимание ресурсов", position: 0, skillId: 9 },
									{ title: "Понимание приоритетов", position: 1, skillId: 10 },
									{ title: "Выявление боли", position: 2, skillId: 11 },
								],
							},
							{
								type: "QA",
								title: "Ваш комментарий про модератора:",
								required: true,
								position: 2,
							},
						],
					},
				],
			};
		},
	});

	// Set initial active tab when data loads
	useEffect(() => {
		if (
			evaluationData?.forms &&
			evaluationData.forms.length > 0 &&
			!activeTab
		) {
			setActiveTab(evaluationData.forms[0].role);
		}
	}, [evaluationData, activeTab]);

	// Swipe handling functions
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(null);
		setTouchStart(e.targetTouches[0].clientX);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > 50;
		const isRightSwipe = distance < -50;

		if (isLeftSwipe || isRightSwipe) {
			const currentIndex =
				evaluationData?.forms.findIndex((form) => form.role === activeTab) ?? 0;
			const totalForms = evaluationData?.forms.length ?? 0;

			if (isLeftSwipe && currentIndex < totalForms - 1) {
				// Swipe left - go to next tab
				const nextForm = evaluationData?.forms[currentIndex + 1];
				if (nextForm) setActiveTab(nextForm.role);
			} else if (isRightSwipe && currentIndex > 0) {
				// Swipe right - go to previous tab
				const prevForm = evaluationData?.forms[currentIndex - 1];
				if (prevForm) setActiveTab(prevForm.role);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Загрузка форм...</p>
				</div>
			</div>
		);
	}

	if (!evaluationData?.forms || evaluationData.forms.length === 0) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">Нет доступных форм для оценки</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<EvaluationHeader />

			{/* Dynamic Tabs */}
			<div className="bg-white px-4 py-2">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="bg-gray-100 rounded-xl gap-0"
				>
					<EvaluationTabs forms={evaluationData.forms} activeTab={activeTab} />

					{/* Tab Contents */}
					{evaluationData.forms.map((form) => (
						<TabsContent
							key={form.role}
							value={form.role}
							className="mt-0 data-[state=inactive]:hidden"
							forceMount
						>
							<div
								className="h-full max-h-[calc(100vh-330px)] overflow-y-auto"
								onTouchStart={handleTouchStart}
								onTouchMove={handleTouchMove}
								onTouchEnd={handleTouchEnd}
							>
								<div className="p-2 space-y-4">
									<EvaluationBlocks blocks={form.blocks} formRole={form.role} />
								</div>
							</div>
						</TabsContent>
					))}
				</Tabs>
			</div>

			{/* Footer CTA */}
			<EvaluationFooter />
		</div>
	);
};
