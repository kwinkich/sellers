import { useId, type FC } from "react";

import { Input } from "@/components/ui/input";

interface InputFloatingLabelProps {
	variant?: "dark" | "default";
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
}) => {
	const id = useId();

	return (
		<div className="group relative w-full max-w-xs">
			<label
				htmlFor={id}
				className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
			>
				<span className="inline-flex px-1">{placeholder}</span>
			</label>
			<Input
				id={id}
				type={type}
				variant={variant}
				placeholder=" "
				value={value}
				onChange={onChange}
				disabled={disabled}
			/>
		</div>
	);
};

export default InputFloatingLabel;
