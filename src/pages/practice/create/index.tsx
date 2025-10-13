import MultiSelectChips from "@/components/multi-select-chips";
import { Button } from "@/components/ui/button";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { adminsQueryOptions } from "@/entities/admin/model/api/admin.api";
import { CasesAPI } from "@/entities/case/model/api/case.api";
import { ScenariosAPI } from "@/entities/scenarios/model/api/scenarios.api";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { useUserRole, useZoomConnection } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeType } from "@/shared/types/practice.types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router-dom";

/** Zoom icon */
const ZoomIcon = ({
	size = 20,
	className = "",
}: {
	size?: number;
	className?: string;
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
			fill="#2D8CFF"
		/>
	</svg>
);

/** Pagination helper that tolerates both page-based and boolean hasNext signatures */
function getNextPageParamFromMeta(lastPage: any) {
	const p = lastPage?.meta?.pagination as any;
	if (!p) return undefined;
	const currentPage = p.currentPage ?? p.page ?? 1;
	const totalPages =
		p.totalPages ??
		(p.totalItems && p.limit ? Math.ceil(p.totalItems / p.limit) : undefined);

	if (typeof totalPages === "number") {
		return currentPage < totalPages ? currentPage + 1 : undefined;
	}
	if (typeof p?.hasNext === "boolean") {
		return p.hasNext ? currentPage + 1 : undefined;
	}
	return undefined;
}

/** Convert local date + "HH:MM" to UTC ISO string */
function toUtcIso(dateLocal: Date, hhmm: string): string {
	const [hh, mm] = (hhmm || "00:00").split(":").map(Number);
	const y = dateLocal.getFullYear();
	const m = dateLocal.getMonth(); // 0-based
	const d = dateLocal.getDate();
	const localDateTime = new Date(y, m, d, hh, mm, 0, 0);
	return localDateTime.toISOString();
}

const PracticeCreatePage = () => {
	const store = useCreatePracticeStore();
	const navigate = useNavigate();

	// store keeps numeric IDs, UI uses strings to avoid equality glitches
	const { scenarioId, caseId, skillIds, practiceType } = store;

	const { role } = useUserRole();
	const { connectToZoom, isConnecting } = useZoomConnection();

	// Local date/time for stable UX; compute UTC on submit
	const [dateLocal, setDateLocal] = React.useState<Date | undefined>(undefined);
	const [timeLocal, setTimeLocal] = React.useState<string>("15:00");

	// Used to visually reset the MultiSelectChips back to clean placeholder state
	const [skillsResetVersion, setSkillsResetVersion] = React.useState(0);

	// ---- Queries ----

	// Zoom status
	const { data: zoomStatusData } = useQuery({
		...adminsQueryOptions.zoomStatus(),
		enabled: role === "ADMIN",
	});
	const isZoomAuthorized = zoomStatusData?.data?.connected ?? false;

	// Skills list (always available)
	const skills = useInfiniteQuery({
		queryKey: ["skills", "list"],
		queryFn: ({ pageParam = 1 }) =>
			SkillsAPI.getSkillsPaged({ page: pageParam as number, limit: 50 }),
		getNextPageParam: getNextPageParamFromMeta,
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
	});

	// MultiSelect options (string IDs)
	const skillOptions = React.useMemo(
		() =>
			(skills.data?.pages ?? [])
				.flatMap((pg: any) => pg?.data ?? [])
				.map((s: any) => ({
					value: String(s.id),
					label: s.name,
				})),
		[skills.data]
	);

	// Scenarios: NOW enabled even without skills (skills are only filters)
	const scenarios = useInfiniteQuery({
		queryKey: [
			"scenarios",
			"list",
			{
				// only pass when present to avoid over-filtering
				skillIds: skillIds.length ? skillIds : undefined,
				practiceType: practiceType || undefined,
			},
		],
		queryFn: ({ pageParam = 1 }) =>
			ScenariosAPI.getScenarios({
				skillIds: (skillIds.length ? (skillIds as any) : undefined) as any,
				practiceType: (practiceType || undefined) as any,
				page: pageParam as number,
				limit: 50,
			}),
		getNextPageParam: getNextPageParamFromMeta,
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
		// enabled: ALWAYS true → scenarios selectable without skills
		enabled: true,
	});

	const scenarioOptions = React.useMemo(
		() =>
			scenarios.data?.pages
				? scenarios.data.pages.flatMap((p: any) => p?.data ?? [])
				: [],
		[scenarios.data]
	);

	// Cases: depend on scenario; skills filter is optional; disabled for WITHOUT_CASE
	const cases = useInfiniteQuery({
		queryKey: [
			"cases",
			"list",
			{
				scenarioId: scenarioId || undefined,
				skillIds: skillIds.length ? skillIds : undefined,
			},
		],
		queryFn: ({ pageParam = 1 }) =>
			CasesAPI.getCases({
				scenarioId: scenarioId as any,
				skillIds: (skillIds.length ? (skillIds as any) : undefined) as any,
				page: pageParam as number,
				limit: 50,
			}),
		getNextPageParam: getNextPageParamFromMeta,
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
		enabled: Boolean(scenarioId) && practiceType !== "WITHOUT_CASE",
	});

	const caseOptions = React.useMemo(
		() =>
			cases.data?.pages
				? cases.data.pages.flatMap((p: any) => p?.data ?? [])
				: [],
		[cases.data]
	);

	// ---- Reset & validation policy ----

	// If switching to WITHOUT_CASE -> ensure case cleared (keep scenario)
	React.useEffect(() => {
		if (practiceType === "WITHOUT_CASE" && caseId) {
			store.setCase(undefined, undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [practiceType]);

	// Validate scenario against options after scenarios settle
	React.useEffect(() => {
		if (scenarios.isLoading || scenarios.isFetching) return;
		if (
			scenarioId &&
			!scenarioOptions.some((s: any) => Number(s.id) === Number(scenarioId))
		) {
			store.setScenario(undefined, undefined);
			store.setCase(undefined, undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scenarioOptions, scenarios.isLoading, scenarios.isFetching]);

	// Validate case against options after cases settle
	React.useEffect(() => {
		if (cases.isLoading || cases.isFetching) return;
		if (
			caseId &&
			!caseOptions.some((c: any) => Number(c.id) === Number(caseId))
		) {
			store.setCase(undefined, undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [caseOptions, cases.isLoading, cases.isFetching]);

	// When skills change, if a skill was REMOVED → reset dependent selections
	// and visually reset the skills control to placeholder (via key bump).
	const prevSkillIdsRef = React.useRef<number[]>(skillIds);
	React.useEffect(() => {
		const prev = new Set(prevSkillIdsRef.current);
		const curr = new Set(skillIds);
		const removalHappened = [...prev].some((id) => !curr.has(id));
		prevSkillIdsRef.current = skillIds;

		if (removalHappened) {
			// Drop scenario & case because filters changed in a narrowing direction
			store.setScenario(undefined, undefined);
			store.setCase(undefined, undefined);

			// Force MultiSelectChips back to its initial, clean placeholder state
			setSkillsResetVersion((v) => v + 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [skillIds]);

	// ---- Infinite scroll handlers ----
	const SCROLL_LOAD_THRESHOLD_PX = 24;

	const handleScrollLoadMoreScenarios = React.useCallback(
		(e: any) => {
			const el = e?.target as HTMLElement | null;
			if (!el) return;
			const nearBottom =
				el.scrollHeight - el.scrollTop - el.clientHeight <
				SCROLL_LOAD_THRESHOLD_PX;
			if (
				nearBottom &&
				scenarios.hasNextPage &&
				!scenarios.isFetchingNextPage
			) {
				scenarios.fetchNextPage();
			}
		},
		[
			scenarios.hasNextPage,
			scenarios.isFetchingNextPage,
			scenarios.fetchNextPage,
		]
	);

	const handleScrollLoadMoreCases = React.useCallback(
		(e: any) => {
			const el = e?.target as HTMLElement | null;
			if (!el) return;
			const nearBottom =
				el.scrollHeight - el.scrollTop - el.clientHeight <
				SCROLL_LOAD_THRESHOLD_PX;
			if (nearBottom && cases.hasNextPage && !cases.isFetchingNextPage) {
				cases.fetchNextPage();
			}
		},
		[cases.hasNextPage, cases.isFetchingNextPage, cases.fetchNextPage]
	);

	// ---- Form validity / Next button ----
	const canProceed = React.useMemo(() => {
		if (!practiceType) return false;
		if (!scenarioId) return false;
		if (practiceType === "WITH_CASE" && !caseId) return false;
		if (!dateLocal || !timeLocal) return false;
		return true;
	}, [practiceType, scenarioId, caseId, dateLocal, timeLocal]);

	const handleNext = React.useCallback(() => {
		if (!canProceed || !dateLocal || !timeLocal) return;
		const startAtUTC = toUtcIso(dateLocal, timeLocal);
		store.setStartAt(startAtUTC);
		navigate("/practice/preview");
	}, [canProceed, dateLocal, timeLocal, store, navigate]);

	return (
		<div className="bg-white text-black min-h-screen flex flex-col pb-24">
			<div className="px-4 py-4 flex-1">
				<h1 className="text-xl font-semibold mb-4">Создайте свою практику</h1>

				<div className="space-y-3">
					{/* Skills (optional filters). When cleared or reduced, we reset downstream selections. */}
					<div>
						<MultiSelectChips
							key={skillsResetVersion} // remount to restore placeholder/input state after reset
							options={skillOptions}
							// UI uses string IDs; convert store numeric skillIds -> string[]
							value={skillIds.map((id) => String(id))}
							onChange={(next) => {
								const ids = next.map((v) => Number(v));
								store.setSkills(ids);

								const labelMap = new Map(
									skillOptions.map((o) => [String(o.value), o.label])
								);
								const names = next
									.map((v) => labelMap.get(String(v)))
									.filter(Boolean) as string[];
								store.setSkillNames(names);

								// If user cleared all skills manually, ensure “placeholdery” look is preserved
								if (ids.length === 0) {
									setSkillsResetVersion((v) => v + 1);
								}
							}}
							placeholder="Выберите навыки"
							onLoadMore={() => {
								if (skills.hasNextPage && !skills.isFetchingNextPage)
									skills.fetchNextPage();
							}}
							canLoadMore={Boolean(skills.hasNextPage)}
							isLoadingMore={Boolean(skills.isFetchingNextPage)}
						/>
					</div>

					{/* Practice type */}
					<div>
						<Select
							onValueChange={(t) => {
								const pt = t as PracticeType;
								store.setPracticeType(pt);

								if (pt === "WITHOUT_CASE") {
									store.setCase(undefined, undefined);
								}
							}}
							value={(practiceType ?? "") as any}
						>
							<SelectTrigger>
								<SelectValue placeholder="Тип практики" />
							</SelectTrigger>
							<SelectContent side="bottom" align="start">
								<SelectGroup>
									{(
										["WITH_CASE", "WITHOUT_CASE", "MINI"] as PracticeType[]
									).map((t) => (
										<SelectItem key={t} value={t}>
											{getPracticeTypeLabel(t)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					{/* Scenario (enabled even without skills) */}
					<div>
						<Select
							// remount when skills were reduced to restore placeholder feel
							key={`scenario-${skillsResetVersion}`}
							onValueChange={(id) => {
								const s = scenarioOptions.find(
									(x: any) => String(x.id) === String(id)
								);
								store.setScenario(Number(id), s?.title);
								if (s?.practiceType) store.setPracticeType(s.practiceType);
							}}
							value={scenarioId ? String(scenarioId) : ""}
							disabled={false}
						>
							<SelectTrigger>
								<SelectValue placeholder="Выберите сценарий практики" />
							</SelectTrigger>
							<SelectContent
								side="bottom"
								align="start"
								onScroll={handleScrollLoadMoreScenarios}
							>
								<SelectGroup>
									{scenarioOptions?.length ? (
										scenarioOptions.map((s: any) => (
											<SelectItem key={s.id} value={String(s.id)}>
												{s.title}
											</SelectItem>
										))
									) : (
										<SelectItem disabled value="__none">
											Нет сценариев
										</SelectItem>
									)}
									{scenarios.isFetchingNextPage ? (
										<SelectItem disabled value="__loading_scenarios">
											Загрузка...
										</SelectItem>
									) : null}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					{/* Case (depends on scenario; disabled for WITHOUT_CASE) */}
					<div>
						<Select
							key={`case-${skillsResetVersion}-${scenarioId ?? 0}`}
							onValueChange={(id) => {
								const c = caseOptions.find(
									(x: any) => String(x.id) === String(id)
								);
								store.setCase(Number(id), c?.title);
							}}
							disabled={practiceType === "WITHOUT_CASE" || !scenarioId}
							value={caseId ? String(caseId) : ""}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										practiceType === "WITHOUT_CASE"
											? "Тип без кейса — выбор не требуется"
											: !scenarioId
											? "Сначала выберите сценарий"
											: "Выберите кейс практики"
									}
								/>
							</SelectTrigger>
							<SelectContent
								side="bottom"
								align="start"
								onScroll={handleScrollLoadMoreCases}
							>
								<SelectGroup>
									{caseOptions?.length ? (
										caseOptions.map((c: any) => (
											<SelectItem key={c.id} value={String(c.id)}>
												{c.title}
											</SelectItem>
										))
									) : (
										<SelectItem disabled value="__none">
											Нет кейсов для выбранного сценария
										</SelectItem>
									)}
									{cases.isFetchingNextPage ? (
										<SelectItem disabled value="__loading_cases">
											Загрузка...
										</SelectItem>
									) : null}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					{/* Date & Time (local) */}
					<div className="flex flex-row gap-2">
						<DatePickerFloatingLabel
							className="w-3/5"
							placeholder="Дата проведения (локальная)"
							value={dateLocal}
							onValueChange={(d) => setDateLocal(d)}
						/>
						<input
							type="time"
							value={timeLocal}
							onChange={(e) => setTimeLocal(e.target.value)}
							className="w-2/5 h-16 rounded-2xl bg-white-gray px-4 text-sm font-medium placeholder:text-second-gray"
							placeholder="Время (локальное)"
							step={300}
							min="00:00"
							max="23:59"
							lang="ru-RU"
						/>
					</div>

					{/* Zoom Connect (Admin only) */}
					{role === "ADMIN" && !isZoomAuthorized && (
						<div>
							<Button
								type="button"
								variant="default"
								className="w-full bg-[#2D8CFF] hover:bg-[#1E6BB8] text-white"
								onClick={connectToZoom}
								disabled={isConnecting}
							>
								<ZoomIcon size={20} className="mr-2" />
								{isConnecting ? "Connecting..." : "Connect Zoom Account"}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Footer / Next */}
			<div className="px-4">
				<Button className="w-full" disabled={!canProceed} onClick={handleNext}>
					Следующий шаг
				</Button>
			</div>
		</div>
	);
};

export default PracticeCreatePage;
