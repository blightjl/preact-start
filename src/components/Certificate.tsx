import styles from '../styles/components/certificate.module.css';
import { classNames } from '../utils/class-names';

export interface CertificateInfo {
	id: string;
	issuer: string;
	dateAcquired: string;
	expirationDate: string;
	credentialLink?: string;
}

interface Props {
	certificateInfo: CertificateInfo;
	active: boolean;
}

export default function Certificate({ certificateInfo, active }: Props) {
	return (
		<div class={classNames(styles.card, active && styles.active)}>
			<div>ISSUER: {certificateInfo.issuer}</div>
			<div>DATE ACQUIRED: {certificateInfo.dateAcquired}</div>
			<div>EXPIRATION DATE: {certificateInfo.expirationDate}</div>
			<div>
				CREDENTIAL:{' '}
				{certificateInfo.credentialLink ? (
					<a href={certificateInfo.credentialLink} target="_blank" rel="noopener noreferrer">
						{certificateInfo.credentialLink}
					</a>
				) : (
					'N/A'
				)}
			</div>
		</div>
	);
}
