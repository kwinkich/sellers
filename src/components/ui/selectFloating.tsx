import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useId } from "react";

const selectFloatingVariants = cva(
	"h-16 rounded-2xl text-sm font-medium w-full min-w-0 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
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

interface SelectFloatingLabelProps
	extends React.ComponentProps<typeof Select>,
		VariantProps<typeof selectFloatingVariants> {
	placeholder?: string;
	value?: string;
	className?: string;
	onValueChange?: (value: string) => void;
	variant?: "dark" | "default";
	disabled?: boolean;
	options: Array<{
		value: string;
		label: string;
	}>;
}

const SelectFloatingLabel = React.forwardRef<
	HTMLButtonElement,
	SelectFloatingLabelProps
>(
	(
		{
			placeholder = "",
			value = "",
			onValueChange,
			variant = "default",
			disabled = false,
			options,
			className,
			...props
		},
		ref
	) => {
		const id = useId();
		const [isOpen, setIsOpen] = React.useState(false);
		const isLabelLifted = Boolean(value) || isOpen;

		return (
			<div className="group relative w-full grid">
				<Select
					value={value}
					onValueChange={onValueChange}
					disabled={disabled}
					onOpenChange={setIsOpen}
					{...props}
				>
					<SelectTrigger
						ref={ref}
						variant={variant}
						className={cn(
							selectFloatingVariants({ variant, className }),
							"pl-4 pr-10",
							"row-start-1 col-start-1",
							"flex items-center justify-start",
							isLabelLifted ? "pt-6 pb-2" : "py-4"
						)}
					>
						<SelectValue />
					</SelectTrigger>

					<label
						htmlFor={id}
						className={cn(
							"pointer-events-none row-start-1 col-start-1 z-10 self-start",
							"mx-3 mt-3 px-1  text-sm text-muted-foreground transition-all duration-200",
							!isLabelLifted && "self-center mt-0",
							isLabelLifted && "text-xs font-medium text-muted-foreground",
							disabled && "cursor-not-allowed opacity-50"
						)}
					>
						{placeholder}
					</label>

					<SelectContent className="rounded-2xl">
						{options.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								aria-label={option.label}
								className="py-3"
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}
);

SelectFloatingLabel.displayName = "SelectFloatingLabel";

export { SelectFloatingLabel };
