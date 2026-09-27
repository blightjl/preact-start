import { useState } from 'preact/hooks';
import styles from '../styles/components/certificate-display.module.css';
import Certificate, { type CertificateInfo } from './Certificate';
import CertSelector from './CertSelector';

interface Props {
	certificates: CertificateInfo[];
}

/** Interactive island: pick a certificate on the left, see its card on the right. */
export default function CertificateDisplay({ certificates }: Props) {
	const [currentCertificateId, setCurrentCertificateId] = useState(certificates[0]?.id ?? '');

	return (
		<div class={styles.displayCertificates}>
			<div class={styles.leftDisplay}>
				<CertSelector
					certificates={certificates}
					currentCertificateId={currentCertificateId}
					onSelect={setCurrentCertificateId}
				/>
			</div>
			<div class={styles.rightDisplay}>
				<div class={styles.carousel} aria-live="polite">
					{certificates.map((certificate) => (
						<Certificate
							key={certificate.id}
							certificateInfo={certificate}
							active={certificate.id === currentCertificateId}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
