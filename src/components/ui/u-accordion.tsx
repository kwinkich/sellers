import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface AccordionItemType {
	id: string;
	title: ReactNode;
	content: ReactNode;
	disabled?: boolean;
}

interface UniversalAccordionProps {
	items: AccordionItemType[];
	type?: "single" | "multiple";
	defaultValue?: string | string[];
	className?: string;
	itemClassName?: string;
	triggerClassName?: string;
	contentClassName?: string;
	collapsible?: boolean;
}

export const UniversalAccordion = ({
	items,
	type = "single",
	className,
	itemClassName,
	triggerClassName,
	contentClassName,
	collapsible = true,
}: UniversalAccordionProps) => {
	return (
		<Accordion
			type={type}
			collapsible={type === "single" ? collapsible : undefined}
			className={cn(
				"w-full space-y-2 bg-base-bg px-3 py-3 rounded-2xl",
				className
			)}
		>
			{items.map((item) => (
				<AccordionItem
					key={item.id}
					value={item.id}
					disabled={item.disabled}
					className={cn("rounded-md border", itemClassName)}
				>
					<AccordionTrigger className={cn("px-5", triggerClassName)}>
						{item.title}
					</AccordionTrigger>
					<AccordionContent
						className={cn("text-muted-foreground px-5", contentClassName)}
					>
						{item.content}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};
