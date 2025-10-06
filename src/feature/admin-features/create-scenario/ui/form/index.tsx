import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { casesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
	createScenarioSchema,
	type ScenarioType,
	type ScenarioType as ScenarioTypeEnum,
	type CreateScenarioFormData,
	scenarioTypeOptions,
} from "../../model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";

export function CreateScenarioForm() {
	const form = useForm<CreateScenarioFormData>({
		resolver: zodResolver(createScenarioSchema),
		defaultValues: {
			title: "",
			type: "WITHOUT_CASE" as ScenarioType,
			caseId: undefined,
		},
	});

	const { data: casesData } = useQuery(casesQueryOptions.list());

	const caseOptions = useMemo(
		() =>
			casesData?.data?.map((c) => ({ value: String(c.id), label: c.title })) || [],
		[casesData]
	);

	const selectedType = form.watch("type");
	const isCaseRequired = selectedType === "WITH_CASE" || selectedType === "MINI";

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

				{/* Type select */}
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								variant="default"
								className="bg-second-bg "
								placeholder="Выберите тип сценария"
								value={field.value}
								onValueChange={(v) => field.onChange(v as ScenarioTypeEnum)}
								options={scenarioTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Case select (enabled conditionally) */}
				<FormField
					control={form.control}
					name="caseId"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								variant="default"
								className="bg-second-bg disabled:bg-[#2A2A2A]"
								placeholder="Выберите кейс"
								value={field.value ? String(field.value) : ""}
								onValueChange={(v) => field.onChange(parseInt(v))}
								options={caseOptions}
								disabled={!isCaseRequired}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Tabs: Продавец | Покупатель | Модератор */}
				<Tabs defaultValue="seller">
					<TabsList variant="second" className="grid grid-cols-3 w-full">
						<TabsTrigger variant="second" value="seller">Продавец</TabsTrigger>
						<TabsTrigger variant="second" value="buyer">Покупатель</TabsTrigger>
						<TabsTrigger variant="second" value="moderator">Модератор</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* No actions here per spec */}
			</form>
		</Form>
	);
}


