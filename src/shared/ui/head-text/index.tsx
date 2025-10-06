import { cva, type VariantProps } from "class-variance-authority";
import type { FC } from "react";

interface Props extends VariantProps<typeof headTextVariants> {
	head: string;
	label: string;
	className?: string;
}

const headTextVariants = cva("flex flex-col items-start", {
	variants: {
		variant: {
			"white-gray": "[&_.head]:text-white [&_.label]:text-base-gray",
			"black-black": "[&_.head]:text-black [&_.label]:text-black",
			"black-gray": "[&_.head]:text-black [&_.label]:text-second-gray",
		},
		headSize: {
			sm: "[&_.head]:text-sm",
			base: "[&_.head]:text-base",
			lg: "[&_.head]:text-lg",
			xl: "[&_.head]:text-xl",
			"2xl": "[&_.head]:text-2xl",
		},
		labelSize: {
			xs: "[&_.label]:text-xs",
			sm: "[&_.label]:text-sm",
			md: "[&_.label]:text-md",
			base: "[&_.label]:text-base",
			lg: "[&_.label]:text-lg",
			xl: "[&_.label]:text-xl",
		},
		gap: {
			sm: "gap-0.5",
			md: "gap-1",
			lg: "gap-2",
		},
	},
	defaultVariants: {
		variant: "white-gray",
		headSize: "2xl",
		labelSize: "xs",
		gap: "sm",
	},
});

export const HeadText: FC<Props> = ({
	head,
	label,
	variant,
	headSize,
	labelSize,
	gap,
	className,
}) => {
	return (
		<div
			className={headTextVariants({
				variant,
				headSize,
				labelSize,
				gap,
				className,
			})}
		>
			<p className="font-medium head">{head}</p>
			<p className="label">{label}</p>
		</div>
	);
};
