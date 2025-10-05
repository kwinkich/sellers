import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useId, type ComponentProps, type FC } from "react";

interface InputFloatingLabelProps extends ComponentProps<"input"> {
	variant?: "dark" | "second" | "default";
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	type?: string;
	disabled?: boolean;
}

const InputFloatingLabel: FC<InputFloatingLabelProps> = ({
	variant = "default",
	placeholder = "",
	value = "",
	onChange,
	type = "text",
	disabled = false,
	className,
	...props
}) => {
	const id = useId();

	return (
		<div className="group relative w-full min-h-[64px]">
			<Input
				id={id}
				type={type}
				variant={variant}
				placeholder=" "
				value={value}
				onChange={onChange}
				disabled={disabled}
				className={cn(
					"peer h-16 pt-2",
					"flex items-start justify-start",
					className
				)}
				{...props}
			/>
			<label
				htmlFor={id}
				className={cn(
					"pointer-events-none absolute left-3 z-10  px-1 text-sm text-muted-foreground transition-all duration-200",
					`${
						variant !== "default"
							? "text-base-gray peer-focus:text-base-gray -not-placeholder-shown:text-base-gray"
							: "text-black peer-focus:text-foreground -not-placeholder-shown:text-foreground"
					}`,
					"top-1/2 -translate-y-1/2",
					"peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium ",
					"peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium ",
					"peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
				)}
			>
				{placeholder}
			</label>
		</div>
	);
};

export default InputFloatingLabel;
