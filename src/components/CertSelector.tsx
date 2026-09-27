import styles from '../styles/components/cert-selector.module.css';
import type { CertificateInfo } from './Certificate';

interface Props {
	certificates: CertificateInfo[];
	currentCertificateId: string;
	onSelect: (id: string) => void;
}

export default function CertSelector({ certificates, currentCertificateId, onSelect }: Props) {
	return (
		<div class={styles.certificates}>
			<ul>
				{certificates.map(({ id, issuer }) => {
					const active = id === currentCertificateId;
					const activeClass = active ? styles.active : undefined;
					return (
						<li key={id}>
							<button
								type="button"
								class={activeClass}
								aria-pressed={active}
								onClick={() => onSelect(id)}
							>
								<span class={activeClass}>{issuer}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
