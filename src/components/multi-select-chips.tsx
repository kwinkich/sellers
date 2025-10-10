import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
	value: string | number;
	label: string;
}

interface MultiSelectChipsProps {
	options: MultiSelectOption[];
	value: Array<string | number>;
	onChange: (next: Array<string | number>) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	// Pagination/infinite scroll
	onLoadMore?: () => void;
	canLoadMore?: boolean;
	isLoadingMore?: boolean;
}

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
	options,
	value,
	onChange,
	placeholder = "Выберите значения",
	className,
	disabled,
	onLoadMore,
	canLoadMore,
	isLoadingMore,
}) => {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const listRef = React.useRef<HTMLDivElement | null>(null);

	const valueSet = React.useMemo(() => new Set(value.map(String)), [value]);
	const labelByValue = React.useMemo(() => {
		const map = new Map<string, string>();
		for (const o of options) map.set(String(o.value), o.label);
		return map;
	}, [options]);

	const filtered = React.useMemo(() => {
		if (!search.trim()) return options;
		const s = search.trim().toLowerCase();
		return options.filter((o) =>
			o.label.toLowerCase().includes(s) || String(o.value).includes(s)
		);
	}, [options, search]);

	const toggle = (val: string | number) => {
		const key = String(val);
		if (valueSet.has(key)) {
			onChange(value.filter((v) => String(v) !== key));
		} else {
			onChange([...value, val]);
		}
	};

	const remove = (val: string | number) => {
		onChange(value.filter((v) => String(v) !== String(val)));
	};


	const handleScroll = React.useCallback(() => {
		const el = listRef.current;
		if (!el) return;
		if (!canLoadMore || isLoadingMore) return;
		const threshold = 24; // px
		const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		if (distanceToBottom <= threshold) {
			onLoadMore?.();
		}
	}, [canLoadMore, isLoadingMore, onLoadMore]);

	React.useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		const onScroll = () => handleScroll();
		el.addEventListener("scroll", onScroll);
		return () => el.removeEventListener("scroll", onScroll);
	}, [handleScroll]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					role="button"
					aria-haspopup="dialog"
					aria-expanded={open}
					className={cn(
						"w-full min-h-16 rounded-2xl bg-white-gray border-0 p-3 text-left",
						"flex flex-grow items-center gap-2 overflow-hidden",
						disabled ? "opacity-50 pointer-events-none" : "",
						className
					)}
				>
					{value.length === 0 ? (
						<span className="text-second-gray text-sm font-medium truncate">
							{placeholder}
						</span>
					) : (
						<div className="flex items-center gap-2 flex-wrap w-full">
							{value.map((v) => (
								<div
									key={String(v)}
									className="flex items-center gap-2 px-2 py-1 rounded-xl bg-white shadow text-xs font-medium"
								>
									<span className="max-w-[160px] truncate">
										{labelByValue.get(String(v)) ?? String(v)}
									</span>
									<button
										type="button"
										className="ml-1 text-gray-500 hover:text-black"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											remove(v);
										}}
										aria-label="Удалить"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className="p-2 w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)]" align="start">
				<div className="flex flex-col gap-2">
					<input
						type="text"
						placeholder="Поиск..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full h-9 rounded-md border px-2 text-sm"
					/>
					<div ref={listRef} className="max-h-64 overflow-auto pr-1">
						{filtered.length ? (
							<ul className="space-y-1">
								{filtered.map((o) => {
									const checked = valueSet.has(String(o.value));
									return (
										<li key={String(o.value)}>
											<label className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-md hover:bg-muted/60">
												<input
													type="checkbox"
													checked={checked}
													onChange={() => toggle(o.value)}
													className="h-4 w-4 accent-primary"
												/>
												<span className="text-sm">{o.label}</span>
											</label>
										</li>
									);
								})}
							</ul>
						) : (
							<div className="text-sm text-muted-foreground px-2 py-4">
								Нет результатов
							</div>
						)}
						{isLoadingMore ? (
							<div className="text-center text-xs text-muted-foreground py-2">
								Загрузка...
							</div>
						) : null}
					</div>
					<div className="flex justify-between pt-1">
						<Button className="w-full h-10" size="sm" onClick={() => setOpen(false)}>
							Готово
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default MultiSelectChips;


