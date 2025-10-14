// components/ui/multi-select.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";

const multiSelectVariants = cva(
	"h-16 rounded-2xl text-sm font-medium w-full min-w-0 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-white-gray border border-gray-200",
				dark: "bg-base-bg text-white",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

interface MultiSelectProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof multiSelectVariants> {
	placeholder?: string;
	label?: string;
	values: string[];
	onValuesChange: (values: string[]) => void;
	options: Array<{
		value: string;
		label: string;
	}>;
	className?: string;
	variant?: "dark" | "default";
	disabled?: boolean;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
	(
		{
			placeholder = "",
			label = "",
			values = [],
			onValuesChange,
			variant = "default",
			disabled = false,
			options,
			className,
			...props
		},
		ref
	) => {
		const id = useId();
		const [isOpen, setIsOpen] = useState(false);
		const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
			"bottom"
		);
		const dropdownRef = useRef<HTMLDivElement>(null);
		const triggerRef = useRef<HTMLButtonElement>(null);

		const isLabelLifted = values.length > 0 || isOpen;

		const toggleOption = (value: string) => {
			const newValues = values.includes(value)
				? values.filter((v) => v !== value)
				: [...values, value];
			onValuesChange(newValues);
		};

		const removeValue = (value: string, e: React.MouseEvent) => {
			e.stopPropagation();
			onValuesChange(values.filter((v) => v !== value));
		};

		const selectedLabels = options
			.filter((option) => values.includes(option.value))
			.map((option) => option.label);

		// Определяем позицию dropdown
		useEffect(() => {
			if (isOpen && triggerRef.current) {
				const triggerRect = triggerRef.current.getBoundingClientRect();
				const spaceBelow = window.innerHeight - triggerRect.bottom;
				const spaceAbove = triggerRect.top;
				const dropdownHeight = 300; // Максимальная высота dropdown

				// Если места снизу меньше чем высота dropdown и сверху больше места - показываем сверху
				if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
					setDropdownPosition("top");
				} else {
					setDropdownPosition("bottom");
				}
			}
		}, [isOpen]);

		// Закрытие dropdown при клике вне компонента
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					dropdownRef.current &&
					!dropdownRef.current.contains(event.target as Node) &&
					triggerRef.current &&
					!triggerRef.current.contains(event.target as Node)
				) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		// Закрытие при скролле страницы
		useEffect(() => {
			if (isOpen) {
				const handleScroll = () => {
					setIsOpen(false);
				};

				window.addEventListener("scroll", handleScroll, { passive: true });
				return () => window.removeEventListener("scroll", handleScroll);
			}
		}, [isOpen]);

		const getDropdownStyles = () => {
			const baseStyles =
				"absolute left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-[300px] overflow-y-auto";

			if (dropdownPosition === "top") {
				return cn(baseStyles, "bottom-full mb-1");
			} else {
				return cn(baseStyles, "top-full mt-1");
			}
		};

		return (
			<div className="relative w-full" ref={dropdownRef}>
				<button
					ref={(node) => {
						if (typeof ref === "function") {
							ref(node);
						} else if (ref) {
							ref.current = node;
						}
						triggerRef.current = node;
					}}
					type="button"
					className={cn(
						multiSelectVariants({ variant, className }),
						"pl-4 pr-10 text-left",
						"flex items-center justify-between min-h-16",
						isLabelLifted ? "pt-6 pb-2" : "py-4",
						"cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					)}
					onClick={() => setIsOpen(!isOpen)}
					disabled={disabled}
					{...props}
				>
					<div className="flex-1 overflow-hidden flex items-center">
						{values.length === 0 ? (
							<span className="text-gray-400">{placeholder}</span>
						) : (
							// Показываем только один бейдж с количеством выбранных элементов
							<Badge
								variant="secondary"
								className="text-xs px-2 py-1 h-6 bg-blue-100 text-blue-800 border-blue-200"
							>
								Выбрано: {values.length}
							</Badge>
						)}
					</div>
					{/* Стрелочка вынесена из flex-1 контейнера */}
					<ChevronDown
						className={cn(
							"h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2",
							isOpen && "rotate-180"
						)}
					/>
				</button>

				<label
					htmlFor={id}
					className={cn(
						"pointer-events-none absolute z-10 transition-all duration-200",
						"mx-3 px-1 text-sm text-gray-500",
						!isLabelLifted &&
							"top-1/2 transform -translate-y-1/2 bg-transparent",
						isLabelLifted && "top-3 text-xs font-medium px-1",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					{label}
				</label>

				{isOpen && (
					<div className={getDropdownStyles()}>
						<div className="p-2 space-y-1">
							{options.map((option) => {
								const isSelected = values.includes(option.value);
								return (
									<button
										key={option.value}
										type="button"
										className={cn(
											"w-full text-left px-3 py-3 rounded-xl text-sm transition-colors",
											"flex items-center justify-between",
											isSelected
												? "bg-blue-50 text-blue-700 border border-blue-200"
												: "hover:bg-gray-50 border border-transparent"
										)}
										onClick={() => toggleOption(option.value)}
									>
										<span
											className="flex-1 text-left truncate"
											title={option.label}
										>
											{option.label}
										</span>
										{isSelected && (
											<Check className="h-4 w-4 absolute top-1/2 -translate-x-1/2 right-0 flex-shrink-0 ml-2" />
										)}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Полный список выбранных значений под селектом */}
				{values.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-1 min-h-0">
						{selectedLabels.map((label, index) => {
							const value = options.find((opt) => opt.label === label)?.value;
							return (
								<Badge
									key={index}
									variant="secondary"
									className="pl-2 pr-1 py-1 text-xs bg-blue-100 text-blue-800 border-blue-200 flex-shrink-0 max-w-full mb-1"
								>
									<span className="truncate max-w-[200px]" title={label}>
										{label}
									</span>
									<button
										type="button"
										onClick={(e) => removeValue(value!, e)}
										className="ml-1 rounded-full outline-none hover:bg-blue-200 transition-colors flex-shrink-0"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							);
						})}
					</div>
				)}
			</div>
		);
	}
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
