import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";

const { useCallback, useMemo, useRef, useState, useId, useEffect } = React;

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
		const id = useId();
		const [isOpen, setIsOpen] = useState(false);
		const { hour, minute } = parseValue(value);
		const hasValue = Boolean(value);
		const [isManualInput, setIsManualInput] = useState(false);
		const [manualValue, setManualValue] = useState<string>(value || "");
		const inputRef = useRef<HTMLInputElement | null>(null);

		useEffect(() => {
			if (isOpen && WebApp?.disableVerticalSwipes) {
				WebApp.disableVerticalSwipes();
				return () => {
					if (WebApp?.enableVerticalSwipes) {
						WebApp.enableVerticalSwipes();
					}
				};
			}
		}, [isOpen]);

		const wheelAccumRef = useRef<{ hour: number; minute: number }>({ hour: 0, minute: 0 });
		const wheelRafRef = useRef<number | null>(null);
		const SCROLL_THRESHOLD = 40;

		const flushWheel = useCallback((type: "hour" | "minute") => {
			const isHour = type === "hour";
			const accum = wheelAccumRef.current[type];
			const steps = Math.floor(Math.abs(accum) / SCROLL_THRESHOLD);
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
		}, [hour, minute, onValueChange]);

		const handleWheel = useCallback((type: "hour" | "minute", deltaY: number) => {
			wheelAccumRef.current[type] += deltaY;

			if (wheelRafRef.current == null) {
				wheelRafRef.current = requestAnimationFrame(() => {
					wheelRafRef.current = null;
					flushWheel("hour");
					flushWheel("minute");
				});
			}
		}, [flushWheel]);

		const dragStateRef = useRef<{
			active: boolean;
			startY: number;
			lastY: number;
			type: "hour" | "minute" | null;
			hasMoved: boolean;
		}>({ active: false, startY: 0, lastY: 0, type: null, hasMoved: false });

		const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
			const target = e.target as HTMLElement;
			const wheelContainer = target.closest('[data-wheel-type]') as HTMLElement;
			if (!wheelContainer) return;

			e.preventDefault();
			e.stopPropagation();
			wheelContainer.setPointerCapture(e.pointerId);

			const type = wheelContainer.dataset.wheelType as "hour" | "minute";
			dragStateRef.current = {
				active: true,
				startY: e.clientY,
				lastY: e.clientY,
				type,
				hasMoved: false
			};
		}, []);

		const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
			const s = dragStateRef.current;
			if (!s.active || !s.type) return;

			e.preventDefault();
			e.stopPropagation();

			const totalDelta = Math.abs(e.clientY - s.startY);
			if (totalDelta > 3) {
				s.hasMoved = true;
			}

			const dy = s.lastY - e.clientY;

			if (Math.abs(dy) > 0) {
				handleWheel(s.type, dy * 2);
				s.lastY = e.clientY;
			}
		}, [handleWheel]);

		const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
			const target = e.target as HTMLElement;
			const wheelContainer = target.closest('[data-wheel-type]') as HTMLElement;
			if (wheelContainer) {
				try {
					wheelContainer.releasePointerCapture(e.pointerId);
				} catch {}
			}

			dragStateRef.current = {
				active: false,
				startY: 0,
				lastY: 0,
				type: null,
				hasMoved: false
			};
		}, []);

		const enableManual = useCallback(() => {
			setIsManualInput(true);
			setManualValue(value || "");
			setTimeout(() => inputRef.current?.focus(), 0);
		}, [value]);

		const cancelManual = useCallback(() => {
			setIsManualInput(false);
		}, []);

		const applyManual = useCallback(() => {
			const m = manualValue?.trim() || "";
			const match = /^(\d{2}):(\d{2})$/.exec(m);
			if (match) {
				const hh = Math.min(23, Math.max(0, Number(match[1])));
				const mm = Math.min(59, Math.max(0, Number(match[2])));
				onValueChange?.(`${pad2(hh)}:${pad2(mm)}`);
			}
			setIsManualInput(false);
		}, [manualValue, onValueChange]);

		const onManualKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				applyManual();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				cancelManual();
			}
		}, [applyManual, cancelManual]);

		const handleItemClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
			if (dragStateRef.current.hasMoved) return;

			const target = e.target as HTMLElement;
			const item = target.closest('[data-value]') as HTMLElement;
			if (!item) return;

			const value = Number(item.dataset.value);
			const type = item.dataset.type as "hour" | "minute";
			const isCenter = item.classList.contains('selected');

			if (!isCenter && type) {
				const newValue = type === "hour" ? `${pad2(value)}:${pad2(minute)}` : `${pad2(hour)}:${pad2(value)}`;
				onValueChange?.(newValue);
			}
		}, [hour, minute, onValueChange]);

		const hourValues = useMemo(() => getVisibleValues(hour, 23), [hour]);
		const minuteValues = useMemo(() => getVisibleValues(minute, 59), [minute]);

		const onWheelHandler = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
			const target = e.target as HTMLElement;
			const wheelContainer = target.closest('[data-wheel-type]') as HTMLElement;
			if (!wheelContainer) return;

			e.preventDefault();
			e.stopPropagation();

			const type = wheelContainer.dataset.wheelType as "hour" | "minute";
			handleWheel(type, e.deltaY);
		}, [handleWheel]);

		const renderWheel = useCallback((type: "hour" | "minute") => {
			const visibleValues = type === "hour" ? hourValues : minuteValues;

			return (
				<div className="flex-1 relative overflow-hidden h-[168px]">
					<div
						className="h-full flex flex-col timepicker-wheel-container"
						style={{ touchAction: 'none' }}
						data-wheel-type={type}
					>
						{visibleValues.map((v, index) => (
							<div
								key={`${type}-${v}-${index}`}
								data-value={v}
								data-type={type}
								className={cn(
									"timepicker-wheel-item",
									"h-6 flex items-center justify-center text-xs font-medium leading-[20px]",
									"transition-all duration-300 ease-out",
									index === CENTER_INDEX
										? 'selected text-[var(--color-base-main)] font-semibold scale-110 opacity-100'
										: 'text-gray-900 dark:text-white opacity-70 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105 hover:opacity-90'
								)}
								style={{ willChange: 'transform, opacity' }}
							>
								{pad2(v)}
							</div>
						))}
					</div>
					<div className="absolute left-0 right-0 top-0 h-[60px] pointer-events-none z-10 bg-gradient-to-b from-white/95 to-white/0 dark:from-gray-800/95 dark:to-gray-800/0" />
					<div className="absolute left-0 right-0 bottom-0 h-[60px] pointer-events-none z-10 bg-gradient-to-t from-white/95 to-white/0 dark:from-gray-800/95 dark:to-gray-800/0" />
				</div>
			);
		}, [hour, minute, hourValues, minuteValues]);

		return (
			<div className="group relative w-full">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<div
							ref={ref as any}
							id={id}
							role="button"
							tabIndex={disabled ? -1 : 0}
							className={cn(
								timePickerVariants({ variant }),
								"flex items-center justify-start relative",
								hasValue ? "pt-6 pb-2" : "py-4",
								"peer",
								disabled && "cursor-not-allowed"
							)}
							onDoubleClick={(e) => {
								if (!disabled) {
									e.stopPropagation();
									enableManual();
								}
							}}
							aria-disabled={disabled}
						>
							{isManualInput ? (
								<input
									ref={inputRef}
									value={manualValue}
									onChange={(e) => setManualValue(e.target.value)}
									onBlur={applyManual}
									onKeyDown={onManualKeyDown}
									placeholder="HH:MM"
									className="absolute inset-0 w-full h-full bg-transparent text-left text-black px-4 text-sm font-medium outline-none"
								/>
							) : (
								<span className={cn("text-left text-black flex-1", !hasValue && "text-muted-foreground")}>
									{value || ""}
								</span>
							)}
						</div>
					</PopoverTrigger>

					<label
						htmlFor={id}
						className={cn(
							"pointer-events-none absolute left-3 z-10 px-1 text-sm transition-all duration-200",
							!hasValue && !isOpen && !isManualInput && "top-1/2 -translate-y-1/2 text-muted-foreground",
							(hasValue || isOpen || isManualInput) && "top-3 -translate-y-0 text-xs font-medium text-foreground",
							disabled && "cursor-not-allowed opacity-50"
						)}
					>
						{placeholder}
					</label>

					<PopoverContent
						side="top"
						sideOffset={8}
						className="w-[110px] p-0 timepicker-popover"
						align="start"
					>
						<div
							className="relative p-1.5"
							style={{ touchAction: 'none' }}
							onWheel={onWheelHandler}
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							onPointerCancel={onPointerUp}
							onClick={handleItemClick}
						>
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
