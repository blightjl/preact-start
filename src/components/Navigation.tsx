import { NAV_LINKS } from '../consts';
import styles from '../styles/components/navigation.module.css';
import { classNames } from '../utils/class-names';

interface Props {
	currentPath: string;
}

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export default function Navigation({ currentPath }: Props) {
	const current = normalize(currentPath);

	return (
		<nav class={classNames(styles.navbarBanner, styles.navbar)} aria-label="Main">
			<ul>
				{NAV_LINKS.map(({ label, href }) => (
					<li key={href}>
						<a href={href} aria-current={current === href ? 'page' : undefined}>
							{label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
