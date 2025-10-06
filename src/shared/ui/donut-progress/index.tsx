import { cn } from "@/lib/utils";

interface DonutProgressProps {
	value: number;
	size?: number;
	fontSize?: string;
	strokeWidth?: number;
	className?: string;
	trackColor?: string;
	progressColor?: string;
	textColor?: string;
	showPercentage?: boolean;
}

export const DonutProgress = ({
	value,
	size = 60,
	strokeWidth = 6,
	fontSize = "12px",
	className,
	trackColor = "text-gray-200",
	progressColor = "text-green-500",
	textColor = "text-white",
	showPercentage = true,
}: DonutProgressProps) => {
	const normalizedValue = Math.max(0, Math.min(100, value));
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const progress = (normalizedValue / 100) * circumference;
	const dashArray = `${progress} ${circumference - progress}`;

	return (
		<div
			className={cn(
				"relative inline-flex items-center justify-center",
				className
			)}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="none"
					className={cn("opacity-30", trackColor)}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={dashArray}
					className={cn("transition-all duration-300", progressColor)}
				/>
			</svg>

			<div className="absolute inset-0 flex items-center justify-center">
				<span className={cn("font-semibold", textColor)} style={{ fontSize }}>
					{Math.round(normalizedValue)}
					{showPercentage && "%"}
				</span>
			</div>
		</div>
	);
};
