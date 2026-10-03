import { EnvelopeSimple, GithubLogo, LinkedinLogo, type Icon } from '@phosphor-icons/react';

export const EMAIL = 'mailto:leopold@rombaut.org';

export const SOCIALS: { name: string; url: string; icon: Icon }[] = [
  { name: 'GitHub', url: 'https://github.com/Loxed', icon: GithubLogo },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/leopold-rombaut', icon: LinkedinLogo },
  { name: 'Mail', url: EMAIL, icon: EnvelopeSimple },
];

export const isExternal = (url: string) => url.startsWith('http');
