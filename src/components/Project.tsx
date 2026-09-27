import type { ComponentChildren } from 'preact';
import expand from '../animations/hover-expand.module.css';
import styles from '../styles/components/project.module.css';
import { classNames } from '../utils/class-names';

interface Props {
	title: string;
	year: number;
	technologies: string[];
	link?: string;
	/** The rendered Markdown description. */
	children: ComponentChildren;
}

export default function Project({ title, year, technologies, link, children }: Props) {
	return (
		// tabIndex lets keyboard users expand the row (see :focus-within in hover-expand).
		<article class={classNames(styles.rectangle, expand.container)} tabIndex={0}>
			<div class={styles.line}>
				<h2 class={classNames(styles.projectTitle, styles.left)}>{title}</h2>
				<span class={classNames(styles.projectTitle, styles.right)}>{year}</span>
			</div>
			<div class={classNames(styles.additionalContent, expand.reveal, styles.projectDescription)}>
				{children}
			</div>
			<div class={styles.line}>
				<div class={classNames(styles.additionalContent, expand.reveal, styles.left)}>
					TECH STACK USED: {technologies.join(', ')}
				</div>
				{link && (
					<a
						class={classNames(styles.additionalContent, expand.reveal, styles.right)}
						href={link}
						target="_blank"
						rel="noopener noreferrer"
					>
						GITHUB
					</a>
				)}
			</div>
		</article>
	);
}
