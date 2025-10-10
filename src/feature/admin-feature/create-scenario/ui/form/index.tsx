import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Button } from "@/components/ui/button";
// Tabs are rendered on the page container, not here
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { casesQueryOptions } from "@/entities";
import { RemoveIcon } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createScenarioSchema, type CreateScenarioFormData } from "../../model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useEffect } from "react";

interface CreateScenarioFormProps {
	onFormDataChange?: (data: { title: string; caseIds: number[] }) => void;
}

export function CreateScenarioForm({ onFormDataChange }: CreateScenarioFormProps) {
	const form = useForm<CreateScenarioFormData>({
		resolver: zodResolver(createScenarioSchema),
		defaultValues: { title: "", caseIds: [] },
	});

	const { data: casesData } = useQuery(casesQueryOptions.list());

	const caseOptions = useMemo(
		() =>
			casesData?.data?.map((c) => ({ value: String(c.id), label: c.title })) || [],
		[casesData]
	);

	// Multi-case selection state (dynamic selectors)
	const [caseSelects, setCaseSelects] = useState<Array<number | null>>([null]);

	// Build final selected ids (non-null)
	const selectedCaseIds = useMemo(
		() => caseSelects.filter((v): v is number => typeof v === "number"),
		[caseSelects]
	);

	// Watch form values and notify parent
	const title = form.watch("title");
	
	useEffect(() => {
		onFormDataChange?.({ title, caseIds: selectedCaseIds });
	}, [title, selectedCaseIds, onFormDataChange]);

	return (
		<Form {...form}>
			<form className="space-y-4">
				{/* Header input */}
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<InputFloatingLabel
									variant="dark"
									placeholder="Введите название формы"
									className="bg-second-bg"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

                {/* Type select removed per new spec */}

				{/* Case select (multiple) */}
				<div className="space-y-2">
					{caseSelects.map((val, idx) => (
						<div key={idx} className="flex items-center gap-2">
							<div className="flex-1">
								<SelectFloatingLabel
									variant="default"
									className="bg-second-bg"
									placeholder={idx === 0 ? "Выберите кейс (опционально)" : "Добавьте ещё один кейс (опционально)"}
									value={val ? String(val) : ""}
									onValueChange={(value) => {
										const num = parseInt(value);
										setCaseSelects((prev) => {
											const next = [...prev];
											next[idx] = Number.isNaN(num) ? null : num;
											// If this is the last selector and user selected a value, append a new empty selector
											if (idx === prev.length - 1 && !Number.isNaN(num)) {
												next.push(null);
											}
											return next;
										});
									}}
									options={caseOptions.filter((o) => {
										// allow currently selected value for this selector
										if (val && String(val) === o.value) return true;
										// otherwise filter out already taken ids
										const id = parseInt(o.value);
										return !selectedCaseIds.includes(id);
									})}
								/>
							</div>
							{(idx === 0 ? val : true) && (
								<Button
									type="button"
									variant="link"
									size="2s"
									rounded="full"
									text="main"
									onClick={() => {
										setCaseSelects((prev) => {
											const next = [...prev];
											
											if (val) {
												// If selector has a value, clear it
												next[idx] = null;
											} else {
												// If selector is empty, remove the entire selector
												// But keep at least one selector
												if (next.length > 1) {
													next.splice(idx, 1);
												}
											}
											
											return next;
										});
									}}
									className="shrink-0"
								>
									<RemoveIcon />
								</Button>
							)}
						</div>
					))}
				</div>

				{/* Tabs were moved outside, below the form on the page container */}

				{/* No actions here per spec */}
			</form>
		</Form>
	);
}


