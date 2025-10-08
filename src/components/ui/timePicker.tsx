import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const timePickerVariants = cva(
	"h-16 rounded-2xl text-sm font-medium w-full min-w-0 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex items-center justify-between px-4",
	{
		variants: {
			variant: {
				default: "bg-white-gray",
				dark: "bg-base-bg text-white",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

interface TimePickerFloatingLabelProps extends VariantProps<typeof timePickerVariants> {
	placeholder?: string;
	value?: string; // HH:MM
	onValueChange?: (value: string) => void;
	disabled?: boolean;
}

const VISIBLE_ITEMS = 7;
const CENTER_INDEX = 3;

function pad2(n: number): string {
	return n.toString().padStart(2, "0");
}

function clampWrap(value: number, max: number): number {
	if (value < 0) return max;
	if (value > max) return 0;
	return value;
}

function parseValue(value?: string): { hour: number; minute: number } {
	if (!value) return { hour: 0, minute: 0 };
	const [h, m] = value.split(":");
	const hour = Math.min(23, Math.max(0, Number(h) || 0));
	const minute = Math.min(59, Math.max(0, Number(m) || 0));
	return { hour, minute };
}

function getVisibleValues(centerValue: number, maxValue: number): number[] {
	const values: number[] = [];
	const halfItems = Math.floor(VISIBLE_ITEMS / 2);
	for (let i = -halfItems; i <= halfItems; i++) {
		let v = centerValue + i;
		if (v < 0) v = maxValue + 1 + v;
		else if (v > maxValue) v = v - (maxValue + 1);
		values.push(v);
	}
	return values;
}

const TimePickerFloatingLabel = React.forwardRef<
	HTMLButtonElement,
	TimePickerFloatingLabelProps
>(
	(
		{ placeholder = "Выберите время", value, onValueChange, variant = "default", disabled = false },
		ref
	) => {
		const id = React.useId();
		const [isOpen, setIsOpen] = React.useState(false);
		const { hour, minute } = parseValue(value);
		const hasValue = Boolean(value);
		const [isManualInput, setIsManualInput] = React.useState(false);
		const [manualValue, setManualValue] = React.useState<string>(value || "");
		const inputRef = React.useRef<HTMLInputElement | null>(null);
		const wheelAccumRef = React.useRef<{ hour: number; minute: number }>({ hour: 0, minute: 0 });
		const wheelRafRef = React.useRef<number | null>(null);
		const SCROLL_THRESHOLD = 40;

		const flushWheel = (type: "hour" | "minute") => {
			const isHour = type === "hour";
			const accum = wheelAccumRef.current[type];
			const steps = Math.trunc(Math.abs(accum) / SCROLL_THRESHOLD);
			if (steps <= 0) return;
			let nextHour = hour;
			let nextMinute = minute;
			const dir = accum > 0 ? 1 : -1;
			for (let i = 0; i < steps; i++) {
				if (isHour) nextHour = clampWrap(nextHour + dir, 23);
				else nextMinute = clampWrap(nextMinute + dir, 59);
			}
			wheelAccumRef.current[type] = accum - dir * steps * SCROLL_THRESHOLD;
			onValueChange?.(`${pad2(nextHour)}:${pad2(nextMinute)}`);
		};

		const handleWheel = (type: "hour" | "minute", deltaY: number) => {
			wheelAccumRef.current[type] += deltaY;
			if (wheelRafRef.current == null) {
				wheelRafRef.current = requestAnimationFrame(() => {
					wheelRafRef.current = null;
					flushWheel("hour");
					flushWheel("minute");
				});
			}
		};

		// Pointer drag (mouse/touch) for mobile-like scrolling
		const dragStateRef = React.useRef<{ active: boolean; lastY: number; type: "hour" | "minute" | null }>({ active: false, lastY: 0, type: null });
		const onPointerDown = (type: "hour" | "minute") => (e: React.PointerEvent<HTMLDivElement>) => {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
			dragStateRef.current = { active: true, lastY: e.clientY, type };
		};
		const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
			const s = dragStateRef.current;
			if (!s.active || !s.type) return;
			const dy = s.lastY - e.clientY; // positive when moving up -> next
			handleWheel(s.type, dy);
			s.lastY = e.clientY;
		};
		const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
			try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
			dragStateRef.current = { active: false, lastY: 0, type: null };
		};

		// Manual typing inside trigger on double click
		const enableManual = () => {
			setIsManualInput(true);
			setManualValue(value || "");
			setTimeout(() => inputRef.current?.focus(), 0);
		};
		const cancelManual = () => {
			setIsManualInput(false);
		};
		const applyManual = () => {
			const m = manualValue?.trim() || "";
			const match = /^(\d{2}):(\d{2})$/.exec(m);
			if (match) {
				const hh = Math.min(23, Math.max(0, Number(match[1])));
				const mm = Math.min(59, Math.max(0, Number(match[2])));
				onValueChange?.(`${pad2(hh)}:${pad2(mm)}`);
			}
			setIsManualInput(false);
		};
		const onManualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') { e.preventDefault(); applyManual(); }
			else if (e.key === 'Escape') { e.preventDefault(); cancelManual(); }
		};

		const handlePick = (type: "hour" | "minute", v: number) => {
			const newValue = type === "hour" ? `${pad2(v)}:${pad2(minute)}` : `${pad2(hour)}:${pad2(v)}`;
			onValueChange?.(newValue);
		};

		const renderWheel = (type: "hour" | "minute") => {
			const currentValue = type === "hour" ? hour : minute;
			const maxValue = type === "hour" ? 23 : 59;
			const visibleValues = getVisibleValues(currentValue, maxValue);

			return (
				<div className="flex-1 relative overflow-hidden h-[168px]">
					<div
						className="h-full flex flex-col timepicker-wheel-container"
						onWheel={(e) => {
							e.preventDefault();
							handleWheel(type, e.deltaY);
						}}
						onPointerDown={onPointerDown(type)}
						onPointerMove={onPointerMove}
						onPointerUp={endDrag}
						onPointerCancel={endDrag}
					>
          {visibleValues.map((v, index) => (
            <div
              key={`${type}-${v}-${index}`}
						className={cn(
							// Add base class for targeting in CSS
							"timepicker-wheel-item",
							"h-6 flex items-center justify-center text-xs font-medium leading-[20px]",
							"transition-transform transition-colors duration-150 will-change-transform",
							index === CENTER_INDEX
										? 'selected text-[var(--color-base-main)] font-semibold scale-110 opacity-100'
								: 'text-gray-900 dark:text-white opacity-70 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105 hover:opacity-90'
						)}
              onClick={() => index !== CENTER_INDEX && handlePick(type, v)}
            >
              {pad2(v)}
            </div>
          ))}
					</div>
					<div className="absolute left-0 right-0 top-0 h-[60px] pointer-events-none z-10" />
					<div className="absolute left-0 right-0 bottom-0 h-[60px] pointer-events-none z-10" />
				</div>
			);
		};

		return (
			<div className="group relative w-full">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<div
							ref={ref as any}
							id={id}
							role="button"
							tabIndex={0}
							className={cn(
								timePickerVariants({ variant }),
								"flex items-center justify-start relative",
								hasValue ? "pt-6 pb-2" : "py-4",
								"peer"
							)}
							onDoubleClick={(e) => { e.stopPropagation(); enableManual(); }}
						>
							{isManualInput ? (
								<input
									ref={inputRef}
									value={manualValue}
									onChange={(e) => setManualValue(e.target.value)}
									onBlur={applyManual}
									onKeyDown={onManualKeyDown}
									placeholder={placeholder}
									className="absolute inset-0 w-full h-full bg-transparent text-left text-black px-4 text-sm font-medium outline-none"
								/>
							) : (
								<span className={cn("text-left text-black flex-1", !hasValue && "text-muted-foreground")}>{value || ""}</span>
							)}
						</div>
					</PopoverTrigger>

					<label
						htmlFor={id}
						className={cn(
							"pointer-events-none absolute left-3 z-10  px-1 text-sm transition-all duration-200",
							!hasValue && !isOpen && "top-1/2 -translate-y-1/2 text-muted-foreground",
							(hasValue || isOpen) && "top-3 -translate-y-0 text-xs font-medium text-foreground",
							disabled && "cursor-not-allowed opacity-50"
						)}
					>
						{placeholder}
					</label>

					<PopoverContent side="top" sideOffset={8} className="w-[110px] p-0 timepicker-popover" align="start">
						<div className="relative p-1.5">
							<div className="flex items-center justify-center">
								{renderWheel("hour")}
								<div className="timepicker-separator text-xs font-bold mx-3">:</div>
								{renderWheel("minute")}
							</div>
							<div className="absolute inset-x-0 pointer-events-none h-6 mx-2 tp-selection-overlay" />
						</div>
					</PopoverContent>
				</Popover>
			</div>
		);
	}
);

TimePickerFloatingLabel.displayName = "TimePickerFloatingLabel";

export { TimePickerFloatingLabel };


