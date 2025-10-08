import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { useId } from "react";

const datePickerVariants = cva(
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

interface DatePickerFloatingLabelProps
	extends VariantProps<typeof datePickerVariants> {
	placeholder?: string;
	value?: Date;
	onValueChange?: (date: Date | undefined) => void;
	variant?: "dark" | "default";
	disabled?: boolean;
}

const DatePickerFloatingLabel = React.forwardRef<
	HTMLButtonElement,
	DatePickerFloatingLabelProps
>(
	(
		{
			placeholder = "Выберите дату",
			value,
			onValueChange,
			variant = "default",
			disabled = false,
		},
		ref
	) => {
		const id = useId();
		const [isOpen, setIsOpen] = React.useState(false);

		const hasValue = Boolean(value);

		return (
			<div className="group relative w-full">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button
							ref={ref}
							className={cn(
								datePickerVariants({ variant }),
								"flex items-center justify-start",
								hasValue ? "pt-6 pb-2" : "py-4",
								"peer"
							)}
							disabled={disabled}
						>
							<span
								className={cn(
									"text-left text-black flex-1",
									!value && "text-muted-foreground"
								)}
							>
							{value ? format(value, "PPP", { locale: ru }) : ""}
							</span>
							<CalendarIcon
								className={cn(
									"h-4 w-4 opacity-50 absolute right-5 top-1/2 -translate-y-1/2",
									variant === "dark" ? "text-white" : "text-muted-foreground"
								)}
							/>
						</Button>
					</PopoverTrigger>

					<label
						htmlFor={id}
						className={cn(
							"pointer-events-none absolute left-3 z-10  px-1 text-sm transition-all duration-200",

							!hasValue &&
								!isOpen &&
								"top-1/2 -translate-y-1/2 text-muted-foreground",
							(hasValue || isOpen) &&
								"top-3 -translate-y-0 text-xs font-medium text-foreground",
							disabled && "cursor-not-allowed opacity-50"
						)}
					>
						{placeholder}
					</label>

					<PopoverContent className="w-auto p-0" align="start">
							<Calendar
							mode="single"
							selected={value}
							onSelect={(date) => {
								onValueChange?.(date);
								setIsOpen(false);
							}}
							disabled={(date) => date < new Date()}
							className="bg-white rounded-2xl"
						/>
					</PopoverContent>
				</Popover>
			</div>
		);
	}
);

DatePickerFloatingLabel.displayName = "DatePickerFloatingLabel";

export { DatePickerFloatingLabel };
