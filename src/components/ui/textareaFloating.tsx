import { cn } from "@/lib/utils";
import { useId, type ComponentProps, type FC } from "react";

interface TextareaFloatingLabelProps extends ComponentProps<"textarea"> {
	variant?: "dark" | "second" | "default";
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	disabled?: boolean;
	maxLength?: number;
	showCharCount?: boolean;
}

const TextareaFloatingLabel: FC<TextareaFloatingLabelProps> = ({
	variant = "default",
	placeholder = "",
	value,
	onChange,
	disabled = false,
	maxLength,
	showCharCount = true,
	className,
	...props
}) => {
	const id = useId();

	const getVariantClasses = () => {
		switch (variant) {
			case "dark":
				return "bg-[#1A1A1A] border-[#333333] text-white placeholder:text-base-gray focus-visible:border-[#06935F]";
			case "second":
				return "bg-[#F8F8F8] border-[#E5E5E5] text-black placeholder:text-base-gray focus-visible:border-[#06935F]";
			default:
				return "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-transparent";
		}
	};

	return (
		<div className="relative">
			<textarea
				id={id}
				data-slot="textarea"
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				disabled={disabled}
				maxLength={maxLength}
				className={cn(
					// shadcn/ui base textarea styles
					"flex field-sizing-content min-h-[100px] w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-sm",
					getVariantClasses(),
					className
				)}
				{...props}
			/>
			{showCharCount && maxLength !== undefined && (
				<div className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
					Осталось: {maxLength - ((value?.length as number) || 0)}
				</div>
			)}
		</div>
	);
};

export default TextareaFloatingLabel;
